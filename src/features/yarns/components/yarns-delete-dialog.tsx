import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AlertCircle, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { deleteYarn } from '../api/yarns.api'
import { useYarnsContext } from './yarns-provider'
import { ConfirmDialog } from '@/components/confirm-dialog'

export const YarnsDeleteDialog = () => {
  const { open, setOpen, currentRow, setCurrentRow } = useYarnsContext()
  const queryClient = useQueryClient()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!currentRow) return

    setIsDeleting(true)
    try {
      await deleteYarn({ data: { id: currentRow.id } })
      toast.success('Benang berhasil dihapus.')
      queryClient.invalidateQueries({ queryKey: ['yarns'] })
      setOpen(null)
      setCurrentRow(null)
    } catch (error) {
      toast.error('Gagal menghapus Benang.')
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <ConfirmDialog
      open={open === 'delete'}
      onOpenChange={(isOpen) => !isOpen && setOpen(null)}
      handleConfirm={handleDelete}
      isLoading={isDeleting}
      destructive
      title={
        <span className="flex items-center gap-2">
          <AlertCircle className="size-5 text-destructive" />
          Hapus Benang
        </span>
      }
      desc={
        <>
          Apakah Anda yakin ingin menghapus benang{' '}
          <span className="font-bold text-foreground">
            "{currentRow?.name}"
          </span>
          ? Tindakan ini tidak dapat dibatalkan.
        </>
      }
      confirmText={
        <span className="flex items-center gap-2">
          {isDeleting ? 'Menghapus...' : 'Hapus'}
          <Trash2 className="size-4" />
        </span>
      }
      cancelBtnText="Batal"
    />
  )
}
