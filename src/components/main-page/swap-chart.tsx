// import React, { useEffect } from 'react';
import './swap-chart.css';

// type ChartPoint = {
//   date: string;
//   price: number;
// };

const SwapChart: React.FC = () => {

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const res = await fetch(
  //         'https://api.coingecko.com/api/v3/coins/solana/market_chart?vs_currency=usd&days=90'
  //       );
  //       const json = await res.json();

  //       const parsedData: ChartPoint[] = json.prices.map(
  //         ([timestamp, price]: [number, number]) => ({
  //           date: new Date(timestamp).toLocaleDateString('uk-UA'),
  //           price,
  //         })
  //       );

  //       setData(parsedData);
  //     } catch (err) {
  //       console.error('Failed to fetch chart data:', err);
  //     }
  //   })();
  // }, []);

  return (
    <div className="home">

      {/* HERO / DASHBOARD */}
      <section className="hero">
        <div className="hero-glow" />
        <h1>P2P DEX made simple</h1>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        <div className="hero-actions">
          <a href="/create-order" className="btn accent">Create offer</a>
          <a href="/market-p2p-orders" className="btn ghost">Browse market</a>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="hiw">
        <h2>How it works</h2>
        <div className="hiw-grid">
          <article>
            <span className="index">01</span>
            <h3>Lock funds</h3>
            <p>Lorem ipsum dolor sit amet consectetur.</p>
          </article>
          <article>
            <span className="index">02</span>
            <h3>Counter‑sign</h3>
            <p>Fusce dapibus, tellus ac cursus commodo.</p>
          </article>
          <article>
            <span className="index">03</span>
            <h3>Release escrow</h3>
            <p>Donec ullamcorper nulla non metus auctor.</p>
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

    </div>
  );
};

export default SwapChart;
