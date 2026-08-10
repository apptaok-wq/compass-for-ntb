import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type DashboardFilterOptions = {
  year: string
  month: string
  kabupatenId: string
}

const MONTHS = [
  'Semua bulan',
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 6 }, (_, i) => String(CURRENT_YEAR - i))

function useKabupatenList() {
  return useQuery({
    queryKey: ['dashboard-kabupaten-list'],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wilayah')
        .select('id, nama, jenis')
        .in('jenis', ['kabupaten', 'kota'])
        .order('nama')
      if (error) throw error
      return (data ?? []) as { id: string; nama: string; jenis: string }[]
    },
  })
}

export function DashboardFilters({
  onFilterChange,
  initial,
}: {
  onFilterChange: (filters: DashboardFilterOptions) => void
  initial?: Partial<DashboardFilterOptions>
}) {
  const [filters, setFilters] = useState<DashboardFilterOptions>({
    year: initial?.year ?? String(CURRENT_YEAR),
    month: initial?.month ?? '0',
    kabupatenId: initial?.kabupatenId ?? '',
  })

  const { data: kabupaten = [] } = useKabupatenList()

  useEffect(() => {
    onFilterChange(filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const set = (patch: Partial<DashboardFilterOptions>) =>
    setFilters((prev) => ({ ...prev, ...patch }))

  return (
    <div className="mb-6 grid gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-3">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Tahun</label>
        <Select value={filters.year} onValueChange={(v) => set({ year: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih tahun" />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Bulan</label>
        <Select value={filters.month} onValueChange={(v) => set({ month: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Semua bulan" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m, i) => (
              <SelectItem key={m} value={String(i)}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Kabupaten/Kota</label>
        <Select
          value={filters.kabupatenId || 'all'}
          onValueChange={(v) => set({ kabupatenId: v === 'all' ? '' : v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Semua wilayah" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua wilayah</SelectItem>
            {kabupaten.map((k) => (
              <SelectItem key={k.id} value={k.id}>
                {k.nama}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
