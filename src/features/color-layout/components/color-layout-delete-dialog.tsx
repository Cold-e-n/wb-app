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
import { useColorLayoutContext } from './color-layout-provider'
// import { useColorLayoutMutation } from '../hooks/use-color-layout' // I'll check if this exists or just use a toast for now

export const ColorLayoutDeleteDialog = () => {
  const { open, setOpen, currentRow } = useColorLayoutContext()
  // const { deleteMutation } = useColorLayoutMutation()

  const isOpen = open === 'delete'

  const handleDelete = () => {
    if (currentRow) {
      // deleteMutation.mutate(currentRow.id)
      console.log('Deleting', currentRow.id)
      setOpen(null)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={() => setOpen(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data layout
            secara permanen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
