import { useRouter } from '@tanstack/react-router'
import { useColorLayout } from '@/features/color-layout/hooks/use-color-layout'
import { useColor } from '@/features/colors/hooks/use-color'
import type { FabricSpecWithRelation } from '@/types/FabricSpec'
import type { ColorContent } from '@/types/ColorLayout'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ColorInfoDisplay } from '@/features/color-layout/components/color-layout-details'
import { Separator } from '@/components/ui/separator'
import { Calendar, MoveLeft } from 'lucide-react'

interface FabricSpecDetailProps {
  fabricSpec: FabricSpecWithRelation
}

// ─── Helper ───────────────────────────────────────────────────────────────────

// Hanya fetch color layout kalau value-nya memang cuid (bukan nama warna manual)
const isColorLayoutId = (value: string | null | undefined): boolean => {
  return !!value && /^c[a-z0-9]{24,}$/i.test(value)
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const SpecItem = ({
  label,
  value,
  suffix,
}: {
  label: string
  value: React.ReactNode
  suffix?: string
}) => (
  <div className="flex items-center gap-3 p-3 rounded-lg border bg-background/50 hover:border-primary/40 transition-colors group">
    <div className="flex flex-col min-w-0 space-y-2">
      <span className="text-sm font-semibold tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="font-mono tracking-tight truncate">
        {value}
        {suffix && (
          <span className="ml-1 font-normal text-muted-foreground">
            {suffix}
          </span>
        )}
      </span>
    </div>
  </div>
)

// ─── Main Component ───────────────────────────────────────────────────────────

export const FabricSpecDetail = ({ fabricSpec }: FabricSpecDetailProps) => {
  const router = useRouter()

  const colorParts = (fabricSpec.color ?? '-').split(' ')
  const colorId = colorParts[0]
  const colorDescription = colorParts.slice(1).join(' ')

  const colorLayoutId = isColorLayoutId(colorId) ? colorId : ''
  const { data: colorLayouts } = useColorLayout()
  const { data: colors } = useColor()

  const colorLayout = colorLayouts?.find((l) => l.id === colorLayoutId)
  const colorLayoutContent = colorLayout?.colorContent as
    | ColorContent
    | undefined
  const colorName = colors?.find((c) => c.id === colorId)?.name ?? colorId

  const displayDate = new Date(
    fabricSpec.updatedAt ?? fabricSpec.createdAt ?? new Date(),
  ).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const colorDisplay = () => {
    if (colorLayoutContent) {
      return <ColorInfoDisplay colorContent={colorLayoutContent} />
    }

    if (colorId === '-' || !colorId) {
      return <span className="text-sm font-mono font-medium">-</span>
    }

    return (
      <div className="font-jetbrains-mono">
        {`${colorName} ${colorDescription ? ` ${colorDescription}` : ''}`}
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.history.go(-1)}
              >
                <MoveLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Kembali</TooltipContent>
          </Tooltip>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Detail Spek Kain
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Kiri — Spesifikasi Teknis */}
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="text-2xl font-bold">
                {fabricSpec.fabric.name}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Dimensi & Material */}
              <section>
                <h3 className="font-bold text-muted-foreground tracking-wider mb-4 flex items-center gap-2">
                  Dimensi & Material
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <SpecItem
                    label="Lebar"
                    value={fabricSpec.width}
                    suffix="cm"
                  />
                  <SpecItem
                    label="Panjang"
                    value={fabricSpec.length.toLocaleString()}
                    suffix="meter"
                  />
                  <SpecItem
                    label="Benang Lusi"
                    value={fabricSpec.warpYarn.name}
                  />
                  <SpecItem
                    label="Benang Pakan"
                    value={fabricSpec.weftYarn.name}
                  />
                </div>
              </section>

              <Separator />

              {/* Weaving */}
              <section>
                <h3 className="font-bold text-muted-foreground tracking-wider mb-4 flex items-center gap-2">
                  Weaving
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <SpecItem
                    label="Nomor Sisir"
                    value={`#${fabricSpec.reedNo}`}
                  />
                  <SpecItem
                    label="Lebar Sisir"
                    value={Number(fabricSpec.reedWidth).toFixed(2)}
                    suffix="inch"
                  />
                  <SpecItem
                    label="Total Helai Lusi"
                    value={fabricSpec.totalEnds.toLocaleString()}
                    suffix="helai"
                  />
                  <SpecItem
                    label="Pick Per Inch"
                    value={fabricSpec.pickPerInch}
                  />
                  <SpecItem
                    label="Pinggiran"
                    value={
                      fabricSpec.fringe === 0 || !fabricSpec.fringe
                        ? '-'
                        : fabricSpec.fringe
                    }
                    suffix={
                      fabricSpec.fringe !== 0 && fabricSpec.fringe
                        ? 'helai'
                        : undefined
                    }
                  />
                </div>
              </section>

              <Separator />

              {/* Benang Warna */}
              <section>
                <h3 className="font-bold text-muted-foreground tracking-wider mb-4 flex items-center gap-2">
                  Benang Warna
                </h3>
                <div className="p-4 rounded-lg bg-muted/40 border border-dashed">
                  {colorDisplay()}
                </div>
              </section>
            </CardContent>

            <CardFooter className="border-t bg-muted/10 py-3 justify-end gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>Update Terakhir: {displayDate}</span>
            </CardFooter>
          </Card>
        </div>

        {/* Kanan — Cutmark */}
        <div className="xl:col-span-1">
          <Card className="xl:sticky xl:top-6">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="font-bold">Cutmark</CardTitle>
            </CardHeader>

            <CardContent className="pt-4">
              <div
                className={
                  fabricSpec.cutmarkPerRoll.length > 6
                    ? 'space-y-2 max-h-100 overflow-y-auto pr-1'
                    : 'space-y-2'
                }
              >
                {fabricSpec.cutmarkPerRoll.map((cutmark, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 rounded-lg border-l-4 border-l-primary border bg-background hover:bg-accent/30 transition-colors"
                  >
                    <div className="">
                      <span className="font-mono font-bold">
                        {cutmark.roll} Roll
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-primary">
                        {cutmark.length.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground"> meter</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
