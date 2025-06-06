/* components/OrderCard.tsx
   Повністю готовий компонент картки з on-chain залишком */

import React, { useMemo } from 'react';
import { EscrowOrderDto } from '../../../types/offers';
import { useOnChainOrder } from '../../../hook/useOnChainOrder';

/* —­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­ util/константи — */
const TOKENS = [
  { name: 'USDC', mint: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr', decimals: 6 },
  { name: 'SOL',  mint: 'So11111111111111111111111111111111111111112', decimals: 9 },
];

const getDecimals = (mint: string) =>
  TOKENS.find(t => t.mint === mint)?.decimals ?? 9;
/* —­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­ — */

interface Props {
  order:  EscrowOrderDto;
  onSwap?: (o: EscrowOrderDto, remaining: number) => void;     // клік «Swap» (опціонально)
}

export const OrderCard: React.FC<Props> = ({ order, onSwap }) => {
  /* он-chain метадані акаунта */
  const { data, loading } = useOnChainOrder(order.escrowPda);

  /* залишок у людському вигляді */
  const remaining = useMemo(() => {
    if (loading || !data) return order.amount;               // fallback
    const dec = getDecimals(order.tokenMint);
    return Number(data.remainingAmount) / 10 ** dec;
  }, [loading, data, order]);

  const token   = TOKENS.find(t => t.mint === order.tokenMint)!;
  const isBuy   = order.offerSide === 1;
  const seller  = order.sellerCrypto
    ? `${order.sellerCrypto.slice(0, 4)}…${order.sellerCrypto.slice(-4)}`
    : 'Unknown';

  return (
    <div className={`p2p-order-card ${isBuy ? 'buy' : 'sell'}`}>
      <div className="order-top">
        <div className="order-title">
          <span className="side-label">{isBuy ? 'Buy' : 'Sell'}</span>
          <span className="amount">
            {remaining} {token.name}
          </span>
        </div>

        <div className="order-price">
          Price: {order.price} {order.fiatCode}
        </div>
      </div>

      <div className="order-footer">
        <span className="seller">From: {seller}</span>
        {onSwap && (
          <button className="swap-btn" onClick={() => onSwap(order, remaining)}>
            Swap
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
