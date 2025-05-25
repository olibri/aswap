import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale } from 'lucide-react';
import { useOffers } from '../../hooks/useOffers';
import { EscrowOrderDto } from '../../types/offers';
import { useEscrowActions } from '../../lib/escrowActions';
import './p2p.css'; // Assuming you have a CSS file for styles
const TOKENS = [
  { name: 'USDC', mint: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr' },
  { name: 'SOL',  mint: 'So11111111111111111111111111111111111111112' },
];

const P2PMarket: React.FC = () => {
  /* ------- data & actions -------- */
  const { offers, loading, error } = useOffers(30000);
  const { claimWhole, claimPartial } = useEscrowActions();

  /* ------- ui state -------- */
  const [filter, setFilter]       = useState<'all' | 'buy' | 'sell'>('all');
  const [modal, setModal]         = useState<EscrowOrderDto | null>(null);
  const [customAmt, setCustomAmt] = useState('');
  const navigate = useNavigate();

  const filtered = offers.filter(o =>
    filter === 'all' ? true : filter === 'buy' ? o.offerSide === 1 : o.offerSide === 0,
  );

  /* ------- handlers -------- */
  const closeModal = () => { setModal(null); setCustomAmt(''); };

  const handleWhole = async () => {
    if (!modal) return;
    await claimWhole(modal);
    closeModal();
    navigate(`/swap/${modal.id}`, { state: modal });
  };

  const handlePartial = async () => {
    if (!modal) return;
    const amt = Number(customAmt);
    if (isNaN(amt) || amt <= 0 || amt > modal.amount) return;
    await claimPartial(modal, amt, 1); /* TODO: реальний nonce */
    closeModal();
    navigate(`/swap/${modal.id}`, { state: modal });
  };

  /* ------- render -------- */
  if (loading) return <p className="p2p-market">Loading…</p>;
  if (error)   return <p className="p2p-market">Error: {error}</p>;

  return (
    <>
      <section className="p2p-market">
        {/* Header */}
        <div className="market-header">
          <h2 className="primary">
            <Scale size={18} style={{ marginRight: 8 }} />
            P2P Market
          </h2>
          <button className="create-order-button" onClick={() => navigate('/create-order')}>
            + Create Order
          </button>
        </div>

        {/* Filters */}
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
            <select onChange={e => console.log('sort fiat', e.target.value)}>
              <option value="">Sort by Fiat</option>
              <option>USD</option><option>EUR</option><option>UAH</option>
            </select>
            <select onChange={e => console.log('sort amount', e.target.value)}>
              <option value="">Sort by Amount</option>
              <option value="asc">Low → High</option>
              <option value="desc">High → Low</option>
            </select>
          </div>
        </div>

        {/* Orders */}
        {filtered.length === 0 ? (
          <p style={{ padding: 20, textAlign: 'center', color: '#aaa' }}>
            No offers found for this filter.
          </p>
        ) : (
          filtered.map(o => {
            const isBuy  = o.offerSide === 1;
            const token  = TOKENS.find(t => t.mint === o.tokenMint)?.name ?? 'TOKEN';
            const seller = o.sellerCrypto
              ? `${o.sellerCrypto.slice(0, 4)}…${o.sellerCrypto.slice(-4)}`
              : 'Unknown';

            return (
              <div key={o.id} className={`p2p-order-card ${isBuy ? 'buy' : 'sell'}`}>
                <div className="order-top">
                  <div className="order-title">
                    <span className="side-label">{isBuy ? 'Buy' : 'Sell'}</span>
                    <span className="amount">{o.amount} {token}</span>
                  </div>
                  <div className="order-price">Price: {o.price} {o.fiatCode}</div>
                </div>

                <div className="order-footer">
                  <span className="seller">From: {seller}</span>
                  <button className="swap-btn" onClick={() => setModal(o)}>Swap</button>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="modal-title">Claim Offer #{modal.id}</h3>
            <p className="modal-sub">Available: {modal.amount} USDC</p>

            <button className="modal-btn-full" onClick={handleWhole}>
              Take the whole amount
            </button>

            <div className="modal-input-row">
              <input
                type="number"
                placeholder="Custom amount"
                value={customAmt}
                onChange={e => setCustomAmt(e.currentTarget.value)}
                className="modal-input"
              />
              <button
                className="modal-btn-claim"
                disabled={!customAmt}
                onClick={handlePartial}
              >
                Claim
              </button>
            </div>

            <button className="modal-cancel" onClick={closeModal}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
};

export default P2PMarket;
