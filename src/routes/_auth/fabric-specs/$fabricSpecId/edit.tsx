import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getFabricSpecByIdQueryOptions } from '@/features/fabric-specs/hooks/use-fabric-specs'
import type { FabricSpec } from '@/types/FabricSpec'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ErrorFallback } from '@/components/error-boundary'
import { FabricSpecsForm } from '@/features/fabric-specs/components/fabric-specs-form'
import { MoveLeft } from 'lucide-react'

const RouteComponent = () => {
  const { fabricSpecId } = Route.useParams()
  const { data: fabricSpec } = useSuspenseQuery(
    getFabricSpecByIdQueryOptions(fabricSpecId),
  )
  const navigate = useNavigate()

  if (!fabricSpec) {
    return <div>Spek kain tidak ditemukan.</div>
  }

  return (
    <div className="flex flex-1 flex-col gap-4 sm:gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-5 mb-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="-ml-2"
                  onClick={() => navigate({ to: '/fabric-specs' })}
                >
                  <MoveLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Kembali</TooltipContent>
            </Tooltip>
            <h1 className="text-2xl font-bold tracking-tight">
              Detail Spek Kain: {fabricSpec.fabric.name}
            </h1>
          </div>
        </div>
      </div>

      <FabricSpecsForm
        mode="edit"
        initialData={fabricSpec as unknown as FabricSpec}
      />
    </div>
  )
}

export const Route = createFileRoute('/_auth/fabric-specs/$fabricSpecId/edit')({
  loader: async ({ context, params }) => {
    const fabricSpec = await context.queryClient.fetchQuery(
      getFabricSpecByIdQueryOptions(params.fabricSpecId),
    )
    return { fabricSpec }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `Edit Spek [${loaderData?.fabricSpec?.fabric.name || ''}] - ${import.meta.env.VITE_APP_DEPARTMENT_NAME} App`,
      },
    ],
  }),
  component: RouteComponent,
  errorComponent: ({ error }) => <ErrorFallback error={error} />,
})
