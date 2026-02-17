import { createFileRoute } from '@tanstack/react-router'
import { getColorPositionByIdQueryOptions } from '@/features/color-positions/hooks/use-color-positions'
import { type ColorPositionWithRelations } from '@/features/color-positions'

import { ColorPositionsDetails } from '@/features/color-positions/components/color-positions-details'
import { Button } from '@/components/ui/button'
import { MoveLeft } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const RouteComponent = () => {
  const { data } = Route.useLoaderData()

  return (
    <div className="flex flex-col gap-4 sm:gap-6 print:gap-0">
      <div className="flex flex-wrap items-center justify-between gap-2 no-print">
        <div className="space-y-1">
          <div className="flex items-center gap-5 mb-1">
            <div className="no-print">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    asChild
                    className="-ml-2"
                  >
                    <Link to="/color-positions">
                      <MoveLeft className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Kembali</TooltipContent>
              </Tooltip>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Detail Posisi Warna
            </h1>
          </div>
        </div>
      </div>

      <ColorPositionsDetails data={data as ColorPositionWithRelations} />
    </div>
  )
}

export const Route = createFileRoute(
  '/_auth/color-positions/$colorPositionId/',
)({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(
      getColorPositionByIdQueryOptions(params.colorPositionId),
    )
    if (!data) {
      throw new Error('Color position not found')
    }

    return { data }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `Detail Posisi Warna [${loaderData?.data?.fabric?.name}] - ${import.meta.env.VITE_APP_DEPARTMENT_NAME} App`,
      },
    ],
  }),
  component: RouteComponent,
})
