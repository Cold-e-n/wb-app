import { createFileRoute } from '@tanstack/react-router'
import type { FabricConstructionWithRelation } from '@/types/FabricConstruction'
import { getFabricConstructionsQueryOptions } from '@/features/fabric-constructions/hooks/use-fabric-constructions'

import { FabricConstructions } from '@/features/fabric-constructions'
import { ErrorFallback } from '@/components/error-boundary'

const RouteComponent = () => {
  const { fabricConstructions } = Route.useLoaderData()

  return (
    <FabricConstructions
      data={fabricConstructions as unknown as Array<FabricConstructionWithRelation>}
    />
  )
}

export const Route = createFileRoute('/_auth/fabric-constructions/')({
  loader: async ({ context }) => {
    const fabricConstructions = await context.queryClient.fetchQuery(
      getFabricConstructionsQueryOptions,
    )

    if (!fabricConstructions) {
      throw new Error('No fabric constructions found')
    }

    return { fabricConstructions }
  },
  staleTime: Infinity,
  head: () => ({
    meta: [
      {
        title: `Konstruksi Kain - ${import.meta.env.VITE_APP_DEPARTMENT_NAME} App`,
      },
    ],
  }),
  component: RouteComponent,
  errorComponent: ({ error }) => <ErrorFallback error={error} />,
})
