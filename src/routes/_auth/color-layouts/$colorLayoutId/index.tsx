import { createFileRoute } from '@tanstack/react-router'
import { getColorLayoutByIdQueryOptions } from '@/features/color-layout/hooks/use-color-layout'

import { ColorLayoutDetails } from '@/features/color-layout/components/color-layout-details'
import { ErrorFallback } from '@/components/error-boundary'

const RouteComponent = () => {
  const { colorLayout } = Route.useLoaderData()

  return <ColorLayoutDetails colorLayout={colorLayout as any} />
}

export const Route = createFileRoute('/_auth/color-layouts/$colorLayoutId/')({
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
        title: `Detail Layout [${loaderData?.colorLayout?.fabric?.name || ''}] - ${import.meta.env.VITE_APP_DEPARTMENT_NAME}`,
      },
    ],
  }),
  component: RouteComponent,
  errorComponent: ({ error }) => <ErrorFallback error={error} />,
})
