import "./footer.css";

const icons = [
  { name: "Solana", src: "/icons/solana.svg" },
  { name: "USDC", src: "/icons/usdc.svg" },
  { name: "USDT", src: "/icons/usdt.svg" },
  { name: "Phantom", src: "/icons/phantom.svg" },
  { name: "Solflare", src: "/icons/solflare.svg" },
];

const socials = [
  { name: "Telegram", href: "https://t.me/your_project", icon: "/icons/telegram.svg" },
  { name: "Twitter", href: "https://twitter.com/your_project", icon: "/icons/twitter.svg" },
  { name: "Email", href: "mailto:support@yourproject.com", icon: "/icons/email.svg" },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        
        {/* LEFT: icons */}
        <ul className="icon-row">
          {icons.map(({ name, src }) => (
            <li key={name} title={name}>
              <img src={src} alt={name} />
            </li>
          ))}
        </ul>

        {/* CENTER: text */}
        <div className="footer-center">
          <p>© {new Date().getFullYear()} P2P DEX · All rights reserved</p>
        </div>

        {/* RIGHT: socials */}
        <ul className="icon-row social-row">
          {socials.map(({ name, href, icon }) => (
            <li key={name}>
              <a href={href} target="_blank" rel="noopener noreferrer" title={name}>
                <img src={icon} alt={name} />
              </a>
            </li>
          ))}
        </ul>

      </div>
    </footer>
  );
}
