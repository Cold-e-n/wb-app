import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ClassValue } from 'clsx'
import type { ColorContent } from '@/types/ColorLayout'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sleep(ms: number = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\//g, '-')
    .replace(/[^\w\s-]/g, ' ')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Generates page numbers for pagination with ellipsis
 * @param currentPage - Current page number (1-based)
 * @param totalPages - Total number of pages
 * @returns Array of page numbers and ellipsis strings
 *
 * Examples:
 * - Small dataset (≤5 pages): [1, 2, 3, 4, 5]
 * - Near beginning: [1, 2, 3, 4, '...', 10]
 * - In middle: [1, '...', 4, 5, 6, '...', 10]
 * - Near end: [1, '...', 7, 8, 9, 10]
 */
export function getPageNumbers(currentPage: number, totalPages: number) {
  const maxVisiblePages = 5 // Maximum number of page buttons to show
  const rangeWithDots = []

  if (totalPages <= maxVisiblePages) {
    // If total pages is 5 or less, show all pages
    for (let i = 1; i <= totalPages; i++) {
      rangeWithDots.push(i)
    }
  } else {
    // Always show first page
    rangeWithDots.push(1)

    if (currentPage <= 3) {
      // Near the beginning: [1] [2] [3] [4] ... [10]
      for (let i = 2; i <= 4; i++) {
        rangeWithDots.push(i)
      }
      rangeWithDots.push('...', totalPages)
    } else if (currentPage >= totalPages - 2) {
      // Near the end: [1] ... [7] [8] [9] [10]
      rangeWithDots.push('...')
      for (let i = totalPages - 3; i <= totalPages; i++) {
        rangeWithDots.push(i)
      }
    } else {
      // In the middle: [1] ... [4] [5] [6] ... [10]
      rangeWithDots.push('...')
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        rangeWithDots.push(i)
      }
      rangeWithDots.push('...', totalPages)
    }
  }

  return rangeWithDots
}

export const getColorClass = (colorName: string | undefined): string => {
  if (!colorName) return 'text-gray-900'
  const name = colorName.toUpperCase()
  if (name.includes('RED')) return 'text-red-500'
  if (name.includes('BLACK')) return 'text-black'
  if (name.includes('GREEN')) return 'text-green-500'
  if (name.includes('BLUE')) return 'text-blue-500'
  if (name.includes('YELLOW')) return 'text-yellow-500'
  if (name.includes('ORANGE')) return 'text-orange-500'
  if (name.includes('PURPLE')) return 'text-purple-500'
  if (name.includes('PINK')) return 'text-pink-500'
  if (name.includes('BROWN')) return 'text-amber-800'
  if (name.includes('GRAY') || name.includes('GREY')) return 'text-gray-500'
  if (name.includes('WHITE')) return 'text-slate-300'
  if (name.includes('NAVY')) return 'text-blue-900'
  if (name.includes('TURQ') || name.includes('CYAN')) return 'text-cyan-500'
  if (name.includes('TEAL')) return 'text-teal-500'
  if (name.includes('LIME')) return 'text-lime-500'
  if (name.includes('ROSE')) return 'text-rose-500'
  if (name.includes('EMERALD')) return 'text-emerald-500'
  if (name.includes('VIOLET')) return 'text-violet-500'
  if (name.includes('GOLD')) return 'text-yellow-600'
  if (name.includes('SILVER')) return 'text-slate-400'
  return 'text-gray-900'
}

export const getColorClassById = (
  colorId: string,
  colorMap: Map<string, string>,
) => {
  if (!colorId) return 'text-gray-900'
  let colorName = colorMap.get(colorId)
  if (!colorName) colorName = colorId
  return getColorClass(colorName)
}

export const getArrowColorClass = (
  markerIdx: number,
  arrowIdx: number,
  colorMap: Map<string, string>,
  colorContent: ColorContent,
) => {
  const { IN, OUT, color, colorCount } = colorContent
  const inCount = IN?.count ?? 0
  let colorIdx: string | undefined

  if (markerIdx < inCount) {
    // IN markers are sequential: each marker index maps to its color array index
    colorIdx = IN?.color?.[markerIdx] || IN?.color?.[0]
  } else if (markerIdx < inCount + colorCount) {
    // Regular markers: use arrowIdx for pairs/triples
    colorIdx = color?.[arrowIdx] || color?.[0]
  } else {
    // OUT markers are sequential: index relative to start of OUT section
    const outMarkerIdx = markerIdx - (inCount + colorCount)
    colorIdx = OUT?.color?.[outMarkerIdx] || OUT?.color?.[0]
  }

  return getColorClassById(colorIdx ?? '', colorMap)
}

export const isEdgeMarker = (
  markerIdx: number,
  colorContent: ColorContent,
): boolean => {
  const { type: layoutType, edgeTriple, IN, colorCount } = colorContent
  const inCount = IN?.count ?? 0
  const regularIdx = markerIdx - inCount

  if (!edgeTriple || layoutType !== 'double') return false
  return regularIdx === 0 || regularIdx === colorCount - 1
}

export const isColorLayoutId = (value: string | null | undefined): boolean => {
  return !!value && /^c[a-z0-9]{24,}$/i.test(value)
}

export const incrementMachineName = (name: string): string => {
  const match = name.match(/^(.*?)(\d+)$/)

  if (!match) return name

  const prefix = match[1]
  const numberPart = match[2]
  const nextNumber = parseInt(numberPart, 10) + 1
  const hasLeadingZero = numberPart.startsWith('0') && numberPart.length > 1

  if (hasLeadingZero) {
    return `${prefix}${nextNumber.toString().padStart(numberPart.length, '0')}`
  }

  return `${prefix}${nextNumber}`
}

export const colorInfo = (
  colorContent: ColorContent | undefined | null,
  colorMap: Map<string, string>,
  isOrder?: boolean,
): string => {
  if (!colorContent) return ''

  const { IN, OUT, colorCount, color = [], type, edgeTriple } = colorContent

  const getColorName = (colorId: string) => {
    return colorMap.get(colorId) || colorId || '...'
  }

  const parts: string[] = []

  if (type === 'double') {
    const isSameColor = color.length === 2 && color[0] === color[1]

    if (isOrder) {
      // isOrder: tampilkan nama warna saja dipisah " & ", tanpa colorCount
      if (isSameColor) {
        parts.push(getColorName(color[0]))
      } else {
        const colorParts: string[] = []
        if (color[0]) colorParts.push(getColorName(color[0]))
        if (color[1]) colorParts.push(getColorName(color[1]))
        parts.push(colorParts.join(' & '))
      }
    } else {
      if (isSameColor) {
        parts.push(`${getColorName(color[0])} Double ${colorCount} Helai`)
      } else {
        const colorParts: string[] = []
        if (color[0]) colorParts.push(getColorName(color[0]))
        if (color[1]) colorParts.push(getColorName(color[1]))
        parts.push(`${colorParts.join(' + ')} ${colorCount} Helai`)
      }
    }

    if (edgeTriple) {
      parts.push(`Triple ${getColorName(edgeTriple.color)}`)
    }
  } else {
    const firstColor = color[0] ? getColorName(color[0]) : ''
    // isOrder: tanpa colorCount
    parts.push(isOrder ? firstColor : `${firstColor} ${colorCount} Helai`)
  }

  if (IN) {
    const inColors = IN.color.map(getColorName).filter(Boolean)
    parts.push(`IN ${IN.count} Helai (${inColors.join(' + ')})`)
  }

  if (OUT) {
    // Sembunyikan nama warna OUT hanya kalau semua warna OUT sama dengan warna utama (color[0])
    const mainColor = color[0]
    const allOutSameAsMain =
      mainColor !== undefined &&
      OUT.color.length > 0 &&
      OUT.color.every((c) => c === mainColor)

    if (allOutSameAsMain) {
      parts.push(`OUT ${OUT.count} Helai`)
    } else {
      const outColors = OUT.color.map(getColorName).filter(Boolean)
      parts.push(`OUT ${OUT.count} Helai (${outColors.join(' + ')})`)
    }
  }

  return parts.join(' + ')
}

/**
 * Truncates a string to a specified length and appends a suffix.
 */
export function truncate(
  text: string,
  length: number = 40,
  suffix: string = '...',
) {
  if (text.length <= length) return text
  return text.slice(0, length) + suffix
}

/**
 *
 */
export const fringeWidth = ({
  fringe,
  reedNo,
}: {
  fringe: number
  reedNo: string
}): number => {
  const reedNoValue = parseFloat(reedNo.match(/\d+\.?\d*/)?.[0] || '0')
  return fringe !== 0 ? Number((fringe / 2 / reedNoValue / 2).toFixed(2)) : 0
}

/**
 *
 * @param wbNo
 * @returns
 */
export const encodeWbNo = (wbNo: string): string => {
  return wbNo.toLocaleLowerCase().replace(/\s+/g, '-')
}

/**
 *
 * @param wbNo
 * @returns
 */
export const decodeWbNo = (wbNo: string): string => {
  return wbNo.toUpperCase().replace(/-/g, ' ')
}

/**
 *
 * @param machine
 * @returns
 */
export const getWeavingMachineLabel = (machine: {
  name: string
  width: number
  type: string
}) => {
  let processedType = machine.type
  if (machine.width !== 380) {
    processedType = 'ZAX'
  } else {
    processedType = machine.type.replace(/\(.*?\)/g, '').trim()
  }
  return `${machine.name} (${machine.width}) ${processedType}`
}
