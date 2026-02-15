import { createFileRoute } from '@tanstack/react-router'
import { ColorLayoutProvider } from '@/features/color-layout/components/color-layout-provider'
import { ColorLayout } from '@/features/color-layout'
import { getColorLayoutQueryOptions } from '@/features/color-layout/hooks/use-color-layout'
import { useSuspenseQuery } from '@tanstack/react-query'

import { type ColorLayoutWithFabric } from '@/features/color-layout/components/table/color-layout-table-columns'

const RouteComponent = () => {
  const { data: colorLayouts } = useSuspenseQuery(getColorLayoutQueryOptions)

  return (
    <ColorLayoutProvider>
      <ColorLayout data={colorLayouts as ColorLayoutWithFabric[]} />
    </ColorLayoutProvider>
  )
}

export const Route = createFileRoute('/_auth/color-layouts/')({
  loader: async ({ context }) => {
    const colorLayouts = await context.queryClient.ensureQueryData(
      getColorLayoutQueryOptions,
    )
    return { colorLayouts }
  },
  staleTime: Infinity,
  head: () => ({
    meta: [
      {
        title: `Layout Benang Warna - ${import.meta.env.VITE_APP_DEPARTMENT_NAME} App`,
      },
    ],
  }),
  component: RouteComponent,
})
