import {  clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type {ClassValue} from 'clsx';
import type {ColorContent} from '@/types/ColorLayout';

export function cn(...inputs: Array<ClassValue>) {
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
