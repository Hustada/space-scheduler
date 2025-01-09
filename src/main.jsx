import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import BlackHoleTest from './pages/BlackHoleTest.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/black-hole-test" element={<BlackHoleTest />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
