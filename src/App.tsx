
import "./App.css";
import { Routes, Route } from 'react-router-dom'
import P2PMarket from "./components/p2p/P2PMarket";
import Header from "./components/header/header";
import { useEffect, useState } from 'react'

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
    <div className="App">
      <Header onToggleTheme={toggleTheme} currentTheme={theme} />

      <Routes>
        <Route path="/market-p2p-orders" element={<P2PMarket />} />
      </Routes>
    
    </div>
  );
}

export default App;
