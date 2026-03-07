import { type ColorPositionWithRelations } from '@/features/color-positions'

/**
 * Class untuk menghitung posisi benang warna.
 * @returns array
 */
export class ColorPositionCalculator {
  private readonly data: ColorPositionWithRelations

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
    const { type, colorDistance, colorCount } =
      this.data.colorLayout.colorContent
    const totalThreads =
      cones.length === 1
        ? cones[0] * sections
        : cones[0] * (sections - 1) + cones[1]

    const i = () => {
      if (type === 'single') {
        return Math.floor(
          (totalThreads - (colorDistance * (colorCount - 1) + colorCount)) / 2,
        )
      } else if (type === 'double') {
        const { colorPairDistance } = this.data.colorLayout.colorContent
        return Math.floor(
          (totalThreads -
            (colorDistance * (colorCount - 1) +
              ((colorPairDistance ?? 0) + 2) * colorCount)) /
            2,
        )
      }

      return 0
    }

    return i()
  }

  /**
   * Fungsi utama untuk menghitung distribusi posisi benang warna di setiap seksi.
   * Menggunakan logika kumulatif untuk memastikan jarak antar warna tetap konsisten
   * meskipun melintasi batas seksi atau seksi yang kosong.
   * @returns number[][]
   */
  public calculate(): number[][] {
    const { sections } = this.data.fabricContent
    const threadPerColor = this.getThreadPerColor()
    const results: number[][] = Array.from({ length: sections }, () => [])

    this.placeInColors(results)
    this.placeColors(results, threadPerColor)
    this.fillGaps(results, threadPerColor)

    return results
  }

  /**
   * Logika penempatan warna untuk bagian IN di awal seksi pertama.
   * @param results Array hasil untuk menampung gap.
   */
  private placeInColors(results: number[][]): void {
    const { IN } = this.data.colorLayout.colorContent
    if (!IN || IN.count === 0) return

    // IN markers ditempatkan di awal seksi 0
    // Marker pertama diletakkan setelah gap 0 (langsung di awal)
    // Marker berikutnya diletakkan setelah gap IN.distance
    // Marker terakhir diakhiri dengan gap IN.distance sebelum regular markers?
    // Sederhananya: [gap_0, IN_marker, gap_IN, IN_marker, gap_IN, IN_marker, ...]
    results[0].push(0) // Marker pertama langsung di awal
    for (let i = 0; i < IN.count - 1; i++) {
      results[0].push(IN.distance)
    }
    // Setelah semua IN markers, sisakan gap IN.distance sebelum pattern regular dimulai
    // Namun Calculator.placeColors() sudah mulai dengan firstPos() gap.
    // Jadi gap akhir IN markers akan digabung dengan firstPos()?
    // Tidak, cukup biarkan placeColors menangani gap awalnya sendiri.
  }

  /**
   * Menghitung jumlah benang yang dikonsumsi per satu titik penempatan warna.
   * Untuk tipe 'double', dihitung sebagai 2 benang + jarak antar pasangan.
   * @returns number
   */
  private getThreadPerColor(): number {
    const { type, colorPairDistance } = this.data.colorLayout.colorContent
    return type === 'double' ? 2 + (colorPairDistance ?? 0) : 1
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
   * @param threadPerColor Lebar benang warna.
   * @returns number.
   */
  private calculateUsedThreads(gaps: number[], threadPerColor: number): number {
    return gaps.reduce((acc, g) => acc + g, 0) + gaps.length * threadPerColor
  }

  /**
   * Melakukan iterasi untuk menentukan di seksi mana setiap benang warna harus diletakkan.
   * Jika sisa benang di seksi sekarang tidak cukup untuk jarak 'colorDistance',
   * sisa tersebut akan diteruskan ke seksi berikutnya secara kumulatif.
   * @param results Array hasil untuk menampung gap.
   * @param threadPerColor Lebar benang warna.
   */
  private placeColors(results: number[][], threadPerColor: number): void {
    const { sections } = this.data.fabricContent
    const { colorCount, colorDistance } = this.data.colorLayout.colorContent

    let currentSection = 0
    let colorsPlaced = 0
    let gapToNextColor = this.firstPos()

    while (currentSection < sections && colorsPlaced < colorCount) {
      const sectCones = this.getSectionCones(currentSection)
      const currentSectionGaps = results[currentSection]
      const usedThreads = this.calculateUsedThreads(
        currentSectionGaps,
        threadPerColor,
      )
      const remainingThreads = sectCones - usedThreads

      if (gapToNextColor <= remainingThreads) {
        currentSectionGaps.push(gapToNextColor)
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
   * @param threadPerColor Lebar benang warna.
   */
  private fillGaps(results: number[][], threadPerColor: number): void {
    const { sections } = this.data.fabricContent
    const { OUT } = this.data.colorLayout.colorContent

    for (let s = 0; s < sections; s++) {
      const sectCones = this.getSectionCones(s)
      const usedThreads = this.calculateUsedThreads(results[s], threadPerColor)
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
  private calculateOutGaps(remainingCapacity: number): number[] {
    const { OUT } = this.data.colorLayout.colorContent
    const { fringe } = this.data.fabricContent

    if (!OUT) return [remainingCapacity]

    const totalOutGap = OUT.distance * OUT.count
    // OUT markers diasumsikan single thread (lebar 1)
    const firstValue =
      remainingCapacity - totalOutGap - OUT.count - (fringe || 0)
    const results: number[] = [firstValue]

    for (let i = 0; i < OUT.count; i++) {
      const n =
        i === OUT.count - 1 ? OUT.distance + (fringe || 0) : OUT.distance
      results.push(n)
    }

    return results
  }
}
