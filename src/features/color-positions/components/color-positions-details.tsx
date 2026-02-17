import { type ColorPositionWithRelations } from './color-positions-provider'
import { ColorPositionCalculator } from '@/calculations/ColorPosition'
import { Card, CardContent } from '@/components/ui/card'
import { ColorInfoDisplay } from '@/features/color-layout/components/color-layout-details'
import { ColorPositionVisualizer } from './color-position-visualizer'

type ColorPositionsDetailsProps = {
  data: ColorPositionWithRelations
}

export const ColorPositionsDetails = ({ data }: ColorPositionsDetailsProps) => {
  const calculator = new ColorPositionCalculator(data)
  const results = calculator.calculate()
  const colorInfo = ColorInfoDisplay(data.colorLayout)
  const totalThreads = data.fabricContent.cones[0] * data.fabricContent.sections

  return (
    <div className="space-y-6 print:space-y-0 print-wrap">
      <div className="w-full print:mx-2 print:mt-5">
        <Card className="print:border-gray-800">
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-md font-jetbrains-mono">
              <div className="flex flex-col">
                <span>WB - {data.wbNo}</span>
                <span>{data.fabric.name}</span>
                <span>
                  {`${data.fabricContent.cones[0]} cones x ${data.fabricContent.sections} sections = ${totalThreads} Helai`}
                </span>
              </div>

              <div className="flex flex-col">
                <span>
                  {`Jarak Warna: ${data.colorLayout.colorContent.colorDistance} Helai`}
                </span>
                <span>{colorInfo}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ColorPositionVisualizer positionResults={results} dataColor={data} />
    </div>
  )
}
