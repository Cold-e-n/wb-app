import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { getYarnsQueryOptions } from '@/features/yarns/hooks/use-yarn'
import { ErrorFallback } from '@/components/error-boundary'

import { Yarns, YarnsProvider } from '@/features/yarns'

const RouteComponent = () => {
  const { data: yarns } = useSuspenseQuery(getYarnsQueryOptions)

  return (
    <YarnsProvider>
      <Yarns data={yarns} />
    </YarnsProvider>
  )
}

export const Route = createFileRoute('/_auth/yarns')({
  loader: async ({ context }) => {
    const yarns = await context.queryClient.ensureQueryData(
      getYarnsQueryOptions,
    )

    return { yarns }
  },
  staleTime: Infinity, // Prevent re-fetch when only search params (pagination) change
  head: () => ({
    meta: [
      {
        title: `Benang - ${import.meta.env.VITE_APP_DEPARTMENT_NAME} App`,
      },
    ],
  }),
  component: RouteComponent,
  errorComponent: ({ error }) => <ErrorFallback error={error} />,
})
