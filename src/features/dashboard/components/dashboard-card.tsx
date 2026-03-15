import { Link } from '@tanstack/react-router'
import { useDashboardStats } from '../hooks/use-dashboard'
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from '@/components/ui/card'
import {
  Scroll,
  Palette,
  AlignHorizontalJustifyCenter,
  Blocks,
} from 'lucide-react'

type StatCard = {
  title: string
  value: number
  icon: React.ElementType
  href: string
}

export const DashboardCard = () => {
  const { data } = useDashboardStats()

  const cards: StatCard[] = [
    {
      title: 'Total Kain',
      value: data.totalFabrics,
      icon: Scroll,
      href: '/fabrics',
    },
    {
      title: 'Benang Warna',
      value: data.totalColors,
      icon: Palette,
      href: '/color',
    },
    {
      title: 'Layout Warna',
      value: data.totalColorLayouts,
      icon: AlignHorizontalJustifyCenter,
      href: '/color-layouts',
    },
    {
      title: 'Posisi Warna',
      value: data.totalColorPositions,
      icon: Blocks,
      href: '/color-positions',
    },
  ]

  return (
    <div className="grid gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Link key={card.href} to={card.href} className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full gap-3">
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
        </Link>
      ))}
    </div>
  )
}
