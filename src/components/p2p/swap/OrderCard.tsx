import React, { useMemo } from 'react';
import { EscrowOrderDto } from '../../../types/offers';
import { useOnChainOrder } from '../../../hook/useOnChainOrder';

const TOKENS = [
  { name: 'USDC', mint: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr', decimals: 6 },
  { name: 'SOL',  mint: 'So11111111111111111111111111111111111111112', decimals: 9 },
];

const getDecimals = (mint: string) =>
  TOKENS.find(t => t.mint === mint)?.decimals ?? 9;
const shortPk = (pk?: string) =>
  pk && pk.length > 8 ? `${pk.slice(0, 4)}…${pk.slice(-4)}` : pk ?? 'Unknown';
interface Props {
  order:  EscrowOrderDto;
  onSwap?: (o: EscrowOrderDto, remaining: number) => void;
}

export const OrderCard: React.FC<Props> = ({ order, onSwap }) => {
  const { data, loading } = useOnChainOrder(order.escrowPda);
  const remaining = useMemo(() => {
    if (loading || !data) return order.amount;            
    const dec = getDecimals(order.tokenMint);
    return Number(data.remainingAmount) / 10 ** dec;
  }, [loading, data, order]);

if (!order.escrowPda) {
  const token = TOKENS.find(t => t.mint === order.tokenMint)!;
  const isBuy = true;
  const buyer = shortPk(order.buyerFiat!);
  return (
    <div className={`p2p-order-card ${isBuy ? 'buy' : 'sell'}`}>
      <div className="order-top">
        <div className="order-title">
          <span className="side-label">{isBuy ? 'Buy' : 'Sell'}</span>
          <span className="amount">
            {order.amount} {token.name}
          </span>
        </div>

        <div className="order-price">
          Price: {order.price || '-'} {order.fiatCode}
        </div>
      </div>

      <div className="order-footer">
        <span className="seller">From: {buyer}</span>
        {onSwap && (
          <button
            className="swap-btn"
            onClick={() => onSwap(order, Number(order.amount))}
          >
            Lock&nbsp;{token.name}
          </button>
        )}
      </div>
    </div>
  );
}


  const token   = TOKENS.find(t => t.mint === order.tokenMint)!;
  const isBuy   = order.offerSide === 1;
  const seller = shortPk(order.sellerCrypto);         
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
