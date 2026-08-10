import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { povertyService } from '@/services/povertyService'
import { GISMap } from '@/components/dashboard/GISMap'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { DesaGeoData } from '@/types/poverty'

export const Route = createFileRoute('/_authenticated/gis')({
  component: GISPage,
})

const KABUPATEN = [
  { value: '', label: 'Semua Kabupaten' },
  { value: 'Lombok Barat', label: 'Lombok Barat' },
  { value: 'Lombok Tengah', label: 'Lombok Tengah' },
  { value: 'Lombok Timur', label: 'Lombok Timur' },
  { value: 'Lombok Utara', label: 'Lombok Utara' },
  { value: 'Sumbawa', label: 'Sumbawa' },
  { value: 'Sumbawa Barat', label: 'Sumbawa Barat' },
  { value: 'Dompu', label: 'Dompu' },
  { value: 'Bima', label: 'Bima' },
  { value: 'Kota Mataram', label: 'Kota Mataram' },
  { value: 'Kota Bima', label: 'Kota Bima' },
]

const YEARS = ['2025', '2024', '2023', '2022', '2021', '2020']

function GISPage() {
  const [data, setData] = useState<DesaGeoData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({ year: '2025', kabupatenId: '' })

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const geoData = await povertyService.getDesaGeoData({
          year: parseInt(filters.year),
          kabupatenId: filters.kabupatenId || undefined,
        })
        setData(geoData)
      } catch (err) {
        console.error('Error fetching GIS data:', err)
        setError('Gagal memuat data peta. Silakan coba lagi.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [filters])

  const handleReset = () => {
    setFilters({ year: '2025', kabupatenId: '' })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Peta Sebaran Kemiskinan</h1>
          <p className="mt-2 text-muted-foreground">
            Visualisasi sebaran kemiskinan per desa di Nusa Tenggara Barat
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-end gap-3 border border-border rounded-lg bg-card p-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-muted-foreground">Tahun</label>
            <Select
              value={filters.year}
              onValueChange={(v) => setFilters((prev) => ({ ...prev, year: v }))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Tahun" />
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

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-muted-foreground">Kabupaten/Kota</label>
            <Select
              value={filters.kabupatenId}
              onValueChange={(v) => setFilters((prev) => ({ ...prev, kabupatenId: v }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Kabupaten" />
              </SelectTrigger>
              <SelectContent>
                {KABUPATEN.map((k) => (
                  <SelectItem key={k.value} value={k.value}>
                    {k.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" size="sm" onClick={handleReset}>
            Reset Filter
          </Button>
        </div>

        <div className="mb-6">
          <GISMap data={data} loading={loading} />
        </div>

        <div className="text-sm text-muted-foreground">
          <p>
            Menampilkan <span className="font-semibold text-foreground">{data.length}</span> desa •{' '}
            <span className="font-semibold text-foreground">Tahun {filters.year}</span>
            {filters.kabupatenId && (
              <>
                {' '}
                • <span className="font-semibold text-foreground">{filters.kabupatenId}</span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
