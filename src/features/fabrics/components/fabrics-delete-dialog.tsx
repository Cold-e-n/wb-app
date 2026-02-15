import { useFabricsMutation } from '../hooks/use-fabric'

import { useFabricsContext } from './fabrics-provider'
import { ConfirmDialog } from '@/components/confirm-dialog'

import { AlertCircle, Trash2 } from 'lucide-react'

export const FabricsDeleteDialog = () => {
  const { open, setOpen, currentRow, setCurrentRow } = useFabricsContext()
  const { deleteMutation, isPending } = useFabricsMutation()

  const handleDelete = async () => {
    if (!currentRow) return

    deleteMutation.mutate({ id: currentRow.id })
    setOpen(null)
    setCurrentRow(null)
  }

  return (
    <ConfirmDialog
      open={open === 'delete'}
      onOpenChange={(isOpen) => !isOpen && setOpen(null)}
      handleConfirm={handleDelete}
      isLoading={isPending}
      destructive
      title={
        <span className="flex items-center gap-2">
          <AlertCircle className="size-5 text-destructive" />
          Hapus Kain
        </span>
      }
      desc={
        <>
          Apakah Anda yakin ingin menghapus kain{' '}
          <span className="font-bold text-foreground">
            "{currentRow?.name}"
          </span>
          ? Tindakan ini tidak dapat dibatalkan.
        </>
      }
      confirmText={
        <span className="flex items-center gap-2">
          {isPending ? 'Menghapus...' : 'Hapus'}
          <Trash2 className="size-4" />
        </span>
      }
      cancelBtnText="Batal"
    />
  )
}
