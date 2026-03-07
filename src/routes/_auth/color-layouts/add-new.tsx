import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { ColorLayoutForm } from '@/features/color-layout/components/color-layout-form'

import { MoveLeft } from 'lucide-react'

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
                    <Link to="/color-layouts">
                      <MoveLeft className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Kembali</TooltipContent>
              </Tooltip>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Tambah Layout Benang Warna
            </h1>
          </div>
        </div>
      </div>

      <ColorLayoutForm />
    </div>
  )
}

export const Route = createFileRoute('/_auth/color-layouts/add-new')({
  head: () => ({
    meta: [
      {
        title: `Tambah Layout Benang Warna - ${import.meta.env.VITE_APP_DEPARTMENT_NAME} App`,
      },
    ],
  }),
  component: RouteComponent,
})
