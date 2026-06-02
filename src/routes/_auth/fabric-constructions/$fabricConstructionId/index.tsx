import { createFileRoute } from '@tanstack/react-router'
import { getFabricConstructionByConstructionIdQueryOptions } from '@/features/fabric-constructions/hooks/use-fabric-constructions'
import type { FabricConstructionWithRelation } from '@/types/FabricConstruction'
import { ErrorFallback } from '@/components/error-boundary'
import { FabricConstructionDetail } from '@/features/fabric-constructions/components/fabric-constructions-detail'

const RouteComponent = () => {
  const { fabricConstruction } = Route.useLoaderData()

  return <FabricConstructionDetail fabricConstruction={fabricConstruction} />
}

export const Route = createFileRoute(
  '/_auth/fabric-constructions/$fabricConstructionId/',
)({
  loader: async ({ context, params }) => {
    const fabricConstruction = await context.queryClient.ensureQueryData(
      getFabricConstructionByConstructionIdQueryOptions(
        params.fabricConstructionId,
      ),
    )
    if (!fabricConstruction) {
      throw new Error('Fabric construction not found')
    }

    return {
      fabricConstruction:
        fabricConstruction as unknown as FabricConstructionWithRelation,
    }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `Detail Konstruksi Kain: ${loaderData?.fabricConstruction.fabricSpec.fabric.name} - ${import.meta.env.VITE_APP_DEPARTMENT_NAME} App`,
      },
    ],
  }),
  component: RouteComponent,
  errorComponent: ({ error }) => <ErrorFallback error={error} />,
})
