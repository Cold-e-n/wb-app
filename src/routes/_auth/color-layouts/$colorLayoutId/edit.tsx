import { createFileRoute, Link } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getColorLayoutByIdQueryOptions } from '@/features/color-layout/hooks/use-color-layout'
import type { ColorContent } from '@/types/ColorLayout'

import { Button } from '@/components/ui/button'
import { ColorLayoutForm } from '@/features/color-layout/components/color-layout-form'
import { ErrorFallback } from '@/components/error-boundary'

import { ArrowLeft } from 'lucide-react'

const RouteComponent = () => {
  const { colorLayoutId } = Route.useParams()
  const { data: colorLayout } = useSuspenseQuery(
    getColorLayoutByIdQueryOptions(colorLayoutId),
  )

  if (!colorLayout) {
    return <div>Layout tidak ditemukan</div>
  }

  return (
    <div className="flex flex-1 flex-col gap-4 sm:gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight">
            Edit Layout Benang Warna
          </h1>
          <p className="text-muted-foreground">{colorLayout.fabric?.name}</p>
        </div>
      </div>

      <div className="flex flex-wrap">
        <Button variant="outline" asChild>
          <Link to="/color-layouts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Link>
        </Button>
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
