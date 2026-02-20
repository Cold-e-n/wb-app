import { createFileRoute } from '@tanstack/react-router'
import { Fabrics } from '@/features/fabrics'
import { FabricsProvider } from '@/features/fabrics/components/fabrics-provider'
import { getFabricsQueryOptions } from '@/features/fabrics/hooks/use-fabric'
import { useSuspenseQuery } from '@tanstack/react-query'
import { ErrorFallback } from '@/components/error-boundary'

const RouteComponent = () => {
  const { data: fabrics } = useSuspenseQuery(getFabricsQueryOptions)

  return (
    <FabricsProvider>
      <Fabrics data={fabrics} />
    </FabricsProvider>
  )
}

export const Route = createFileRoute('/_auth/fabrics/')({
  loader: async ({ context }) => {
    const fabrics = await context.queryClient.ensureQueryData(
      getFabricsQueryOptions,
    )
    return { fabrics }
  },
  staleTime: Infinity,
  head: () => ({
    meta: [
      {
        title: `Kain - ${import.meta.env.VITE_APP_DEPARTMENT_NAME} App`,
      },
    ],
  }),
  component: RouteComponent,
  errorComponent: ({ error }) => <ErrorFallback error={error} />,
})
