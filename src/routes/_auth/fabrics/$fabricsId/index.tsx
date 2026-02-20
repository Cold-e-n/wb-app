import { createFileRoute } from '@tanstack/react-router'
import { getFabricByIdQueryOptions } from '@/features/fabrics/hooks/use-fabric'
import { ErrorFallback } from '@/components/error-boundary'

import { Fabric } from '@/types/Fabric'

import { FabricDetails } from '@/features/fabrics/components/fabric-details'

const RouteComponent = () => {
  const { fabric } = Route.useLoaderData()

  return <FabricDetails fabric={fabric} />
}

export const Route = createFileRoute('/_auth/fabrics/$fabricsId/')({
  loader: async ({ context, params }) => {
    const fabric = await context.queryClient.ensureQueryData(
      getFabricByIdQueryOptions(params.fabricsId),
    )
    return { fabric: fabric as Fabric }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `Detail Kain [${loaderData?.fabric.name}] - ${import.meta.env.VITE_APP_DEPARTMENT_NAME}`,
      },
    ],
  }),
  component: RouteComponent,
  errorComponent: ({ error }) => <ErrorFallback error={error} />,
})
