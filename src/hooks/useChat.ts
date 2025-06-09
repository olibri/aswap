/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageDto } from '../types/chat';

const API = import.meta.env.VITE_API_PREFIX ?? '/api';


type Timer = ReturnType<typeof setInterval>;

/**
 * @param dealId    ulong з ордера
 * @param accountId гаманець поточного користувача
 * @param pollMs    інтервал poll-у (мс)
 */
export function useChat(dealId: number | undefined,
                        accountId: string | undefined,
                        pollMs = 5_000) {
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const timer = useRef<Timer | null>(null);

  /* GET -------------------------------------------------------- */
  const fetchMessages = async (signal?: AbortSignal) => {
    if (!dealId) return;
    try {
      const res = await fetch(`${API}/chat/rooms/${dealId}/messages`, { signal });
      if (!res.ok) throw new Error(res.statusText);

      const data = (await res.json()) as MessageDto[];
      setMessages(
        data.sort(
          (a, b) =>
            Date.parse(a.createdAtUtc ?? '') -
            Date.parse(b.createdAtUtc ?? ''),
        ),
      );
      setError(null);
    } catch (e: any) {
      if (e.name !== 'AbortError') setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  /* POST ------------------------------------------------------- */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!dealId || !accountId || !content.trim()) return;

      const optimistic: MessageDto = {
        dealId,
        accountId,
        content,
        createdAtUtc: new Date().toISOString(),
      };
      setMessages((cur) => [...cur, optimistic]);

      try {
        const res = await fetch(`${API}/chat/add-messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(optimistic),
        });
        if (!res.ok) throw new Error(await res.text());

        fetchMessages(); // підтягнути «реальний» час з БЕ
      } catch (e: any) {
        setMessages((cur) => cur.filter((m) => m !== optimistic));
        setError(e.message);
      }
    },
    [dealId, accountId],
  );

  /* polling ---------------------------------------------------- */
  useEffect(() => {
    const ctrl = new AbortController();
    fetchMessages(ctrl.signal);

    timer.current = setInterval(fetchMessages, pollMs);
    return () => {
      ctrl.abort();
      if (timer.current) clearInterval(timer.current);
    };
  }, [dealId, pollMs]);

  return { messages, loading, error, sendMessage };
}
