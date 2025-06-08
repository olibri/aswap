/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from 'react';
import type { EscrowOrderDto } from '../types/offers';
import { useEscrowProgram } from '../hook/useEscrowProgram';
// const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/platform';

const API = import.meta.env.VITE_API_PREFIX ?? '/api';


type Timer = ReturnType<typeof setInterval>;
export function useOffers(pollMs = 30000) {
  const program = useEscrowProgram();                       
  const [offers, setOffers] = useState<EscrowOrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const timer = useRef<Timer | null>(null);

  const fetchOffers = async (signal?: AbortSignal) => {
    try {
      const res = await fetch(`${API}/platform/all-new-offers`, { signal });
      if (!res.ok) throw new Error(res.statusText);

      const raw = (await res.json()) as EscrowOrderDto[];
      const enriched = await Promise.all(
         raw.map(async o => {
          if (!program) return o;
          const acc: any = await (program.account as any).escrowAccount.fetch(o.escrowPda);
          return {
            ...o,
            vault:      acc.vaultAccount.toBase58(),
            remaining:  Number(acc.remainingAmount),
          };
        })
      );
      setOffers(enriched);
      setError(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      if (e.name !== 'AbortError') setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchOffers(controller.signal);

    timer.current = setInterval(() => fetchOffers(), pollMs);
    return () => {
      controller.abort();
      if (timer.current) clearInterval(timer.current);
        };
  }, [pollMs]);

  return { offers, loading, error };
}