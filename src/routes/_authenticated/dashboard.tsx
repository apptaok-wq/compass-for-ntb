import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'
import { KPICard } from '@/components/dashboard/KPICard'
import { DashboardFilters } from '@/components/dashboard/DashboardFilters'
import { povertyService } from '@/services/povertyService'
import type { PovertyStats, TrendData, KabupatenData, DesaData } from '@/types/poverty'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { WilayahOverview } from '@/components/app/WilayahOverview'

export const Route = createFileRoute('/_authenticated/dashboard')({
  head: () => ({
    meta: [
      { title: 'Dashboard Kesejahteraan — NTB-PIS' },
      {
        name: 'description',
        content:
          'Ringkasan data agregat kesejahteraan wilayah Nusa Tenggara Barat untuk perencanaan program.',
      },
      { property: 'og:title', content: 'Dashboard Kesejahteraan — NTB-PIS' },
      {
        property: 'og:description',
        content: 'Ringkasan data agregat kesejahteraan wilayah Nusa Tenggara Barat.',
      },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: DashboardPage,
})

interface DashboardData {
  stats: PovertyStats | null
  trend: TrendData[]
  kabupaten: KabupatenData[]
  desa: DesaData[]
  loading: boolean
  error: string | null
}

function DashboardPage() {
  const { user } = useAuth()

  const [data, setData] = useState<DashboardData>({
    stats: null,
    trend: [],
    kabupaten: [],
    desa: [],
    loading: true,
    error: null,
  })

  async function fetchData() {
    setData((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const [stats, trend, kabupaten, desa] = await Promise.all([
        povertyService.getStats(),
        povertyService.getTrendData(),
        povertyService.getKabupatenData(),
        povertyService.getDesaData(10),
      ])
      setData({ stats, trend, kabupaten, desa, loading: false, error: null })
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setData((prev) => ({ ...prev, loading: false, error: 'Gagal memuat data dashboard' }))
      toast.error('Gagal memuat data dashboard')
    }
  }

  useEffect(() => {
    void fetchData()
  }, [])

  if (data.loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <DashboardSkeleton />
      </div>
    )
  }

  if (data.error) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <DashboardError message={data.error} onRetry={() => void fetchData()} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Selamat datang, <span className="font-semibold text-foreground">{user?.email}</span>
        </p>
      </div>

      <div className="mb-6">
        <DashboardFilters />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <KPICard label="Jumlah KK" value={data.stats ? data.stats.totalKk.toLocaleString('id-ID') : '—'} />
        <KPICard label="KK Miskin Ekstrem" value={data.stats ? data.stats.kkEkstrem.toLocaleString('id-ID') : '—'} />
        <KPICard
          label="Rasio Miskin Ekstrem"
          value={data.stats ? `${data.stats.rasioEkstrem.toFixed(2)}%` : '—'}
        />
        <KPICard label="Periode Terakhir" value={data.stats?.periode ?? '—'} />
      </div>

      <div className="space-y-8">
        {/* Preserve existing WilayahOverview as reference and supplemental table */}
        <WilayahOverview />
      </div>
    </div>
  )
}

/* Skeleton component */
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-muted animate-pulse rounded-lg" />
        <div className="h-80 bg-muted animate-pulse rounded-lg" />
      </div>
      <div className="h-96 bg-muted animate-pulse rounded-lg" />
    </div>
  )
}

/* Error component */
function DashboardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-red-500 mb-4">⚠️</div>
      <p className="text-muted-foreground mb-4">{message}</p>
      <Button onClick={onRetry}>Coba Lagi</Button>
    </div>
  )
}
