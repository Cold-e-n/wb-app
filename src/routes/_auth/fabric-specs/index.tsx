import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import type { FabricSpecWithFabric } from '@/types/FabricSpec'
import { getFabricSpecsQueryOptions } from '@/features/fabric-specs/hooks/use-fabric-specs'

import { FabricSpecs } from '@/features/fabric-specs'
import { ErrorFallback } from '@/components/error-boundary'

const RouteComponent = () => {
  const { data: fabricSpecs } = useSuspenseQuery(getFabricSpecsQueryOptions)

  return (
    <FabricSpecs data={fabricSpecs as unknown as Array<FabricSpecWithFabric>} />
  )
}

export const Route = createFileRoute('/_auth/fabric-specs/')({
  loader: async ({ context }) => {
    const fabricSpecs = await context.queryClient.fetchQuery(
      getFabricSpecsQueryOptions,
    )
    return { fabricSpecs }
  },
  staleTime: Infinity,
  head: () => ({
    meta: [
      {
        title: `Spek Kain - ${import.meta.env.VITE_APP_DEPARTMENT_NAME} App`,
      },
    ],
  }),
  component: RouteComponent,
  errorComponent: ({ error }) => <ErrorFallback error={error} />,
})
