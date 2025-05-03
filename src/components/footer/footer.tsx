import "./footer.css";

const coins = [
  { name: "Solana", src: "/icons/solana.svg" },
  { name: "USDC",   src: "/icons/usdc.svg" },
  { name: "USDT",   src: "/icons/usdt.svg" },
];

const wallets = [
  { name: "Phantom",  src: "/icons/phantom.svg" },
  { name: "Solflare", src: "/icons/solflare.svg" },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-section">
        <h4>Supported assets</h4>
        <ul className="icon-row">
          {coins.map(({ name, src }) => (
            <li key={name} title={name}>
              <img src={src} alt={name} />
            </li>
          ))}
        </ul>
      </div>

      <div className="footer-section">
        <h4>Wallets</h4>
        <ul className="icon-row">
          {wallets.map(({ name, src }) => (
            <li key={name} title={name}>
              <img src={src} alt={name} />
            </li>
          ))}
        </ul>
      </div>

      <p className="copyright">
        © 2025 P2P DEX&nbsp;&nbsp;·&nbsp;&nbsp;All rights reserved
      </p>
    </footer>
  );
}
