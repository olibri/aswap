import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'

import * as buffer from "buffer";
import 'process';                
import { OrdersBadgeProvider } from './context/OrdersBadgeContext.tsx';

window.Buffer = buffer.Buffer

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <OrdersBadgeProvider>
      <App />
    </OrdersBadgeProvider>
  </BrowserRouter>,
)
