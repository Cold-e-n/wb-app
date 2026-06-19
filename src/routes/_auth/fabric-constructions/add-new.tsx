import { Suspense, lazy } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { MoveLeft } from 'lucide-react'

const FabricConstructionsForm = lazy(() =>
  import('@/features/fabric-constructions/components/form/fabric-constructions-form').then(
    (module) => ({
      default: module.FabricConstructionsForm,
    }),
  ),
)

const RouteComponent = () => {
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
                    asChild
                    className="-ml-2"
                  >
                    <Link to="/fabric-constructions">
                      <MoveLeft className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Kembali</TooltipContent>
              </Tooltip>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Tambah Konstruksi Kain
            </h1>
          </div>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading form...</p>
          </div>
        }
      >
        <FabricConstructionsForm mode="create" />
      </Suspense>
    </div>
  )
}

export const Route = createFileRoute('/_auth/fabric-constructions/add-new')({
  head: () => ({
    meta: [
      {
        title: `Tambah Konstruksi Kain - ${import.meta.env.VITE_APP_DEPARTMENT_NAME} App`,
      },
    ],
  }),
  component: RouteComponent,
  pendingComponent: () => (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Loading page...</p>
      </div>
    </div>
  ),
})
