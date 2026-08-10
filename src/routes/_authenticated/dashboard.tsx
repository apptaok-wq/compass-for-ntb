import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'

export const Route = createFileRoute('/_authenticated/dashboard')({\n  component: DashboardPage,
})

function DashboardPage() {
  const { user } = useAuth()

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
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-card-foreground">Overview</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ini adalah halaman dashboard placeholder. Halaman ini hanya bisa diakses setelah login.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: 'Total', value: '0' },
              { title: 'Pending', value: '0' },
              { title: 'Completed', value: '0' },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">{item.title}</p>
                <p className="mt-2 text-2xl font-bold text-card-foreground">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-card-foreground">Recent Activity</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Tidak ada aktivitas terbaru.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}