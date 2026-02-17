import { type ColorPositionWithRelations } from './color-positions-provider'
import { ColorPositionCalculator } from '@/calculations/ColorPosition'
import ReactJson from '@microlink/react-json-view'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    <div className="space-y-6 print-wrap">
      <div className="w-full">
        <Card>
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

      <ColorPositionVisualizer
        calculationResults={results}
        fabricContent={data.fabricContent}
      />

      <Card className="no-print">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Data Mentah (JSON)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-muted/50 p-4 overflow-hidden">
            <ReactJson
              src={data}
              theme="monokai"
              displayDataTypes={false}
              displayObjectSize={false}
              enableClipboard={true}
              name={false}
              collapsed={1}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
