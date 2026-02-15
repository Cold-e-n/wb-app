import { useFabric } from '@/features/fabrics/hooks/use-fabric'
import { useColor } from '@/features/colors/hooks/use-color'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Scroll, Palette, Blocks } from 'lucide-react'

export const DashboardCard = () => {
  const fabrics = useFabric()
  const colors = useColor()

  const cards = [
    { id: 1, title: 'Kain', value: fabrics?.data?.length, icon: Scroll },
    {
      id: 2,
      title: 'Benang Warna',
      value: colors?.data?.length,
      icon: Palette,
    },
    { id: 3, title: 'Orders', value: '314', icon: Blocks },
  ]

  return (
    <div className="grid gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>{c.title}</CardTitle>
            <c.icon />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{c.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
