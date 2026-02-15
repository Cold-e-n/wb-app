import { useMemo } from 'react'
import { ColorContent } from '@/types/ColorLayout'

interface ColorLayoutGrid2Props {
  colorContent: ColorContent
}

export const ColorLayoutGrid2 = ({ colorContent }: ColorLayoutGrid2Props) => {
  const isDouble = colorContent.type === 'double'

  const sheets = useMemo(() => {
    const inColumns = colorContent.IN
      ? Array(colorContent.IN.count).fill(colorContent.IN.distance)
      : []

    const outColumns = colorContent.OUT
      ? Array(colorContent.OUT.count).fill(colorContent.OUT.distance)
      : []

    let mainColumns: (number | string)[] = []

    if (isDouble) {
      // Double mode: [PairMarker, Gap, PairMarker, Gap, ...]
      for (let i = 0; i < colorContent.colorCount; i++) {
        if (i > 0) {
          mainColumns.push(colorContent.colorDistance)
        }
        mainColumns.push(colorContent.colorPairDistance || 1)
      }
    } else {
      // Single/Triple mode: [Gap, Gap, Gap, ...]
      mainColumns = Array(colorContent.colorCount - 1).fill(
        colorContent.colorDistance,
      )
    }

    const result: (number | string)[] = []

    if (inColumns.length > 0) {
      result.push(...inColumns)
    }

    result.push('') // Left boundary blank column
    result.push(...mainColumns)
    result.push('') // Right boundary blank column

    if (outColumns.length > 0) {
      result.push(...outColumns)
    }

    return result
  }, [colorContent, isDouble])
  const inCount = colorContent.IN ? colorContent.IN.count : 0

  const mainColumnCount = isDouble
    ? 2 * colorContent.colorCount - 1
    : colorContent.colorCount - 1

  const leftBorderIndex = inCount
  const rightBorderIndex = inCount + mainColumnCount + 1

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-zinc-300 bg-zinc-200 py-10 px-5 shadow-sm">
      <div className="relative flex min-w-max">
        <div className="absolute top-1/2 z-10 h-0.5 w-full -translate-y-1/2 bg-black" />

        {sheets.map((sheet, index) => {
          let markerLabel = ''
          let cellLabel = ''

          // IN labels: aligned with left border of each IN gap
          if (index < leftBorderIndex) {
            markerLabel = 'IN'
          }

          // Main labels
          if (index > leftBorderIndex && index < rightBorderIndex) {
            const mainRelIdx = index - leftBorderIndex - 1
            if (isDouble) {
              // Double: labels are centered under the PairMarker cells (0, 2, 4...)
              if (mainRelIdx % 2 === 0) {
                cellLabel = `L${Math.floor(mainRelIdx / 2) + 1}`
              }
            } else {
              // Single: labels are marker-based (left border of each main gap)
              markerLabel = `L${mainRelIdx + 1}`
            }
          }

          // Last L label (single) or boundary marker
          if (index === rightBorderIndex) {
            if (!isDouble) {
              markerLabel = `L${colorContent.colorCount}`
            }
          }

          // OUT labels: aligned with left border of each OUT gap
          if (index > rightBorderIndex) {
            markerLabel = 'OUT'
          }

          return (
            <div
              key={`sheet-${index}`}
              className={`group relative flex h-32 flex-1 items-center justify-center border-black ${
                index !== 0 ? 'border-l' : ''
              }`}
            >
              <span className="relative z-20 -translate-y-2 px-1 text-[12px] font-mono text-zinc-800">
                {sheet}
              </span>

              {markerLabel && (
                <div className="absolute -bottom-8 left-0 z-30 -translate-x-1/2 font-mono text-[12px] whitespace-nowrap text-zinc-800">
                  {markerLabel}
                </div>
              )}

              {cellLabel && (
                <div className="absolute -bottom-8 left-1/2 z-30 -translate-x-1/2 font-mono text-[12px] whitespace-nowrap text-zinc-800">
                  {cellLabel}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
