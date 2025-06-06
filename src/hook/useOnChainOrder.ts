// hooks/useOnChainOrder.ts
import { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useEscrowProgram } from './useEscrowProgram';
import { EscrowAccount } from '../types/escrow-account';
import { decodeEscrow } from '../lib/decodeEscrow';

export function useOnChainOrder(escrowPda?: string) {
  const program = useEscrowProgram();
  const [data, setData] = useState<EscrowAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr]       = useState<Error | null>(null);

  useEffect(() => {
    if (!program || !escrowPda) return;

    setLoading(true);
    (async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw = await (program.account as any).escrowAccount.fetch(new PublicKey(escrowPda));
        setData(decodeEscrow(raw));
        setErr(null);
      } catch (e) {
        setErr(e as Error);
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [program, escrowPda]);
  
  return { data, loading, error: err };
}
