import './swap-chart.css';
import FloatIcon from "./floatIcon";
import { useLatestDeals } from '../../hooks/useLatestDeals';
import { Link } from 'react-router-dom'; 

const SwapChart: React.FC = () => {
const { deals, loading } = useLatestDeals(5);                
  return (
    <div className="home">

      {/* HERO / DASHBOARD */}
      <section className="hero">
      <div className="hero-glow" />
        <h1>P2P DEX made simple</h1>
        <div className="hero-actions">
          <a href="/create-order" className="btn accent">Create offer</a>
          <a href="/market-p2p-orders" className="btn ghost">Browse market</a>
        </div>
      <div className="floaties">
        <FloatIcon src="/flying/sol.svg"  initialX="10%" initialY="25%" />
        <FloatIcon src="/flying/usdc.svg" initialX="18%" initialY="65%" />
        <FloatIcon src="/flying/usdt.svg" initialX="78%" initialY="30%" />
        <FloatIcon src="/flying/card.svg" initialX="82%" initialY="70%" size={48} />
        <FloatIcon src="/flying/solflare.svg" initialX="55%" initialY="22%" size={48} />
        <FloatIcon src="/flying/phantom.svg" initialX="30%" initialY="40%" size={48} />

      </div>

      
      </section>
{/* HOW IT WORKS */}
<section className="hiw">
  <h2>How it works</h2>
  <div className="hiw-grid">
    <article>
      <span className="index">01</span>
      <h3>Lock funds</h3>
      <p>The buyer locks USDC or SOL into a secure on-chain escrow account.</p>
    </article>
    <article>
      <span className="index">02</span>
      <h3>Counter‑sign</h3>
      <p>The seller verifies the trade and signs to confirm the agreement.</p>
    </article>
    <article>
      <span className="index">03</span>
      <h3>Release escrow</h3>
      <p>Funds are automatically released once both sides fulfill their part.</p>
    </article>
  </div>
</section>


      {/* QUICK STATS / CTA */}
      <section className="stats">
        <div className="stat-card">
          <h3>$12.4M</h3>
          <p>Total volume</p>
        </div>
        <div className="stat-card">
          <h3>3542</h3>
          <p>Offers settled</p>
        </div>
        <div className="stat-card">
          <h3>0</h3>
          <p>Disputes outstanding</p>
        </div>
      </section>

<section className="latest">
        <h2>Latest deals</h2>

        {loading ? (
          <p>Loading…</p>
        ) : deals.length === 0 ? (
          <p>No recent activity.</p>
        ) : (
          <ul className="latest-list">
            {deals.map((d) => (
              <li key={d.dealId}>
                <Link to={`/swap/${d.dealId}`}>
                  <span className="pair">{d.fiatCode} / {d.tokenMint}</span>
                  <span className="amount">
                    {Number(d.amount) } {d.tokenMint}
                  </span>
                  <span className="price">
                    @ ${Number(d.price) / 100}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <div style={{ textAlign: 'center', marginTop: '1.4rem' }}>
          <Link to="/market-p2p-orders" className="btn ghost small">
            View full market →
          </Link>
        </div>
      </section>

    </div>
  );
};

export default SwapChart;
