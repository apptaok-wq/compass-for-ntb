import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface KabupatenChartProps {
  data: { name: string; value: number }[]
  title?: string
}

export function KabupatenChart({ data, title = 'Perbandingan Kabupaten' }: KabupatenChartProps) {
  return (
    <div className="bg-card rounded-lg border p-4">
      <h3 className="text-sm font-medium mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" width={140} />
          <Tooltip formatter={(value: any) => value.toLocaleString?.('id-ID') ?? value} />
          <Bar dataKey="value" fill="#4F46E5" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
