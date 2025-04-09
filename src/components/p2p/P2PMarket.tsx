import React, { useState } from 'react'
import './p2p.css'

type Order = {
  id: string
  type: 'buy' | 'sell'
  amount: number
  price: number
  user: string
  rating: number
  gold?: boolean
}

const fakeOrders: Order[] = [
  { id: '1', type: 'buy', amount: 100, price: 0.99, user: '0xAlice', rating: 4 },
  { id: '2', type: 'sell', amount: 50, price: 1.01, user: '0xBob', rating: 5, gold: true },
  { id: '3', type: 'buy', amount: 200, price: 0.98, user: '0xCarol', rating: 3 },
  { id: '4', type: 'sell', amount: 120, price: 1.02, user: '0xDave', rating: 4 },
]

const renderStars = (count: number) => '★'.repeat(count) + '☆'.repeat(5 - count)

const P2PMarket: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all')

  const filteredOrders =
    filter === 'all' ? fakeOrders : fakeOrders.filter((o) => o.type === filter)

  return (
    <div className="p2p-market">
      <div className="market-header">
        <h2 className="primary">🧾 P2P Market</h2>
        <button className="create-order-button">+ Create Order</button>
      </div>

      <div className="filter-buttons">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
        <button className={filter === 'buy' ? 'active' : ''} onClick={() => setFilter('buy')}>Buy</button>
        <button className={filter === 'sell' ? 'active' : ''} onClick={() => setFilter('sell')}>Sell</button>
      </div>

      {filteredOrders.map((order) => (
        <div key={order.id} className="p2p-exchange-row">
          <div className="user-col">
            <div className="username">
              {order.user}
              {order.gold && <span className="badge">Gold</span>}
            </div>
            <div className="reviews">
              {renderStars(order.rating)} <span>{order.rating * 20 + 18} reviews</span>
            </div>
          </div>
          <div className="limit-col">
            <div>From <b>{order.amount}</b> USDC</div>
            <div>To <b>{order.amount * 1000}</b> USDC</div>
          </div>
          <div className="rate-col">
            <b>{order.price}</b> USDC = <b>1</b> USD
          </div>
          <div className="action-col">
            <button className="exchange-btn">Change</button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default P2PMarket
