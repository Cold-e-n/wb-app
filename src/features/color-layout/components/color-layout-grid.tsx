import { useMemo } from 'react'
import { ColorContent } from '@/types/ColorLayout'

interface ColorLayoutGridProps {
  colorContent: ColorContent
}

export const ColorLayoutGrid = ({ colorContent }: ColorLayoutGridProps) => {
  const layout = useMemo(() => {
    const items: (
      | { type: 'gap'; value: number }
      | { type: 'marker'; label: string }
    )[] = []

    // 1. IN Section: Gap -> Marker (Repeated for IN.count)
    if (colorContent.IN) {
      for (let i = 0; i < colorContent.IN.count; i++) {
        items.push({ type: 'gap', value: colorContent.IN.distance })
        items.push({
          type: 'marker',
          label: colorContent.IN.count > 1 ? `IN ${i + 1}` : 'IN',
        })
      }
    }

    // 2. Main L-Series Section: Gap -> Marker (Repeated for colorCount)
    for (let i = 0; i < colorContent.colorCount; i++) {
      items.push({ type: 'marker', label: `L${i + 1}` })
      if (i < colorContent.colorCount - 1) {
        items.push({ type: 'gap', value: colorContent.colorDistance })
      }
    }

    // 3. OUT Section: Gap -> Marker (Repeated for OUT.count)
    if (colorContent.OUT) {
      for (let i = 0; i < colorContent.OUT.count; i++) {
        items.push({
          type: 'marker',
          label: colorContent.OUT.count > 1 ? `OUT ${i + 1}` : 'OUT',
        })
        items.push({ type: 'gap', value: colorContent.OUT.distance })
      }
    }

    return items
  }, [colorContent])

  return (
    <div className="group/container relative w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-md transition-shadow hover:shadow-lg">
      <div className="w-full overflow-x-auto p-6 md:p-12 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-300">
        <div className="relative flex min-w-max items-center py-16 px-4">
          {/* Continuous Horizontal Center Line */}
          <div className="absolute left-0 right-0 top-1/2 z-10 h-[2.5px] -translate-y-1/2 bg-black" />

          {/* Render Layout Sequence */}
          {layout.map((item, index) => {
            if (item.type === 'gap') {
              return (
                <div
                  key={`gap-${index}`}
                  className="relative flex h-24 items-center justify-center px-3 min-w-[32px]"
                >
                  {/* Distance Value above the horizontal line */}
                  <span className="relative z-20 -translate-y-6 text-[13px] md:text-[14px] font-black text-zinc-900 bg-white px-1">
                    {item.value}
                  </span>
                </div>
              )
            }

            return (
              <div
                key={`marker-${index}`}
                className="relative z-30 flex h-32 items-center"
              >
                {/* Red Vertical Marker Line */}
                <div className="h-full w-[2.5px] bg-red-600" />

                {/* Marker Label below the horizontal line */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] md:text-[12px] font-black uppercase tracking-tight text-zinc-900 bg-white px-1">
                  {item.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
