import type {ColorPositionWithRelations} from '@/types/ColorPosition';

/**
 * Class untuk menghitung posisi benang warna.
 * @returns array
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
   * Menggunakan logika kumulatif untuk memastikan jarak antar warna tetap konsisten
   * meskipun melintasi batas seksi atau seksi yang kosong.
   * @returns number[][]
   */
  public calculate(): Array<Array<number>> {
    const { sections } = this.data.fabricContent
    const results: Array<Array<number>> = Array.from({ length: sections }, () => [])
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
  private placeInColors(results: Array<Array<number>>): void {
    const { IN } = this.data.colorLayout.colorContent
    if (!IN || IN.count === 0) return

    // IN markers ditempatkan di awal seksi 0
    // Marker pertama diletakkan setelah gap 0 (langsung di awal)
    // Marker berikutnya diletakkan setelah gap IN.distance
    // Sederhananya: [gap_0, IN_marker, gap_IN, IN_marker, gap_IN, IN_marker, ...]
    results[0].push(0) // Marker pertama langsung di awal
    for (let i = 0; i < IN.count - 1; i++) {
      results[0].push(IN.distance)
      this.sectionMarkerWidths[0].push(1)
    }
    // Setelah semua IN markers, sisakan gap IN.distance sebelum pattern regular dimulai
    // Namun Calculator.placeColors() sudah mulai dengan firstPos() gap.
    // Jadi gap akhir IN markers akan digabung dengan firstPos()?
    // Tidak, cukup biarkan placeColors menangani gap awalnya sendiri.
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
   * Mendukung perbedaan jumlah cones antara seksi badan dan seksi pinggiran (cones[1]).
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
   * Melakukan iterasi untuk menentukan di seksi mana setiap benang warna harus diletakkan.
   * Jika sisa benang di seksi sekarang tidak cukup untuk jarak 'colorDistance',
   * sisa tersebut akan diteruskan ke seksi berikutnya secara kumulatif.
   * Mendukung lebar marker yang berbeda untuk edge-triple double.
   * @param results Array hasil untuk menampung gap.
   */
  private placeColors(results: Array<Array<number>>): void {
    const { sections } = this.data.fabricContent
    const { colorCount, colorDistance } = this.data.colorLayout.colorContent

    let currentSection = 0
    let colorsPlaced = 0
    let gapToNextColor = this.firstPos()

    while (currentSection < sections && colorsPlaced < colorCount) {
      const sectCones = this.getSectionCones(currentSection)
      const currentSectionGaps = results[currentSection]
      const currentMarkerWidths = this.sectionMarkerWidths[currentSection]
      const usedThreads = this.calculateUsedThreads(
        currentSectionGaps,
        currentMarkerWidths,
      )
      const remainingThreads = sectCones - usedThreads

      if (gapToNextColor <= remainingThreads) {
        currentSectionGaps.push(gapToNextColor)
        currentMarkerWidths.push(this.getMarkerWidth(colorsPlaced))
        colorsPlaced++
        gapToNextColor = colorDistance
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
  private fillGaps(results: Array<Array<number>>): void {
    const { sections } = this.data.fabricContent
    const { OUT } = this.data.colorLayout.colorContent

    for (let s = 0; s < sections; s++) {
      const sectCones = this.getSectionCones(s)
      const usedThreads = this.calculateUsedThreads(
        results[s],
        this.sectionMarkerWidths[s],
      )
      const remainingThreads = sectCones - usedThreads

      if (s === sections - 1 && OUT) {
        results[s].push(...this.calculateOutGaps(remainingThreads))
        continue
      }

      results[s].push(remainingThreads)
    }
  }

  /**
   * Logika khusus untuk menghitung distribusi warna pada bagian OUT di seksi terakhir.
   * Biasanya digunakan untuk benang pinggiran dengan aturan jarak yang berbeda.
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
