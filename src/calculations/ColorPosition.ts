import { type ColorPositionWithRelations } from '@/features/color-positions'

/**
 * Class untuk menghitung posisi benang warna.
 * @returns array
 */
export class ColorPositionCalculator {
  private readonly data: ColorPositionWithRelations
  private result: number[][]

  /**
   * Constructor
   */
  constructor(data: ColorPositionWithRelations) {
    this.data = data

    this.result = Array.from(
      { length: this.data.fabricContent.sections + 1 },
      () => [],
    )
  }

  /**
   * Menghitung posisi paling awal.
   * @return number
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
            (colorDistance * (colorCount - 1) + colorPairDistance)) /
            4,
        )
      }

      return 0
    }

    return i()
  }

  /**
   * Menghitung posisi berikutnya di seksi yang sama.
   * @return number
   */
  private nextPosCurrentSect(current: number[]): number {
    const { cones } = this.data.fabricContent
    const i = current.reduce((acc, val) => acc + val, 0)
    return cones[0] - i - current.length
  }

  /**
   * Menghitung posisi seksi pertama.
   * @return number[]
   */
  private firstSectPos(): number[] {
    const { colorDistance } = this.data.colorLayout.colorContent
    const { cones } = this.data.fabricContent
    const result = []
    result[0] = this.firstPos() > cones[0] ? cones[0] : this.firstPos()

    const len = result.length
    if (result[0] < cones[0]) {
      for (let key = 0; key < len; key++) {
        let i: number | null = this.nextPosCurrentSect(result)

        while (i !== null && i > colorDistance) {
          result.push(colorDistance)
          i = i - colorDistance === 1 ? null : this.nextPosCurrentSect(result)
        }

        if (i !== null) {
          result.push(i)
        }
      }
    }

    return result
  }

  /**
   * Posisi terakhir dari section sebelumnya.
   * @return number
   */
  private lastPosPrevSection(current: number[]): number {
    return current[current.length - 1]
  }

  /**
   * Menghitung posisi pertama di seksi berikutnya.
   * @return number[]
   */
  private firstPosNextSect(current: number[]): number[] {
    const { colorDistance } = this.data.colorLayout.colorContent
    const { cones } = this.data.fabricContent
    const lastPosPrevSection = this.lastPosPrevSection(current)
    const n = () => {
      if (this.result.indexOf(current) === 1) {
        if (lastPosPrevSection >= cones[0]) {
          return this.firstPos() - lastPosPrevSection
        }
      } else if (this.result.indexOf(current) > 1) {
        return colorDistance - lastPosPrevSection
      }

      return colorDistance - lastPosPrevSection
    }
    const result: number[] = []
    result[0] = n() > cones[0] ? cones[0] : n()

    const len = result.length
    if (result[0] < cones[0]) {
      for (let key = 0; key < len; key++) {
        let i: number | null = this.nextPosCurrentSect(result)

        while (i !== null && i > colorDistance) {
          result.push(colorDistance)
          i = i - colorDistance === 1 ? null : this.nextPosCurrentSect(result)
        }

        if (i !== null) {
          result.push(i)
        }
      }
    }

    return result
  }

  /**
   * Menghitung jumlah posisi warna dari section 1 sampai section ke-n.
   * @returns number
   */
  private countColorPositions(upToIndex: number): number {
    let count = 0
    for (let i = 1; i <= upToIndex; i++) {
      count += this.result[i].length - 1
    }

    return count
  }

  /**
   * Menghitung posisi seksi terakhir.
   * @returns number[]
   */
  private lastSectionPos(current: number[]): number[] {
    const { colorCount, OUT } = this.data.colorLayout.colorContent
    const { cones } = this.data.fabricContent
    const { sections } = this.data.fabricContent

    const totalColorPos = this.countColorPositions(sections - 1)

    if (OUT) {
      const totalOutGap = OUT.distance * OUT.count
      const firstValue = cones[0] - totalOutGap - OUT.count
      const result: number[] = [firstValue]
      for (let i = 0; i < OUT.count; i++) {
        result.push(OUT.distance)
      }
      return result
    }

    return this.firstPosNextSect(current)
  }

  /**
   * Nampilin semua nilai untuk posisinya.
   * @returns number[][]
   */
  public calculate(): number[][] {
    const { sections } = this.data.fabricContent
    for (let i = 1; i <= sections; i++) {
      if (i === 1) {
        this.result[i] = this.firstSectPos()
      } else if (i === sections) {
        this.result[i] = this.lastSectionPos(this.result[i - 1])
      } else {
        this.result[i] = this.firstPosNextSect(this.result[i - 1])
      }
    }

    return this.result.slice(1)
  }
}
