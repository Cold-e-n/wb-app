import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getColorLayoutByIdQueryOptions } from '@/features/color-layout/hooks/use-color-layout'
import type { ColorContent } from '@/types/ColorLayout'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ColorLayoutForm } from '@/features/color-layout/components/color-layout-form'
import { ErrorFallback } from '@/components/error-boundary'

import { ChevronLeft, ChevronRight, MoveLeft } from 'lucide-react'

const RouteComponent = () => {
  const { colorLayoutId } = Route.useParams()
  const { data: colorLayout } = useSuspenseQuery(
    getColorLayoutByIdQueryOptions(colorLayoutId),
  )
  const navigate = useNavigate()

  if (!colorLayout) {
    return <div>Layout tidak ditemukan</div>
  }

  return (
    <div className="flex flex-1 flex-col gap-4 sm:gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-5 mb-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="-ml-2"
                  onClick={() => navigate({ to: '/color-layouts' })}
                >
                  <MoveLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Kembali</TooltipContent>
            </Tooltip>
            <h1 className="text-2xl font-bold tracking-tight">
              Detail Layout: {colorLayout.fabric.name}
            </h1>
          </div>
        </div>
      </div>

      <ColorLayoutForm
        mode="edit"
        initialData={{
          id: colorLayout.id,
          fabricId: colorLayout.fabricId,
          colorContent: colorLayout.colorContent as ColorContent,
        }}
      />
    </div>
  )
}

export const Route = createFileRoute(
  '/_auth/color-layouts/$colorLayoutId/edit',
)({
  loader: async ({ context, params }) => {
    const colorLayout = await context.queryClient.ensureQueryData(
      getColorLayoutByIdQueryOptions(params.colorLayoutId),
    )
    if (!colorLayout) {
      throw new Error('Color layout not found')
    }
    return { colorLayout }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `Edit Layout [${loaderData?.colorLayout?.fabric?.name || ''}] - ${import.meta.env.VITE_APP_DEPARTMENT_NAME}`,
      },
    ],
  }),
  component: RouteComponent,
  errorComponent: ({ error }) => <ErrorFallback error={error} />,
})
