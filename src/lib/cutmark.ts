import type {
  CutmarkChunk,
  CutmarkItem,
  CutmarkCombination,
} from '@/types/Cutmark'

/**
 *
 * @param value
 * @returns
 */
export const parseCutmark = (value: string) => {
  const parts = value
    .split('+')
    .map((s) => s.trim())
    .filter(Boolean)

  return parts
}

/**
 *
 */
export const parseCutmarkTest = (
  value: string,
): {
  testTying: number
  testStretching: number[]
} => {
  const parts = parseCutmark(value)

  const parseMeters = (s: string) => {
    // Hanya tangkap angka murni yang diakhiri huruf 'm' (contoh: 10m, 35.5m)
    const match = s.match(/^(\d+(?:\.\d+)?)m$/)
    // Kembalikan null jika tidak cocok, JANGAN kembalikan 0
    return match ? Number(match[1]) : null
  }

  // testTying selalu ada di urutan paling depan (index 0)
  const testTying = parseMeters(parts[0] ?? '') ?? 10

  const testStretching: number[] = []

  // Baca dari belakang ke depan
  for (let i = parts.length - 1; i > 0; i--) {
    const meters = parseMeters(parts[i])

    if (meters !== null) {
      testStretching.unshift(meters)
    } else {
      // HENTIKAN LOOP! Begitu kita menabrak string seperti "( 680m x 1 )",
      // berarti area test stretching sudah habis dan kita masuk ke area roll.
      break
    }
  }

  return {
    testTying,
    testStretching: testStretching.length > 0 ? testStretching : [35],
  }
}

/**
 *
 * @param value
 * @returns
 */
export const parseCutmarkChunks = (
  value: string,
): Array<{ length: number; count: number }> => {
  const parts = parseCutmark(value)
  const chunks: Array<{ length: number; count: number }> = []

  for (const part of parts) {
    // Pola ini hanya akan menangkap teks seperti "( 1,016m x 1 )" atau "( 680.5m x 2 )"
    const match = part.match(/\(\s*([\d,.]+)\s*m\s*x\s*(\d+)\s*\)/)

    if (match) {
      // Hilangkan koma ribuan (jika ada) sebelum di-convert ke Number
      const length = Number(match[1].replace(/,/g, ''))
      const count = Number(match[2])
      chunks.push({ length, count })
    }
  }

  return chunks
}

/**
 *
 * @param sequence
 * @returns
 */
export const calculateTotalLength = (sequence: Array<CutmarkChunk>): number =>
  sequence.reduce((sum, item) => {
    if (item.type === 'test-tying' || item.type === 'test-stretching') {
      return sum + (item.length || 0)
    }
    return sum + (item.length || 0) * (item.count || 1)
  }, 0)

export const calculateMaxBeamingLoss = (
  coneLength: number,
  rawLength: number,
  sectionCount: number,
): number => {
  if (coneLength <= 0 || sectionCount <= 0) return 0
  const maxLength = coneLength / sectionCount - rawLength - 8
  return Math.max(0, Math.floor(maxLength))
}

/**
 *
 * @param rollCount
 * @param cutmarks
 * @returns
 */
export const generateCutmarkCombinations = (
  rollCount: number,
  cutmarks: CutmarkItem[],
): CutmarkCombination[] => {
  if (!cutmarks.length || rollCount <= 0) return []

  const sortedCutmarks = [...cutmarks].sort((a, b) => b.roll - a.roll)

  // 1. Cari kombinasi secara efisien dan kelompokkan otomatis (Backtracking)
  const exactSolutions: Array<Array<{ cm: CutmarkItem; count: number }>> = []

  const backtrack = (
    remaining: number,
    startIndex: number,
    currentCombo: Array<{ cm: CutmarkItem; count: number }>,
  ) => {
    if (remaining === 0) {
      exactSolutions.push([...currentCombo])
      return
    }
    if (remaining < 0) return

    for (let i = startIndex; i < sortedCutmarks.length; i++) {
      const cm = sortedCutmarks[i]
      if (cm.roll > remaining) continue

      const maxCount = Math.floor(remaining / cm.roll)
      // Ambil pecahan ini sebanyak mungkin, otomatis grouping
      for (let count = maxCount; count >= 1; count--) {
        currentCombo.push({ cm, count })
        // i + 1 memastikan kita pindah ke roll lain, mencegah duplikasi
        backtrack(remaining - cm.roll * count, i + 1, currentCombo)
        currentCombo.pop()
      }
    }
  }

  backtrack(rollCount, 0, [])

  // 2. Filter hanya solusi dengan potongan (chunks) paling sedikit
  let bestSolutions: Array<Array<{ cm: CutmarkItem; count: number }>> = []

  if (exactSolutions.length > 0) {
    const solutionsWithCount = exactSolutions.map((sol) => ({
      sol,
      totalChunks: sol.reduce((sum, item) => sum + item.count, 0),
    }))

    // Cari angka efisiensi terbaik (misal: 2 potong)
    const minChunks = Math.min(...solutionsWithCount.map((s) => s.totalChunks))

    // Saring hanya kombinasi yang jumlah potongannya sama dengan minChunks
    bestSolutions = solutionsWithCount
      .filter((s) => s.totalChunks === minChunks)
      .map((s) => s.sol)
  } else {
    // Greedy fallback jika tidak ada solusi yang pas (tetap seperti aslinya)
    const greedyChunks: Array<{ cm: CutmarkItem; count: number }> = []
    let remaining = rollCount

    for (const cm of sortedCutmarks) {
      if (remaining <= 0) break
      if (cm.roll > remaining) continue
      const count = Math.floor(remaining / cm.roll)
      if (count > 0) {
        greedyChunks.push({ cm, count })
        remaining -= cm.roll * count
      }
    }
    bestSolutions.push(greedyChunks)
  }

  // Sort: Jika ada opsi efisiensi sama, prioritaskan total panjang (meter) terpanjang
  bestSolutions.sort((a, b) => {
    const totalA = a.reduce((s, x) => s + x.cm.length * x.count, 0)
    const totalB = b.reduce((s, x) => s + x.cm.length * x.count, 0)
    return totalB - totalA
  })

  return bestSolutions.map((sol, i) => {
    const chunks: CutmarkChunk[] = sol.map(({ cm, count }) => ({
      id: `cutmark-${cm.roll}`,
      roll: cm.roll,
      length: cm.length,
      count,
      type: 'roll' as const,
    }))

    const totalLength = chunks.reduce((s, c) => s + c.length * c.count, 0)
    const coveredRolls = chunks.reduce((s, c) => s + c.roll * c.count, 0)
    const remainderRolls = rollCount - coveredRolls

    // 3. Format Label sesuai permintaan: 4Rx2 atau 5R
    const label = chunks
      .map(
        (c) =>
          `${c.roll}R${c.count > 1 ? `x${c.count}` : ''}/${c.length.toLocaleString('en-Us')}m`,
      )
      .join(' + ')

    return {
      id: `combo-${i}`,
      chunks,
      totalLength,
      remainderRolls,
      label,
    }
  })
}
