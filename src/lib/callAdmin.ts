const API_PREFIX = import.meta.env.VITE_API_PREFIX ?? '/api';

export async function callAdmin(dto: {
  orderId: number | string;
  buyerWallet: string;
  sellerWallet: string;
}) {
  const res = await fetch(`${API_PREFIX}/platform/call-tg-bot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...dto,
      orderUrl: `${window.location.origin}/deal/${dto.orderId}`,
    }),
  });

  if (!res.ok) throw new Error(await res.text());
}
