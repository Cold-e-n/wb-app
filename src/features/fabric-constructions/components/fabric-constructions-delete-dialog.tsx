import { useFabricConstructionMutation } from '../hooks/use-fabric-constructions'
import { useFabricConstructionsContext } from './fabric-constructions-provider'
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

export const FabricConstructionsDeleteDialog = () => {
  const { open, setOpen, currentRow } = useFabricConstructionsContext()
  const { deleteMutation } = useFabricConstructionMutation()

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
          <AlertDialogTitle>Hapus Konstruksi Kain?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data konstruksi secara permanen.
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
