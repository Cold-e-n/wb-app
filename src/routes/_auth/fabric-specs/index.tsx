import { createFileRoute } from '@tanstack/react-router'
import type { FabricSpecWithRelation } from '@/types/FabricSpec'
import { getFabricSpecsQueryOptions } from '@/features/fabric-specs/hooks/use-fabric-specs'

import { FabricSpecs } from '@/features/fabric-specs'
import { ErrorFallback } from '@/components/error-boundary'
import { FabricSpecsProvider } from '@/features/fabric-specs'

const RouteComponent = () => {
  const { fabricSpecs } = Route.useLoaderData()

  return (
    <FabricSpecsProvider>
      <FabricSpecs
        data={fabricSpecs as unknown as Array<FabricSpecWithRelation>}
      />
    </FabricSpecsProvider>
  )
}

export const Route = createFileRoute('/_auth/fabric-specs/')({
  loader: async ({ context }) => {
    const fabricSpecs = await context.queryClient.fetchQuery(
      getFabricSpecsQueryOptions,
    )

    if (!fabricSpecs) {
      throw new Error('No fabric specs found')
    }

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
