import React from 'react'
import './header.css'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

type Props = {
  onToggleTheme: () => void
  currentTheme: 'light' | 'dark'
}

const Header: React.FC<Props> = ({ onToggleTheme, currentTheme }) => {
  return (
    <header className="header">
      <div className="logo primary">
        <img src="/2.svg" alt="P2P DEX Logo" className="logo-img" />
        P2P DEX
      </div>
      <nav className="nav">
        <a href="/market-p2p-orders">Market</a>
        <a href="#">My Orders</a>
        <a href="#">Stats</a>
        <a href="#">Docs</a>
      </nav>

      <div className="right">
        <button className="theme-toggle" title="Toggle theme" onClick={onToggleTheme}>
            {currentTheme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* <div className="custom-wallet-button"> */}
            <WalletMultiButton />
        {/* </div> */}
        </div>
    </header>
  )
}

export default Header
