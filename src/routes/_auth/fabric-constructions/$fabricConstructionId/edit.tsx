import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getFabricConstructionByConstructionIdQueryOptions } from '@/features/fabric-constructions/hooks/use-fabric-constructions'
import type { FabricConstruction } from '@/types/FabricConstruction'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ErrorFallback } from '@/components/error-boundary'
import { FabricConstructionsForm } from '@/features/fabric-constructions/components/form/fabric-constructions-form'
import { MoveLeft } from 'lucide-react'

const RouteComponent = () => {
  const { fabricConstructionId } = Route.useParams()
  const { data: fabricConstruction } = useSuspenseQuery(
    getFabricConstructionByConstructionIdQueryOptions(fabricConstructionId),
  )
  const navigate = useNavigate()

  if (!fabricConstruction) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">
          Konstruksi kain tidak ditemukan.
        </h2>
        <Button onClick={() => navigate({ to: '/fabric-constructions' })}>
          Kembali
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 sm:gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2 no-print">
        <div className="space-y-1">
          <div className="flex items-center gap-5 mb-1">
            <div className="no-print">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="-ml-2"
                    onClick={() => navigate({ to: '/fabric-constructions' })}
                  >
                    <MoveLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Kembali</TooltipContent>
              </Tooltip>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Edit Konstruksi Kain: {fabricConstruction.fabricSpec.fabric.name}
            </h1>
          </div>
        </div>
      </div>

      <FabricConstructionsForm
        mode="edit"
        initialData={fabricConstruction as unknown as FabricConstruction}
      />
    </div>
  )
}

export const Route = createFileRoute(
  '/_auth/fabric-constructions/$fabricConstructionId/edit',
)({
  loader: async ({ context, params }) => {
    const fabricConstruction = await context.queryClient.fetchQuery(
      getFabricConstructionByConstructionIdQueryOptions(
        params.fabricConstructionId,
      ),
    )
    return { fabricConstruction }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `Edit Konstruksi [${loaderData?.fabricConstruction?.fabricSpec.fabric.name || ''}] - ${import.meta.env.VITE_APP_DEPARTMENT_NAME} App`,
      },
    ],
  }),
  component: RouteComponent,
  errorComponent: ({ error }) => <ErrorFallback error={error} />,
})
