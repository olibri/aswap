import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import './swap.css'
import SwapChart from './chart/SwapChart'

const dummyReviews = [
  { user: '0xPaul', rating: 5, comment: '🔥 All smooth!' },
  { user: '0xDima', rating: 2, comment: '😕 Took too long' },
  { user: '0xLina', rating: 4, comment: 'Good experience' },
  { user: '0xLina1', rating: 4, comment: '🔥 All smooth!' },
  { user: '0xfdina', rating: 5, comment: 'Good experience' },
  { user: '0xLhna', rating: 1, comment: '🔥 Good experience!' },
  { user: '0xgina', rating: 3, comment: 'Good experience' },
  { user: '0xfina', rating: 2, comment: '🔥 Good experience!' },
]

const renderStars = (count: number) => '★'.repeat(count) + '☆'.repeat(5 - count)

const SwapPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [timeLeft, setTimeLeft] = useState(15 * 60)
  const [messages, setMessages] = useState([
    { from: '0xBob', text: 'Привіт! Готовий до оплати?' },
    { from: 'you', text: 'Так, ще раз перевіряю суму.' },
  ])
  const [newMsg, setNewMsg] = useState('')

  const chartData = [
    { time: '10:00', value: 100 },
    { time: '10:10', value: 120 },
    { time: '10:20', value: 105 },
    { time: '10:30', value: 135 },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds: number) =>
    `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`

  const sendMessage = () => {
    if (newMsg.trim() === '') return
    setMessages([...messages, { from: 'you', text: newMsg }])
    setNewMsg('')
  }

  return (
    <div className="swap-page">
      <h2 className="primary"> Swap Order #{id}</h2>
      <div className="swap-topbar">
        <div className="pair">
            USD / SOL
        </div>
        <div className="status-block">
            <div className="status">Status: <b>Waiting for payment</b></div>
            <div className="timer">⏳ {formatTime(timeLeft)} until timeout</div>
        </div>
    </div>


      <div className="swap-grid">
        {/* Left Column */}
            <div className="left-column">
                <div className="user-info">
                <div className="username">👤 0xBob <span className="badge">Gold</span></div>
                <div>Rating: {renderStars(5)} (5.0)</div>
                <div>Trades: <b>134</b></div>
                <div>Joined: <b>Nov 2023</b></div>
                </div>
            <SwapChart data={chartData} />

            </div>

            <div className="right-column">
                <div className="section">
                    <div className="chat-header">
                    <h3 className="section-title">💬 Chat</h3>
                    <div className="chat-actions">
                        <button className="chat-btn danger">Cancel Deal</button>
                        <button className="chat-btn primary">Mark as Paid</button>
                    </div>
                    </div>
                <div className="chat-box">
                    {messages.map((msg, idx) => (
                    <div key={idx} className={`chat-msg ${msg.from === 'you' ? 'me' : 'other'}`}>
                        <b>{msg.from}:</b> {msg.text}
                    </div>
                    ))}
                </div>
                <div className="chat-input">
                    <input
                    type="text"
                    value={newMsg}
                    placeholder="Type message..."
                    onChange={(e) => setNewMsg(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button onClick={sendMessage}>Send</button>
                </div>
                </div>
            </div>
            
      </div>
      <div className="section full-width-reviews">
        <h3 className="section-title">🗣️ Reviews</h3>
        <div className="review-row">
        {dummyReviews.map((r, idx) => (
            <div key={idx} className="review-card">
            <Link to={`/user/${r.user}`} className="review-link">{r.user}</Link>
            <div className="review-stars">{renderStars(r.rating)}</div>
            <div className="review-comment">"{r.comment}"</div>
            </div>
        ))}
        </div>
    </div>

    </div>
  )
}

export default SwapPage
