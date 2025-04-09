import React from 'react'
import './header.css'

type Props = {
  onToggleTheme: () => void
  currentTheme: 'light' | 'dark'
}

const Header: React.FC<Props> = ({ onToggleTheme, currentTheme }) => {
  return (
    <header className="header">
      <div className="logo primary">🪙 P2P DEX</div>

      <nav className="nav">
        <a href="#">Market</a>
        <a href="#">My Orders</a>
        <a href="#">Stats</a>
        <a href="#">Docs</a>
      </nav>

      <div className="right">
        <button
          className="theme-toggle"
          title="Toggle theme"
          onClick={onToggleTheme}
        >
          {currentTheme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button className="connect-wallet">Connect Wallet</button>
      </div>
    </header>
  )
}

export default Header
