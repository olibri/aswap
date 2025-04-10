import "./App.css";
import { Routes, Route } from 'react-router-dom'
import P2PMarket from "./components/p2p/P2PMarket";
import Header from "./components/header/header";
import { useEffect, useState } from 'react'
import '@solana/wallet-adapter-react-ui/styles.css';
import { WalletConnectionProvider } from "./components/wallet/wallet-connection-provider";
import SwapPage from "./components/p2p/swap/SwapPage";

function App() {

  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved)
    }
  }, [])

  useEffect(() => {
    document.body.className = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }


  return (
    <WalletConnectionProvider>
    <div className="App">
      <Header onToggleTheme={toggleTheme} currentTheme={theme} />

      <Routes>
        <Route path="/market-p2p-orders" element={<P2PMarket />} />
        <Route path="/swap/:id" element={<SwapPage />} />
      </Routes>
    
    </div>
    </WalletConnectionProvider>
  );
}

export default App;
