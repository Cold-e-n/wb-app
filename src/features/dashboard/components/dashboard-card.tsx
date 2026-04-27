import {
  AlignHorizontalJustifyCenter,
  Blocks,
  Palette,
  Scroll,
} from 'lucide-react'
import { useDashboardStats } from '../hooks/use-dashboard'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type StatCard = {
  title: string
  value: number
  icon: React.ElementType
}

export const DashboardCard = () => {
  const { data } = useDashboardStats()

  const cards: Array<StatCard> = [
    {
      title: 'Total Kain',
      value: data.totalFabrics,
      icon: Scroll,
    },
    {
      title: 'Benang Warna',
      value: data.totalColors,
      icon: Palette,
    },
    {
      title: 'Layout Warna',
      value: data.totalColorLayouts,
      icon: AlignHorizontalJustifyCenter,
    },
    {
      title: 'Posisi Warna',
      value: data.totalColorPositions,
      icon: Blocks,
    },
  ]

  return (
    <div className="grid gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => (
        <Card
          className="hover:shadow-md transition-shadow h-full gap-3"
          key={`dashboard-card-${i}`}
        >
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <CardAction>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
