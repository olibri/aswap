/* eslint-disable @typescript-eslint/no-explicit-any */
// hook/useBuyerPendingOrders.ts
import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { utils, BN } from '@coral-xyz/anchor';
import { useEscrowProgram } from './useEscrowProgram';

const bs58 = utils.bytes.bs58;

export const useBuyerPendingOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { publicKey } = useWallet();
  const program = useEscrowProgram();

  const filters = useCallback(() => {
    if (!publicKey) return [];

    const buf = Buffer.alloc(2);
    buf[0] = 0; // buyer_signed = 0
    buf[1] = 0; // seller_signed = 0

    return [
      { memcmp: { offset: 40, bytes: publicKey.toBase58() } }, // buyer == wallet
      { memcmp: { offset: 160, bytes: bs58.encode(buf) } },    // flags
      { memcmp: { offset: 163, bytes: bs58.encode(Buffer.from([0])) } }, // not canceled
    ];
  }, [publicKey]);

  const fetchAll = useCallback(async () => {
    if (!publicKey || !program) return;
    setLoading(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const accs = await (program.account as any).escrowAccount.all(filters());

    setOrders(
      accs.map((a: any) => {
        const acc = a.account;
        const fiat = new TextDecoder()
          .decode(acc.fiatCode instanceof Uint8Array ? acc.fiatCode : new Uint8Array(acc.fiatCode))
          .replace(/\0/g, '');

        return {
          id: crypto.randomUUID(),
          dealId: (acc.dealId as BN).toString(),
          escrowPda: a.publicKey,
          sellerCrypto: acc.seller.toBase58(),
          amount: Number(acc.amount),
          price: Number(acc.price),
          fiatCode: fiat,
          tokenMint: acc.tokenMint.toBase58(),
        };
      })
    );
    setLoading(false);
  }, [program, publicKey, filters]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { orders, loading, refresh: fetchAll };
};
