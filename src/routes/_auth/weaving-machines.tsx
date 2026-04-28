import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { getWeavingMachinesQueryOptions } from '@/features/weaving-machines/hooks/use-weaving-machine'
import { ErrorFallback } from '@/components/error-boundary'

import { WeavingMachines, WeavingMachinesProvider } from '@/features/weaving-machines'

const RouteComponent = () => {
  const { data: machines } = useSuspenseQuery(getWeavingMachinesQueryOptions)

  return (
    <WeavingMachinesProvider>
      <WeavingMachines data={machines} />
    </WeavingMachinesProvider>
  )
}

export const Route = createFileRoute('/_auth/weaving-machines')({
  loader: async ({ context }) => {
    const machines = await context.queryClient.ensureQueryData(
      getWeavingMachinesQueryOptions,
    )

    return { machines }
  },
  staleTime: Infinity,
  head: () => ({
    meta: [
      {
        title: `Mesin Weaving - ${import.meta.env.VITE_APP_DEPARTMENT_NAME} App`,
      },
    ],
  }),
  component: RouteComponent,
  errorComponent: ({ error }) => <ErrorFallback error={error} />,
})
