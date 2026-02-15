import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deleteColor } from '../api/colors.api'
import { useColorsContext } from './colors-provider'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { AlertCircle, Trash2 } from 'lucide-react'
import { useState } from 'react'

export const ColorsDeleteDialog = () => {
  const { open, setOpen, currentRow, setCurrentRow } = useColorsContext()
  const queryClient = useQueryClient()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!currentRow) return

    setIsDeleting(true)
    try {
      await deleteColor({ data: { id: currentRow.id } })
      toast.success('Benang Warna berhasil dihapus.')
      queryClient.invalidateQueries({ queryKey: ['colors'] })
      setOpen(null)
      setCurrentRow(null)
    } catch (error) {
      toast.error('Gagal menghapus Benang Warna.')
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
          Hapus Benang Warna
        </span>
      }
      desc={
        <>
          Apakah Anda yakin ingin menghapus benang warna{' '}
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
