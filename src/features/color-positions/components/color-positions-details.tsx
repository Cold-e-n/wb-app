import { type ColorPositionWithRelations } from './color-positions-provider'
import { ColorPositionCalculator } from '@/calculations/ColorPosition'
import ReactJson from '@microlink/react-json-view'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type ColorPositionsDetailsProps = {
  data: ColorPositionWithRelations
}

export const ColorPositionsDetails = ({ data }: ColorPositionsDetailsProps) => {
  const calculator = new ColorPositionCalculator(data)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Informasi Dasar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-xs text-muted-foreground">
                  Kain
                </span>
                <span className="font-medium">{data.fabric.name}</span>
              </div>
              <div>
                <span className="block text-xs text-muted-foreground">
                  No WB
                </span>
                <span className="font-medium">{data.wbNo}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Hasil Kalkulasi (Gaps)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              {calculator.calculate().map((row, i) => (
                <div
                  key={i}
                  className="flex flex-wrap gap-2 py-1 border-b last:border-0 border-dashed"
                >
                  <span className="text-[10px] text-muted-foreground w-6">
                    S{i + 1}
                  </span>
                  {row.map((value, j) => (
                    <div
                      key={j}
                      className="px-2 py-0.5 bg-muted rounded text-[10px] font-mono border"
                    >
                      {value}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
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
