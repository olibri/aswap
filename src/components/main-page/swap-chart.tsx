import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
    Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import './swap-chart.css';

type ChartPoint = {
  date: string;
  price: number;
};

const SwapChart: React.FC = () => {
  const [data, setData] = useState<ChartPoint[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/coins/solana/market_chart?vs_currency=usd&days=90'
        );
        const json = await res.json();

        const parsedData: ChartPoint[] = json.prices.map(
          ([timestamp, price]: [number, number]) => ({
            date: new Date(timestamp).toLocaleDateString('uk-UA'),
            price,
          })
        );

        setData(parsedData);
      } catch (err) {
        console.error('Failed to fetch chart data:', err);
      }
    })();
  }, []);

  return (
    <div className="chart-container">
      <div className="chart-wrapper">
      <h2 className="chart-title">SOL / USDC</h2>

      <ResponsiveContainer width="100%" height={window.innerHeight - 250}>
                <LineChart data={data}>
            <CartesianGrid stroke="#444" strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip
                contentStyle={{ backgroundColor: '#222', borderColor: '#ffd600', color: '#fff' }}
                labelStyle={{ color: '#ffd600' }}/>
            <Line
              type="monotone"
              dataKey="price"
              stroke="#F3EF52"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        <button
          onClick={() => navigate('/market-p2p-orders')}
          className="start-trade-btn"
        >
          🚀 Start Swap
        </button>
     
      </div>
    </div>
  );
};

export default SwapChart;
