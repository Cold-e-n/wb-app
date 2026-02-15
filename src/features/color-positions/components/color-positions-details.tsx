import {
  useColorPositionsContext,
  type ColorPositionWithRelations,
} from './color-positions-provider'
import { ColorPositionCalculator } from '@/calculations/ColorPosition'
import ReactJson from '@microlink/react-json-view'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export const ColorPositionsDetails = () => {
  const { open, setOpen, currentRow } = useColorPositionsContext()

  if (!currentRow) return null

  const calculator = new ColorPositionCalculator(
    currentRow as ColorPositionWithRelations,
  )

  return (
    <Dialog open={open === 'detail'} onOpenChange={(v) => !v && setOpen(null)}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Detail Posisi Warna</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6 pt-0">
          <div className="space-y-6">
            <section>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Informasi Dasar
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-xs text-muted-foreground">
                    Kain
                  </span>
                  <span>{currentRow.fabric.name}</span>
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground">
                    No WB
                  </span>
                  <span>{currentRow.wbNo}</span>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Isi Konten (JSON)
              </h3>
              <div className="rounded-md border bg-muted/50 p-4">
                <ReactJson
                  src={currentRow as ColorPositionWithRelations}
                  theme="monokai"
                  displayDataTypes={false}
                  displayObjectSize={false}
                  enableClipboard={true}
                  name={false}
                  collapsed={false}
                />
              </div>
            </section>

            <section>
              <div className="flex flex-col space-y-2">
                {calculator.calculate().map((row, i) => (
                  <div key={i} className="flex gap-2 border-r">
                    {row.map((value, j) => (
                      <div
                        key={j}
                        className="px-2 py-1 bg-muted rounded text-xs font-mono border"
                      >
                        {value}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
