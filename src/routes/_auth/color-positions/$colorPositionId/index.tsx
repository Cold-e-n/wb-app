import { createFileRoute } from '@tanstack/react-router'
import { ColorPositionsDetails } from '@/features/color-positions/components/color-positions-details'
import { useColorPositionById } from '@/features/color-positions/hooks/use-color-positions'
import { type ColorPositionWithRelations } from '@/features/color-positions'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { Link } from '@tanstack/react-router'

function RouteComponent() {
  const { colorPositionId } = Route.useParams()
  const { data } = useColorPositionById(colorPositionId)

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="icon" asChild className="-ml-2">
              <Link to="/color-positions">
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">
              Detail Posisi Warna
            </h1>
          </div>
          <p className="text-muted-foreground ml-8">
            Informasi lengkap penempatan benang warna untuk No WB:{' '}
            <span className="font-semibold text-foreground">{data?.wbNo}</span>
          </p>
        </div>
      </div>

      <ColorPositionsDetails data={data as ColorPositionWithRelations} />
    </div>
  )
}

export const Route = createFileRoute(
  '/_auth/color-positions/$colorPositionId/',
)({
  component: RouteComponent,
})
