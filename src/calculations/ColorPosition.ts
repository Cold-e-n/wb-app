import type {ColorPositionWithRelations} from '@/types/ColorPosition';

/**
 * Representasi data per seksi hasil kalkulasi.
 * - topRow   : nilai gap dan fill di baris utama (atas border horizontal).
 * - bottomRow: nilai sisa setelah benang pertama (splitStart) atau
 *              sisa jarak pair sebelum benang kedua (splitContinue).
 * - splitStart   : seksi ini memiliki benang pertama marker yang terpotong.
 * - splitContinue: seksi ini menerima lanjutan (benang kedua) dari seksi sebelumnya.
 */
export interface SectionData {
  topRow: number[]
  bottomRow: number[]
  splitStart: boolean
  splitContinue: boolean
}

/**
 * Class untuk menghitung posisi benang warna.
 * @returns SectionData[]
 */
export class ColorPositionCalculator {
  private readonly data: ColorPositionWithRelations

  /**
   * Lebar marker per seksi — diisi saat placeColors berjalan.
   * Digunakan oleh fillGaps untuk menghitung sisa benang secara akurat.
   */
  private sectionMarkerWidths: Array<Array<number>> = []

  /**
   * Constructor untuk inisialisasi data posisi warna.
   * @param data Data posisi warna dengan relasi kain dan layout.
   */
  constructor(data: ColorPositionWithRelations) {
    this.data = data
  }

  /**
   * Menghitung offset awal (posisi benang pertama).
   * @returns number
   */
  private firstPos(): number {
    const { cones, sections } = this.data.fabricContent
    const { type, colorDistance, colorCount, colorPairDistance, edgeTriple } =
      this.data.colorLayout.colorContent
    const totalThreads =
      cones.length === 1
        ? cones[0] * sections
        : cones[0] * (sections - 1) + cones[1]

    if (type === 'single') {
      return Math.floor(
        (totalThreads - (colorDistance * (colorCount - 1) + colorCount)) / 2,
      )
    }

    if (type === 'double') {
      const pD = colorPairDistance ?? 0

      if (edgeTriple && colorCount >= 2) {
        // Edge-triple: marker pinggir = 5 benang + 2×pD, marker tengah = 2 + pD
        // consumed = cD×(cC-1) + (2pD+5)×2 + (cC-2)×(pD+2)
        const consumed =
          colorDistance * (colorCount - 1) +
          (2 * pD + 5) * 2 +
          (colorCount - 2) * (pD + 2)
        return Math.floor((totalThreads - consumed) / 2)
      }

      // Regular double: semua marker = 2 + pD
      return Math.floor(
        (totalThreads -
          (colorDistance * (colorCount - 1) + (pD + 2) * colorCount)) /
          2,
      )
    }

    return 0
  }

  /**
   * Fungsi utama untuk menghitung distribusi posisi benang warna di setiap seksi.
   * @returns SectionData[]
   */
  public calculate(): Array<SectionData> {
    const { sections } = this.data.fabricContent
    const results: Array<SectionData> = Array.from({ length: sections }, () => ({
      topRow: [],
      bottomRow: [],
      splitStart: false,
      splitContinue: false,
    }))
    this.sectionMarkerWidths = Array.from({ length: sections }, () => [])

    this.placeInColors(results)
    this.placeColors(results)
    this.fillGaps(results)

    return results
  }

  /**
   * Logika penempatan warna untuk bagian IN di awal seksi pertama.
   * @param results Array hasil untuk menampung gap.
   */
  private placeInColors(results: Array<SectionData>): void {
    const { IN } = this.data.colorLayout.colorContent
    if (!IN || IN.count === 0) return

    results[0].topRow.push(0)
    for (let i = 0; i < IN.count - 1; i++) {
      results[0].topRow.push(IN.distance)
      this.sectionMarkerWidths[0].push(1)
    }
  }

  /**
   * Menghitung lebar marker default (untuk tipe double / single).
   * @returns number
   */
  private getDefaultMarkerWidth(): number {
    const { type, colorPairDistance } = this.data.colorLayout.colorContent
    return type === 'double' ? 2 + (colorPairDistance ?? 0) : 1
  }

  /**
   * Menghitung lebar marker berdasarkan indeks marker (0-indexed).
   * Untuk edge-triple double, marker pertama dan terakhir lebih lebar.
   * @param markerIndex Indeks marker regular (0 sampai colorCount-1).
   * @returns number
   */
  private getMarkerWidth(markerIndex: number): number {
    const { type, colorPairDistance, edgeTriple, colorCount } =
      this.data.colorLayout.colorContent

    if (
      type === 'double' &&
      edgeTriple &&
      colorCount >= 2 &&
      (markerIndex === 0 || markerIndex === colorCount - 1)
    ) {
      const pD = colorPairDistance ?? 0
      return 2 * pD + 5 // 2 main color + 3 triple black + 2 pairDist gaps
    }

    return this.getDefaultMarkerWidth()
  }

  /**
   * Mengambil kapasitas total benang (cones) pada seksi tertentu.
   * @param index Indeks seksi (0-n).
   * @returns number
   */
  private getSectionCones(index: number): number {
    const { cones, sections } = this.data.fabricContent
    return cones.length > 1 && index === sections - 1 ? cones[1] : cones[0]
  }

  /**
   * Kalkulasi total benang yang sudah terpakai di sebuah seksi,
   * termasuk benang warna dan gap yang sudah ditempatkan.
   * @param gaps Array jarak gap yang sudah ada di seksi tersebut.
   * @param markerWidths Array lebar marker yang sudah ditempatkan di seksi tersebut.
   * @returns number.
   */
  private calculateUsedThreads(gaps: Array<number>, markerWidths: Array<number>): number {
    return (
      gaps.reduce((acc, g) => acc + g, 0) +
      markerWidths.reduce((acc, w) => acc + w, 0)
    )
  }

  /**
   * Kalkulasi total benang terpakai di sebuah SectionData,
   * menggabungkan topRow, bottomRow, dan sectionMarkerWidths.
   */
  private calculateSectionUsed(s: number, section: SectionData): number {
    return this.calculateUsedThreads(
      [...section.topRow, ...section.bottomRow],
      this.sectionMarkerWidths[s],
    )
  }

  /**
   * Melakukan iterasi untuk menentukan di seksi mana setiap benang warna harus diletakkan.
   *
   * Untuk tipe "double", jika gap muat tapi seluruh marker (2 + pD) tidak muat,
   * marker dipotong: benang pertama ditempatkan di seksi sekarang (splitStart),
   * benang kedua ditempatkan di seksi berikutnya (splitContinue).
   *
   * @param results Array SectionData hasil untuk menampung gap.
   */
  private placeColors(results: Array<SectionData>): void {
    const { sections } = this.data.fabricContent
    const { colorCount, colorDistance, type, colorPairDistance } =
      this.data.colorLayout.colorContent
    const pD = colorPairDistance ?? 0

    let currentSection = 0
    let colorsPlaced = 0
    let gapToNextColor = this.firstPos()

    /**
     * Carry gap sisa pairDistance yang harus ditempatkan di awal seksi berikutnya
     * ketika marker double terpotong di batas seksi.
     */
    let pendingSplitCarry: number | null = null

    while (currentSection < sections && colorsPlaced < colorCount) {
      const section = results[currentSection]
      const markerWidths = this.sectionMarkerWidths[currentSection]

      // --- Tangani lanjutan split dari seksi sebelumnya ---
      if (pendingSplitCarry !== null) {
        section.splitContinue = true
        section.bottomRow.push(pendingSplitCarry)
        // Benang kedua ditempatkan (width = 1)
        markerWidths.push(1)
        colorsPlaced++
        pendingSplitCarry = null
        gapToNextColor = colorDistance
        // Lanjut ke iterasi berikutnya di seksi yang sama untuk mengisi sisa
        continue
      }

      const sectCones = this.getSectionCones(currentSection)
      const usedThreads = this.calculateSectionUsed(currentSection, section)
      const remainingThreads = sectCones - usedThreads

      if (gapToNextColor <= remainingThreads) {
        const markerWidth = this.getMarkerWidth(colorsPlaced)
        const spaceAfterGap = remainingThreads - gapToNextColor

        // Cek apakah seluruh marker muat
        if (spaceAfterGap >= markerWidth) {
          // Penempatan normal
          section.topRow.push(gapToNextColor)
          markerWidths.push(markerWidth)
          colorsPlaced++
          gapToNextColor = colorDistance
        } else if (type === 'double' && spaceAfterGap >= 1) {
          // Split marker: benang pertama muat, benang kedua carry ke seksi berikutnya
          // spaceAfterGap = remaining - gap, mis. 335-332 = 3
          // spaceAfterFirstThread = spaceAfterGap - 1 (1 untuk benang pertama)
          const spaceAfterFirstThread = spaceAfterGap - 1

          section.topRow.push(gapToNextColor)          // gap sebelum benang pertama
          section.bottomRow.push(spaceAfterFirstThread) // sisa ruang setelah benang pertama
          section.splitStart = true
          markerWidths.push(1) // hanya benang pertama (1 thread)

          // Sisa pairDistance = pD - spaceAfterFirstThread
          pendingSplitCarry = pD - spaceAfterFirstThread
          currentSection++
        } else {
          // Gap muat tapi tidak ada ruang untuk benang (spaceAfterGap == 0), carry over
          gapToNextColor -= remainingThreads
          currentSection++
        }
      } else {
        gapToNextColor -= remainingThreads
        currentSection++
      }
    }
  }

  /**
   * Mengisi gap terakhir untuk setiap seksi guna memastikan total benang
   * di setiap sub-array hasil sesuai dengan kapasitas seksi (sectCones).
   * @param results Array hasil yang sudah berisi posisi warna.
   */
  private fillGaps(results: Array<SectionData>): void {
    const { sections } = this.data.fabricContent
    const { OUT } = this.data.colorLayout.colorContent

    for (let s = 0; s < sections; s++) {
      const sectCones = this.getSectionCones(s)
      const section = results[s]
      const usedThreads = this.calculateSectionUsed(s, section)
      const remainingThreads = sectCones - usedThreads

      // Seksi splitStart sudah penuh (gap + 1 benang + bottomRow = sectCones)
      if (section.splitStart) continue

      if (s === sections - 1 && OUT) {
        section.topRow.push(...this.calculateOutGaps(remainingThreads))
        continue
      }

      section.topRow.push(remainingThreads)
    }
  }

  /**
   * Logika khusus untuk menghitung distribusi warna pada bagian OUT di seksi terakhir.
   * @param remainingCapacity Sisa ruang di seksi terakhir.
   * @returns Array gap untuk seksi OUT.
   */
  private calculateOutGaps(remainingCapacity: number): Array<number> {
    const { OUT, edgeTriple } = this.data.colorLayout.colorContent
    const { fringe } = this.data.fabricContent

    if (!OUT) return [remainingCapacity]

    const totalOutGap = OUT.distance * OUT.count
    // OUT markers diasumsikan single thread (lebar 1)
    const firstValue =
      remainingCapacity -
      totalOutGap -
      (edgeTriple ? 0 : OUT.count) -
      (fringe || 0)
    const results: Array<number> = [firstValue]

    for (let i = 0; i < OUT.count; i++) {
      const n =
        i === OUT.count - 1 ? OUT.distance + (fringe || 0) : OUT.distance
      results.push(n)
    }

    return results
  }
}
