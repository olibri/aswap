import { useEffect, useState } from 'react';
import type { EscrowOrderDto } from '../types/offers';

const API = import.meta.env.VITE_API_PREFIX ?? '/api';

export function useLatestDeals(limit = 5) {
  const [deals, setDeals] = useState<EscrowOrderDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/platform/latest-deals?limit=${limit}`);
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as EscrowOrderDto[];
        setDeals(data);
      } catch {
        /* можна додати setError */
      } finally {
        setLoading(false);
      }
    })();
  }, [limit]);

  return { deals, loading };
}
