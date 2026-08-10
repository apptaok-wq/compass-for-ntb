import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface TrendChartProps {
  data: { year: number; value: number }[]
  title?: string
}

export function TrendChart({ data, title = 'Tren Kemiskinan' }: TrendChartProps) {
  return (
    <div className="bg-card rounded-lg border p-4">
      <h3 className="text-sm font-medium mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip formatter={(value: any) => value.toLocaleString?.('id-ID') ?? value} />
          <Line type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
