import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import {
  ColorPositions,
  ColorPositionsProvider,
} from '@/features/color-positions'
import { getColorPositionsQueryOptions } from '@/features/color-positions/hooks/use-color-positions'
import { type ColorPositionWithRelations } from '@/types/ColorPosition'

const RouteComponent = () => {
  const { data } = useSuspenseQuery(getColorPositionsQueryOptions)
  return (
    <ColorPositionsProvider>
      <ColorPositions data={data as ColorPositionWithRelations[]} />
    </ColorPositionsProvider>
  )
}

export const Route = createFileRoute('/_auth/color-positions/')({
  loader: async ({ context }) => {
    const data = await context.queryClient.fetchQuery(
      getColorPositionsQueryOptions,
    )
    if (!data) {
      throw new Error('Color position not found')
    }

    return { data }
  },
  staleTime: Infinity,
  head: () => ({
    meta: [
      {
        title: `Posisi Benang Warna - ${import.meta.env.VITE_APP_DEPARTMENT_NAME} App`,
      },
    ],
  }),
  component: RouteComponent,
})
