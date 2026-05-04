import { createFileRoute } from '@tanstack/react-router'
import { getFabricSpecByIdQueryOptions } from '@/features/fabric-specs/hooks/use-fabric-specs'
import type { FabricSpecWithRelation } from '@/types/FabricSpec'

import { ErrorFallback } from '@/components/error-boundary'
import { FabricSpecDetail } from '@/features/fabric-specs/components/fabric-spec-detail'

const RouteComponent = () => {
  const { fabricSpec } = Route.useLoaderData()

  return <FabricSpecDetail fabricSpec={fabricSpec as FabricSpecWithRelation} />
}

export const Route = createFileRoute('/_auth/fabric-specs/$fabricSpecId/')({
  loader: async ({ context, params }) => {
    const fabricSpec = await context.queryClient.ensureQueryData(
      getFabricSpecByIdQueryOptions(params.fabricSpecId),
    )
    if (!fabricSpec) {
      throw new Error('Fabric spec not found')
    }
    return { fabricSpec: fabricSpec as unknown as FabricSpecWithRelation }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `Detail Spesifikasi ${loaderData?.fabricSpec?.fabric.name || ''} - ${import.meta.env.VITE_APP_DEPARTMENT_NAME} App`,
      },
    ],
  }),
  component: RouteComponent,
  errorComponent: ({ error }) => <ErrorFallback error={error} />,
})
