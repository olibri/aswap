import React, { useState } from "react";
import "./header.css";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

type Props = {
  onToggleTheme: () => void;
  currentTheme: "light" | "dark";
};

const Header: React.FC<Props> = ({ onToggleTheme, currentTheme }) => {
  const [open, setOpen] = useState(false);

  return (
    <header className="header">
      <div className="logo primary">
        <img src="/2.svg" alt="P2P DEX Logo" className="logo-img" />
        P2P DEX
      </div>

      {/* BURGER */}
      <button
        className={`burger ${open ? "open" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle navigation"
      >
        <span />
        <span />
        <span />
      </button>

      {/* DESKTOP NAV */}
      <nav className="nav desktop">
      <a href="/market-p2p-orders" onClick={() => setOpen(false)}>
          Online
        </a>
        <a href="#" onClick={() => setOpen(false)}>
          Offline
        </a>
        <a href="#" onClick={() => setOpen(false)}>
          Swap
        </a>
        <a href="/my-orders" onClick={() => setOpen(false)}>
          My orders
        </a>
      </nav>

      {/* RIGHT SIDE */}
      <div className="right">
        <button
          className="theme-toggle"
          title="Toggle theme"
          onClick={onToggleTheme}
        >
          {currentTheme === "dark" ? "☀️" : "🌙"}
        </button>
        <WalletMultiButton />
      </div>

      {/* MOBILE DRAWER */}
      <nav className={`nav drawer ${open ? "show" : ""}`}>
        <a href="/market-p2p-orders" onClick={() => setOpen(false)}>
          Online
        </a>
        <a href="#" onClick={() => setOpen(false)}>
          Offline
        </a>
        <a href="#" onClick={() => setOpen(false)}>
          Swap
        </a>
        <a href="/my-orders" onClick={() => setOpen(false)}>
          My orders
        </a>
      </nav>
    </header>
  );
};

export default Header;
