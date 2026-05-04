import { Link, createFileRoute } from '@tanstack/react-router'
import { MoveLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { FabricSpecsForm } from '@/features/fabric-specs/components/fabric-specs-form'

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
                    <Link to="/fabric-specs">
                      <MoveLeft className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Kembali</TooltipContent>
              </Tooltip>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Tambah Spek Kain
            </h1>
          </div>
        </div>
      </div>

      <FabricSpecsForm />
    </div>
  )
}

export const Route = createFileRoute('/_auth/fabric-specs/add-new')({
  head: () => ({
    meta: [
      {
        title: `Tambah Spek Kain - ${import.meta.env.VITE_APP_DEPARTMENT_NAME} App`,
      },
    ],
  }),
  component: RouteComponent,
})
