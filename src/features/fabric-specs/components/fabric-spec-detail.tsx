import { useRouter } from '@tanstack/react-router'
import { useColorLayoutById } from '@/features/color-layout/hooks/use-color-layout'
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
import { MoveLeft } from 'lucide-react'

interface FabricSpecDetailProps {
  fabricSpec: FabricSpecWithRelation
}

export const FabricSpecDetail = ({ fabricSpec }: FabricSpecDetailProps) => {
  const router = useRouter()
  const { data: colorLayout } = useColorLayoutById(fabricSpec.color || '')
  const colorLayoutContent = colorLayout?.colorContent as
    | ColorContent
    | undefined

  const displayDate = new Date(
    fabricSpec.updatedAt ?? fabricSpec.createdAt ?? new Date(),
  ).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="flex flex-1 flex-col gap-4 sm:gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-5 mb-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="-ml-2"
                  onClick={() => router.history.go(-1)}
                >
                  <MoveLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Kembali</TooltipContent>
            </Tooltip>
            <h1 className="text-2xl font-bold tracking-tight">Detail Spek</h1>
          </div>
        </div>
      </div>

      <Card className="font-jetbrains-mono">
        <CardHeader>
          <CardTitle className="text-xl border-b pb-4">
            <h1>{fabricSpec.fabric.name}</h1>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-1 flex-col">
            <div className="flex flex-wrap gap-6">
              <div className="flex-1 border p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 space-y-4">
                  {/* Lebar */}
                  <div className="border-b pb-2 space-y-2">
                    <div className="text-sm">Lebar</div>
                    <div className="text-lg">{fabricSpec.width} cm</div>
                  </div>

                  {/* Panjang*/}
                  <div className="border-b pb-2 space-y-2">
                    <div className="text-sm">Panjang</div>
                    <div className="text-lg">
                      {fabricSpec.length.toLocaleString()} meter
                    </div>
                  </div>

                  {/* Lusi */}
                  <div className="border-b pb-2 space-y-2">
                    <div className="text-sm">Lusi</div>
                    <div className="text-lg">{fabricSpec.warpYarn.name}</div>
                  </div>

                  {/* Pakan */}
                  <div className="border-b pb-2 space-y-2">
                    <div className="text-sm">Pakan</div>
                    <div className="text-lg">{fabricSpec.weftYarn.name}</div>
                  </div>

                  {/* lebar Sisir */}
                  <div className="border-b pb-2 space-y-2">
                    <div className="text-sm">Lebar Sisir</div>
                    <div className="text-lg">{fabricSpec.reedWidth} inch</div>
                  </div>

                  {/* Nomor Sisir */}
                  <div className="border-b pb-2 space-y-2">
                    <div className="text-sm">Nomor Sisir</div>
                    <div className="text-lg">#{fabricSpec.reedNo}</div>
                  </div>

                  {/* Jumlah Helai Lusi */}
                  <div className="border-b pb-2 space-y-2">
                    <div className="text-sm">Jumlah Helai Lusi</div>
                    <div className="text-lg">
                      {fabricSpec.totalEnds.toLocaleString()} Helai
                    </div>
                  </div>

                  {/* Jumlah Helai Pakan/Inch */}
                  <div className="border-b pb-2 space-y-2">
                    <div className="text-sm">Jumlah Helai Pakan/Inch</div>
                    <div className="text-lg">{fabricSpec.pickPerInch}</div>
                  </div>

                  {/* Pinggiran */}
                  <div className="border-b pb-2 space-y-2">
                    <div className="text-sm">Pinggiran</div>
                    <div className="text-lg">
                      {fabricSpec.fringe === 0
                        ? 'Tidak Pakai Pinggiran'
                        : `${fabricSpec.fringe} Helai`}
                    </div>
                  </div>
                </div>

                {/* Benang Warna yang Masuk */}
                <div className="border-b pb-2 space-y-2 mt-5">
                  <div className="text-sm">Benang Warna yang Masuk</div>
                  <div className="text-lg">
                    {colorLayoutContent ? (
                      <ColorInfoDisplay colorContent={colorLayoutContent} />
                    ) : (
                      fabricSpec.color
                    )}
                  </div>
                </div>
              </div>

              <div className="border p-4 rounded-lg min-w-sm">
                <h3 className="text-[18px] mb-3">Cutmark</h3>
                <div className="space-y-2">
                  {fabricSpec.cutmarkPerRoll.map((cutmark, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-accent/50 p-3 rounded border"
                    >
                      <span>{cutmark.roll} Roll</span>
                      <span className="text-muted-foreground">
                        {cutmark.length.toLocaleString()} meter
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter>Last Update: {displayDate}</CardFooter>
      </Card>
    </div>
  )
}
