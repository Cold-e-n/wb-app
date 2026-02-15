import { createFileRoute } from '@tanstack/react-router'
import {
  type ColorPositionWithRelations,
  ColorPositions,
  ColorPositionsProvider,
} from '@/features/color-positions'
import { useColorPositions } from '@/features/color-positions/hooks/use-color-positions'

function RouteComponent() {
  const { data } = useColorPositions()
  return (
    <ColorPositionsProvider>
      <ColorPositions data={data as ColorPositionWithRelations[]} />
    </ColorPositionsProvider>
  )
}

export const Route = createFileRoute('/_auth/color-positions/')({
  head: () => ({
    meta: [
      {
        title: `Posisi Benang Warna - ${import.meta.env.VITE_APP_DEPARTMENT_NAME} App`,
      },
    ],
  }),
  component: RouteComponent,
})
