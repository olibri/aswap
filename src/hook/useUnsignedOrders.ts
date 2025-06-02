// hook/useUnsignedOrders.ts
import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { utils } from '@coral-xyz/anchor';
import { useEscrowProgram } from './useEscrowProgram';


const bs58 = utils.bytes.bs58;

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
    const accs = await (program!.account as any)['escrowAccount'].all(makeFilters());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setOrders(accs.map((a: { account: any; publicKey: any; }) => ({ ...a.account, escrowPda: a.publicKey })));
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