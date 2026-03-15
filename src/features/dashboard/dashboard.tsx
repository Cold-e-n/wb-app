import { Suspense } from 'react'
import { DashboardCard } from './components/dashboard-card'
import { RecentPositions } from './components/recent-positions'

export const Dashboard = () => {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Ringkasan data dan aktivitas terbaru.
        </p>
      </div>

      <Suspense fallback={null}>
        <DashboardCard />
      </Suspense>

      <Suspense fallback={null}>
        <div className="grid gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-2">
          <RecentPositions />
        </div>
      </Suspense>
    </div>
  )
}
