import { DashboardCard } from './components/dashboard-card'

export const Dashboard = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

      <div className="mt-5">
        <DashboardCard />
      </div>
    </div>
  )
}
