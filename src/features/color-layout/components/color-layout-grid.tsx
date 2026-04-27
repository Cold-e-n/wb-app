import { useMemo } from 'react'
import type { ColorContent } from '@/types/ColorLayout'
import { cn } from '@/lib/utils'

interface ColorLayoutGridProps {
  colorContent: ColorContent
}

export const ColorLayoutGrid = ({ colorContent }: ColorLayoutGridProps) => {
  const isDouble = colorContent.type === 'double'
  const hasEdgeTriple = !!colorContent.edgeTriple && isDouble

  const { sheets, cellLabels, edgeTripleSepIndices } = useMemo(() => {
    const result: Array<number | string> = []
    const labels = new Map<
      number,
      { type: 'marker' | 'cell'; text: string }
    >()
    const edgeSepSet = new Set<number>()

    // 1. IN columns
    if (colorContent.IN) {
      for (let i = 0; i < colorContent.IN.count; i++) {
        labels.set(result.length, { type: 'marker', text: 'IN' })
        result.push(colorContent.IN.distance)
      }
    }

    // 2. Left boundary
    result.push('')

    // 3. Main columns
    if (isDouble) {
      for (let i = 0; i < colorContent.colorCount; i++) {
        if (i > 0) {
          result.push(colorContent.colorDistance)
        }

        const isEdge =
          hasEdgeTriple &&
          (i === 0 || i === colorContent.colorCount - 1)
        const colorLabel = `L${i + 1}`

        if (isEdge) {
          // Edge triple: [colorPairDistance] ||| [colorPairDistance]
          const startIdx = result.length
          result.push(colorContent.colorPairDistance || 1)
          result.push(0) // separator
          result.push(0) // separator
          result.push(0) // separator
          result.push(colorContent.colorPairDistance || 1)
          edgeSepSet.add(startIdx + 1)
          edgeSepSet.add(startIdx + 2)
          edgeSepSet.add(startIdx + 3)
          // Center label under the middle separator
          labels.set(startIdx + 2, { type: 'cell', text: colorLabel })
        } else {
          // Regular pair
          labels.set(result.length, { type: 'cell', text: colorLabel })
          result.push(colorContent.colorPairDistance || 1)
        }
      }
    } else {
      // Single/Triple mode: gaps between markers
      for (let i = 0; i < colorContent.colorCount - 1; i++) {
        labels.set(result.length, { type: 'marker', text: `L${i + 1}` })
        result.push(colorContent.colorDistance)
      }
    }

    // 4. Right boundary
    if (!isDouble) {
      // Last L label for single mode (positioned on the right boundary)
      labels.set(result.length, {
        type: 'marker',
        text: `L${colorContent.colorCount}`,
      })
    }
    result.push('')

    // 5. OUT columns
    if (colorContent.OUT) {
      for (let i = 0; i < colorContent.OUT.count; i++) {
        labels.set(result.length, { type: 'marker', text: 'OUT' })
        result.push(colorContent.OUT.distance)
      }
    }

    return {
      sheets: result,
      cellLabels: labels,
      edgeTripleSepIndices: edgeSepSet,
    }
  }, [colorContent, isDouble, hasEdgeTriple])

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-zinc-300 bg-zinc-200 py-10 px-5 shadow-sm">
      <div className="relative flex min-w-max font-jetbrains-mono">
        <div className="absolute top-1/2 z-10 h-0.5 w-full -translate-y-1/2 bg-black" />

        {sheets.map((sheet, index) => {
          const label = cellLabels.get(index)
          const isEdgeSep = edgeTripleSepIndices.has(index)

          return (
            <div
              key={`sheet-${index}`}
              className={cn(
                'group relative flex items-center justify-center border-black',
                index !== 0 && 'border-l',
                isEdgeSep
                  ? 'h-32 w-1.5 flex-none'
                  : 'h-32 flex-1',
              )}
            >
              <span className="relative z-20 -translate-y-2 px-1 text-[12px] text-zinc-800">
                {sheet === 0 ? '' : sheet}
              </span>

              {label?.type === 'marker' && (
                <div
                  className={cn(
                    'absolute -bottom-8 z-30 text-[12px] whitespace-nowrap text-zinc-800',
                    label.text === 'IN'
                      ? 'right-0 translate-x-1/2'
                      : 'left-0 -translate-x-1/2',
                  )}
                >
                  {label.text}
                </div>
              )}

              {label?.type === 'cell' && (
                <div className="absolute -bottom-8 left-1/2 z-30 -translate-x-1/2 text-[12px] whitespace-nowrap text-zinc-800">
                  {label.text}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
