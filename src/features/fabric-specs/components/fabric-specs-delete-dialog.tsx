import { useFabricSpecMutation } from '../hooks/use-fabric-specs'
import { useFabricSpecsContext } from './fabric-specs-provider'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export const FabricSpecsDeleteDialog = () => {
  const { open, setOpen, currentRow } = useFabricSpecsContext()
  const { deleteMutation } = useFabricSpecMutation()

  const isOpen = open === 'delete'

  const handleConfirm = async () => {
    if (currentRow?.id) {
      await deleteMutation.mutateAsync({ id: currentRow.id })
      setOpen(null)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && setOpen(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Spesifikasi Kain?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data spesifikasi secara permanen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
