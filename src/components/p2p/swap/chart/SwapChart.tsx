// src/components/SwapChart.tsx
import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

type ChartPoint = {
  time: string
  value: number
}

interface Props {
  data: ChartPoint[]
}

const SwapChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="chart-wrapper">
      <h3 className="section-title">📈 USD/SOL</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid stroke="#444" strokeDasharray="3 3" />
          <XAxis dataKey="time" stroke="#aaa" />
          <YAxis stroke="#aaa" />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#F3EF52" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default SwapChart
