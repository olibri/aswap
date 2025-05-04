import React, { useState } from 'react';
import './p2p.css';
import { useNavigate } from 'react-router-dom';
import { useOffers } from '../../hooks/useOffers';

const P2PMarket: React.FC = () => {
  const { offers, loading, error } = useOffers(30000); // 30с
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all');
  const navigate = useNavigate();

  // фільтр
  const filtered = offers.filter(o =>
    filter === 'all' ? true : filter === 'buy' ? o.price < 1 : o.price >= 1
  );

  if (loading) return <p className="p2p-market">Loading…</p>;
  if (error)   return <p className="p2p-market">Error: {error}</p>;

  return (
    <div className="p2p-market">
      {/* header */}
      <div className="market-header">
        <h2 className="primary">🧾 P2P Market</h2>
        <button
          className="create-order-button"
          onClick={() => navigate('/create-order')}
        >
          + Create Order
        </button>
      </div>

      {/* filter */}
      <div className="filter-buttons">
        {(['all','buy','sell'] as const).map(t => (
          <button
            key={t}
            className={filter === t ? 'active' : ''}
            onClick={() => setFilter(t)}
          >
            {t[0].toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {/* list */}
      {filtered.map(o => (
        <div key={o.id} className="p2p-exchange-row">
          <div className="user-col">
            <div className="username">{o.seller}</div>
            {/* rating / gold можна винести окремо */}
          </div>
          <div className="limit-col">
            <div>From <b>{o.amount}</b> {o.fiatCode}</div>
            <div>Rate<b>{o.price}</b></div>
          </div>
          <div className="action-col">
            <button
              className="exchange-btn"
              onClick={() => navigate(`/swap/${o.id}`)}
            >
              Swap
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default P2PMarket;
