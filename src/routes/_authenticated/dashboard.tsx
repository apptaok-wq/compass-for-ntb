import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'
import { povertyService } from '@/services/povertyService'
import {
  DashboardFilters,
  type DashboardFilterOptions,
} from '@/components/dashboard/DashboardFilters'
import type { PovertyStats, TrendData, KabupatenData, DesaData } from '@/types/poverty'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { user } = useAuth()
  const [filters, setFilters] = useState<DashboardFilterOptions>({
    year: '2025',
    month: '0',
    kabupatenId: '',
  })

  const [stats, setStats] = useState<PovertyStats | null>(null)
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [kabupatenData, setKabupatenData] = useState<KabupatenData[]>([])
  const [desaData, setDesaData] = useState<DesaData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const queryFilters = {
        year: filters.year ? parseInt(filters.year) : undefined,
        month: filters.month && filters.month !== '0' ? parseInt(filters.month) : undefined,
        kabupatenId: filters.kabupatenId || undefined,
      }

      const [statsData, trend, kabupaten, desa] = await Promise.all([
        povertyService.getStats(queryFilters),
        povertyService.getTrendData(queryFilters),
        povertyService.getKabupatenData(queryFilters),
        povertyService.getDesaData(10, queryFilters),
      ])

      setStats(statsData)
      setTrendData(trend)
      setKabupatenData(kabupaten)
      setDesaData(desa)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Gagal memuat data dashboard. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters: DashboardFilterOptions) => {
    setFilters(newFilters)
  }

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Selamat datang, <span className="font-semibold text-foreground">{user?.email}</span>!
            </p>
          </div>

          <div className="space-y-6">
            <div className="h-20 rounded-lg border border-border bg-card animate-pulse" />
            <div className="grid gap-4 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-lg border border-border bg-card animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Selamat datang, <span className="font-semibold text-foreground">{user?.email}</span>!
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <DashboardFilters onFilterChange={handleFilterChange} />

        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="text-sm font-medium text-muted-foreground">Total Penduduk Miskin</p>
              <p className="mt-3 text-3xl font-bold text-card-foreground">
                {loading ? '...' : stats?.totalPoor.toLocaleString('id-ID') || '0'}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <p className="text-sm font-medium text-muted-foreground">Persentase Kemiskinan</p>
              <p className="mt-3 text-3xl font-bold text-card-foreground">
                {loading ? '...' : `${stats?.percentagePoor || 0}%`}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <p className="text-sm font-medium text-muted-foreground">Jumlah Desa/Kelurahan</p>
              <p className="mt-3 text-3xl font-bold text-card-foreground">
                {loading ? '...' : stats?.desaCount || '0'}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <p className="text-sm font-medium text-muted-foreground">Garis Kemiskinan Rata-rata</p>
              <p className="mt-3 text-2xl font-bold text-card-foreground">
                {loading ? '...' : `Rp ${(stats?.averagePovertyLine || 0).toLocaleString('id-ID')}`}
              </p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-card-foreground">Tren Kemiskinan</h2>
              <div className="mt-4 text-sm text-muted-foreground">
                {trendData.length > 0 ? (
                  <div className="space-y-2">
                    {trendData.map((item) => (
                      <div key={item.year} className="flex justify-between">
                        <span>{item.year}</span>
                        <span className="font-medium">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Tidak ada data tren tersedia</p>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-card-foreground">Perbandingan Kabupaten</h2>
              <div className="mt-4 text-sm text-muted-foreground">
                {kabupatenData.length > 0 ? (
                  <div className="space-y-2">
                    {kabupatenData.slice(0, 6).map((item) => (
                      <div key={item.name} className="flex justify-between">
                        <span>{item.name}</span>
                        <span className="font-medium">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Tidak ada data kabupaten tersedia</p>
                )}
              </div>
            </div>
          </div>

          {/* Desa Table */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-card-foreground">
              Top 10 Desa dengan Tingkat Kemiskinan Tertinggi
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-4 font-medium text-muted-foreground">
                      Desa
                    </th>
                    <th className="text-right py-2 px-4 font-medium text-muted-foreground">
                      Populasi
                    </th>
                    <th className="text-right py-2 px-4 font-medium text-muted-foreground">
                      Penduduk Miskin
                    </th>
                    <th className="text-right py-2 px-4 font-medium text-muted-foreground">
                      Persentase
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {desaData.length > 0 ? (
                    desaData.map((desa, idx) => (
                      <tr key={desa.id} className="border-b border-border last:border-b-0">
                        <td className="py-3 px-4">{desa.name}</td>
                        <td className="py-3 px-4 text-right">
                          {desa.population.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-4 text-right">{desa.value.toLocaleString('id-ID')}</td>
                        <td className="py-3 px-4 text-right text-accent-strong font-medium">
                          {desa.percentage}%
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">
                        Tidak ada data desa tersedia
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Last Updated */}
          <div className="text-xs text-muted-foreground text-right">
            {stats && (
              <p>
                Data terakhir diperbarui:{' '}
                {new Date(stats.lastUpdated).toLocaleString('id-ID')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
