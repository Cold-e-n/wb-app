import { useFabricById } from '../hooks/use-fabric'
import { Fabric } from '@/types/Fabric'
import { ColorContent } from '@/types/ColorLayout'

import { ColorInfoDisplay } from '@/features/color-layout/components/color-layout-details'

type FabricDetailsProps = {
  fabric: Fabric
}

export const FabricDetails = ({ fabric }: FabricDetailsProps) => {
  const { data: fabricById, isLoading } = useFabricById(fabric.id)

  return (
    <div className="space-y-4">
      <div className="flex flex-row gap-5">
        <div className="flex flex-col text-muted-foreground">
          <span>Nama</span>
          <span>Benang Warna</span>
        </div>

        <div className="flex flex-1 flex-col text-[15px] font-light">
          <span>{fabric.name}</span>
          <span>
            {fabric.hasColor ? (
              isLoading ? (
                '...'
              ) : fabricById?.colorLayout?.colorContent ? (
                <ColorInfoDisplay
                  colorContent={
                    fabricById.colorLayout.colorContent as ColorContent
                  }
                />
              ) : (
                '-'
              )
            ) : (
              '-'
            )}
          </span>
        </div>
      </div>
    </div>
  )
}
