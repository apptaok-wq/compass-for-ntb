interface DesaDataItem {
  name: string
  totalPoor: number
  percentage: number
}

interface DesaTableProps {
  data: DesaDataItem[]
  title?: string
}

export function DesaTable({ data, title = 'Top 10 Desa' }: DesaTableProps) {
  return (
    <div className="bg-card rounded-lg border p-4">
      <h3 className="text-sm font-medium mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 font-medium">#</th>
              <th className="text-left py-2 font-medium">Desa</th>
              <th className="text-right py-2 font-medium">Total Miskin</th>
              <th className="text-right py-2 font-medium">Persentase</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="border-b last:border-0">
                <td className="py-2">{index + 1}</td>
                <td className="py-2">{item.name}</td>
                <td className="text-right py-2">{item.totalPoor.toLocaleString?.('id-ID') ?? item.totalPoor}</td>
                <td className="text-right py-2">{typeof item.percentage === 'number' ? `${item.percentage.toFixed(2)}%` : item.percentage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
