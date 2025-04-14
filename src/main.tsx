import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'

import * as buffer from "buffer";
import 'process';                

window.Buffer = buffer.Buffer

createRoot(document.getElementById('root')!).render(
  <BrowserRouter> {}
    <App />
  </BrowserRouter>,
)
