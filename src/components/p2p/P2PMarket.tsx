import React, { useState } from 'react';
import './p2p.css';
import { useNavigate } from 'react-router-dom';
import { useOffers } from '../../hooks/useOffers';
import { Scale } from 'lucide-react';

const P2PMarket: React.FC = () => {
  const { offers, loading, error } = useOffers(30000); // 30с
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all');
  const navigate = useNavigate();

const filtered = offers.filter(o =>
  filter === 'all'
    ? true
    : filter === 'buy'
    ? o.offerSide === 1
    : o.offerSide === 0
);

  if (loading) return <p className="p2p-market">Loading…</p>;
  if (error)   return <p className="p2p-market">Error: {error}</p>;

  return (
    <div className="p2p-market">
      {/* header */}
      <div className="market-header">
        <h2 className="primary">
          <Scale size={18} style={{ marginRight: '8px' }} />
          P2P Market
        </h2>
        <button
          className="create-order-button"
          onClick={() => navigate('/create-order')}
        >
          + Create Order
        </button>
      </div>

      <div className="filter-bar">
        <div className="filter-buttons">
          {(['all', 'buy', 'sell'] as const).map(t => (
            <button
              key={t}
              className={filter === t ? 'active' : ''}
              onClick={() => setFilter(t)}
            >
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="filter-selects">
          <select onChange={(e) => console.log('sort fiat', e.target.value)}>
            <option value="">Sort by Fiat</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="UAH">UAH</option>
          </select>

          <select onChange={(e) => console.log('sort amount', e.target.value)}>
            <option value="">Sort by Amount</option>
            <option value="asc">Low → High</option>
            <option value="desc">High → Low</option>
          </select>
        </div>
      </div>


      {/* list */}
      {filtered.length === 0 ? (
        <div style={{ padding: '20px', color: '#aaa', textAlign: 'center' }}>
          No offers found for this filter.
        </div>
      ) : (
        filtered.map(o => {
          console.log('offerType:----->', o.offerSide);
          const isBuy = o.offerSide=== 1;
          const sideLabel = isBuy ? 'Buy' : 'Sell';

          const sellerDisplay = o.sellerCrypto
            ? `${o.sellerCrypto.slice(0, 4)}...${o.sellerCrypto.slice(-4)}`
            : 'Unknown';

          return (
            <div key={o.id} className={`p2p-order-card ${isBuy ? 'buy' : 'sell'}`}>
              <div className="p2p-order-top">
                <span className="order-type">{sideLabel}</span>
                <span className="rate">
                  {o.price} {o.fiatCode}
                </span>
              </div>
              <div className="p2p-order-middle">
                <span className="amount-label">Amount:</span>
                <span className="amount-value">{o.amount}</span>
              </div>
              <div className="p2p-order-bottom">
                <span className="user">{sellerDisplay}</span>
                <button
                  className="swap-btn"
                  onClick={() => navigate(`/swap/${o.id}`)}
                >
                  Swap
                </button>
              </div>
            </div>
          );
        })
      )}

    </div>
  );
};

export default P2PMarket;
