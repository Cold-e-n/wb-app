import { createFileRoute } from '@tanstack/react-router'
import { getColorPositionByIdQueryOptions } from '@/features/color-positions/hooks/use-color-positions'
import { type ColorPositionWithRelations } from '@/features/color-positions'

import { ColorPositionsDetails } from '@/features/color-positions/components/color-positions-details'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ErrorFallback } from '@/components/error-boundary'

import { CircleAlert, MoveLeft } from 'lucide-react'

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

      <div className="no-print grid w-full items-start gap-4">
        <Alert>
          <CircleAlert className="h-4 w-4" />
          <AlertTitle>Keterangan</AlertTitle>
          <AlertDescription>
            Program bisa saja bikin kesalahan, selalu check ulang hasilnya.
          </AlertDescription>
        </Alert>
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
  errorComponent: ({ error }) => <ErrorFallback error={error} />,
})
