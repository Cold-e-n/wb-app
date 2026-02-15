import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { getColorsQueryOptions } from '@/features/colors/hooks/use-color'

import { Colors } from '@/features/colors'
import { ColorsProvider } from '@/features/colors/components/colors-provider'

const RouteComponent = () => {
  const { data: colors } = useSuspenseQuery(getColorsQueryOptions)

  return (
    <ColorsProvider>
      <Colors data={colors} />
    </ColorsProvider>
  )
}

export const Route = createFileRoute('/_auth/color')({
  loader: async ({ context }) => {
    const colors = await context.queryClient.ensureQueryData(
      getColorsQueryOptions,
    )

    return { colors }
  },
  staleTime: Infinity, // Prevent re-fetch when only search params (pagination) change
  head: () => ({
    meta: [
      {
        title: `Benang Warna - ${import.meta.env.VITE_APP_DEPARTMENT_NAME} App`,
      },
    ],
  }),
  component: RouteComponent,
})
