import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'
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

function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Selamat datang, <span className="font-semibold text-foreground">{user?.email}</span>
        </p>
      </div>

      <WilayahOverview />
    </div>
  )
}
