import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useColorPositionsContext } from './color-positions-provider'
import { ColorPositionsForm } from './color-positions-form'

export const ColorPositionsDialogs = () => {
  const { open, setOpen, currentRow, setCurrentRow } =
    useColorPositionsContext()

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setOpen(null)
      setCurrentRow(null)
    }
  }

  const isFormOpen = open === 'create' || open === 'update'

  return (
    <Dialog open={isFormOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>
            {open === 'update' ? 'Edit Posisi Warna' : 'Tambah Posisi Warna'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 no-scrollbar overflow-y-auto p-6 pt-0">
          <ColorPositionsForm
            mode={open === 'update' ? 'edit' : 'create'}
            initialData={currentRow || undefined}
            onSuccess={() => handleOpenChange(false)}
            onCancel={() => handleOpenChange(false)}
            showCard={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
