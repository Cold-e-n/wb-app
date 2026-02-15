import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ColorLayoutForm } from '@/features/color-layout/components/color-layout-form'

import { ArrowLeft } from 'lucide-react'

const RouteComponent = () => {
  return (
    <div className="flex flex-1 flex-col gap-4 sm:gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight">
            Tambah Layout Benang Warna
          </h1>
        </div>
      </div>

      <div className="flex flex-wrap">
        <Button variant="outline" asChild>
          <Link to="/color-layouts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Link>
        </Button>
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
