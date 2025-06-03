/* eslint-disable @typescript-eslint/no-explicit-any */
// hook/useUnsignedOrders.ts
import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { utils } from '@coral-xyz/anchor';
import { useEscrowProgram } from './useEscrowProgram';
import { PublicKey } from '@solana/web3.js';
import { pdaFill } from '../lib/escrowActions';
import { EscrowOrderDto } from '../types/offers';

const bs58 = utils.bytes.bs58;
const ZERO_PK = new PublicKey(0);
const isPartial = (acc: any) => !acc.parentOffer.equals(ZERO_PK);

function findNonce(
  offerPk: PublicKey,
  buyerPk: PublicKey,
  fillPk:  PublicKey,
  programId: PublicKey,
): number | undefined {
  for (let n = 0; n < 255; n++) {
    if (pdaFill(offerPk, buyerPk, n, programId).equals(fillPk)) return n;
  }
}

export const useUnsignedOrders = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const wallet  = useWallet();           // @solana/wallet-adapter
  const program = useEscrowProgram();    // повертає Program<Idl>

  /** додаєте сюди потрібні фільтри під кожен «режим» */
const makeFilters = useCallback(() => {
  if (!wallet.publicKey) return [];

  const buf = Buffer.alloc(2);      // buyer_signed & seller_signed
  buf[0] = 1;  // buyer_signed == true
  buf[1] = 0;  // seller_signed == false

  return [
    /* 1) seller == wallet */
    { memcmp: { offset: 8, bytes: wallet.publicKey.toBase58() } },

    /* 2) buyer_signed=1 & seller_signed=0 */
    { memcmp: { offset: 160, bytes: bs58.encode(buf) } },

    /* 3) is_canceled == 0 */
    { memcmp: { offset: 163, bytes: bs58.encode(Buffer.from([0])) } },
  ];
}, [wallet.publicKey]);

  const fetchOrders = useCallback(async () => {
    if (!program || !wallet?.publicKey) return;
    setLoading(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const accs = await (program!.account as any).escrowAccount.all(makeFilters());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
       
    setOrders(
  accs
    // потрібні акаунти: buyer_signed=1 && seller_signed=0
    .map((a: any) => {
      const acc = a.account;
      const dealBn = acc.dealId ?? acc.deal_id;            // BN
      const fiatBytes   = acc.fiatCode instanceof Uint8Array
              ? acc.fiatCode
              : new Uint8Array(acc.fiatCode);        

      const fiatDecoded = new TextDecoder()
        .decode(fiatBytes)
        .replace(/\0/g, '');

      const partial = isPartial(acc);

      return {
        /* ---------- DTO ---------- */
        id:             crypto.randomUUID(),                // або acc.key
        dealId:         dealBn.toString(),                  // string
        sellerCrypto:   acc.seller.toBase58(),
        amount:         Number(acc.amount),                 // показово
        price:          Number(acc.price),
        fiatCode:       fiatDecoded,
        tokenMint:      acc.tokenMint.toBase58(),
        offerSide:      acc.offerType,
        status:         'OnChain',
        isPartial:      partial,
        fillNonce:      partial ? findNonce(
                          acc.parentOffer,
                          acc.buyer,
                          a.publicKey,
                          program.programId) : undefined,
        parentOffer:    partial ? acc.parentOffer.toBase58() : undefined,
        fillPda:        partial ? a.publicKey.toBase58()     : undefined,

        /* што потрібно для підпису */
        escrowPda:      a.publicKey,
        vault:          acc.vaultAccount.toBase58(),
        vaultAuth:      '',          // дочитаємо у sellerSign
        buyerAta:       '',
      } satisfies Partial<EscrowOrderDto>;
    })
);

    // setOrders(
    //   accs
    //     .filter((a: any) => (a.account.dealId ?? a.account.deal_id) !== undefined) // ← відсікаємо старі
    //     .map((a: any) => ({
    //       ...a.account,
    //       dealId: (a.account.dealId ?? a.account.deal_id).toString(),      // string
    //       escrowPda: a.publicKey,
    //       sellerCrypto: a.account.seller.toBase58(),

    //     }))
    // );

    setLoading(false);
  }, [program, wallet, makeFilters]);

  /* initial load + manual refresh */
  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  /* live-оновлення (опційно) */
  useEffect(() => {
    if (!program || !wallet?.publicKey) return;
    const subId = program.provider.connection.onProgramAccountChange(
      program.programId,
      () => { fetchOrders(); },
      'confirmed',
      makeFilters()
    );
    return () => {
      program.provider.connection.removeProgramAccountChangeListener(subId);
    };
  }, [program, wallet, fetchOrders, makeFilters]);

  return { orders, loading, forceRefresh: fetchOrders };
};