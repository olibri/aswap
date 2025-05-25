import "./App.css";
import { Routes, Route } from 'react-router-dom'
import P2PMarket from "./components/p2p/P2PMarket";
import Header from "./components/header/header";
import { useEffect, useState } from 'react'
import '@solana/wallet-adapter-react-ui/styles.css';
import SwapPage from "./components/p2p/swap/SwapPage";
import CreateOrderPage from "./components/p2p/create-order/CreateOrderPage";
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import SwapChart from "./components/main-page/swap-chart";
import Footer from "./components/footer/footer";
import { ThemeProvider, createTheme } from '@mui/material';


function App() {
  console.log('Buffer?', typeof Buffer, Buffer?.from?.name);

  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  const endpoint = 'https://api.devnet.solana.com';
  const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];
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
  const muiTheme = createTheme({
    palette: {
      mode: theme,
      background: {
        default: theme === 'dark' ? '#1e1e1e' : '#f9f9f9',
        paper: theme === 'dark' ? '#27292F' : '#ffffff',
      },
      primary: {
        main: '#F3EF52',
        contrastText: '#27292F',
      },
      text: {
        primary: theme === 'dark' ? '#ffffff' : '#1e1e1e',
        secondary: theme === 'dark' ? '#aaa' : '#444',
      },
    },
  });


  return (
    <ThemeProvider theme={muiTheme}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider  wallets={wallets} autoConnect>
          <WalletModalProvider>
            <div className="App">
              <Header onToggleTheme={toggleTheme} currentTheme={theme} />
                <main className="AppMain">
                  <Routes>
                    <Route path="/" element={<SwapChart />} />
                    <Route path="/market-p2p-orders" element={<P2PMarket />} />
                    <Route path="/swap/:id" element={<SwapPage />} />
                    <Route path="/create-order" element={<CreateOrderPage />} />
                  </Routes>
              </main>
              <Footer/>
            </div>
          </WalletModalProvider>
        </WalletProvider >
      </ConnectionProvider>
    </ThemeProvider>
  );
}

export default App;
