import { type ColorPositionWithRelations } from '@/features/color-positions'

/**
 * Class untuk menghitung posisi benang warna.
 * Porting dari PerhitunganWarna.php
 */
export class NewColorPositionCalculator {
  private result: number[][]

  // Shortcut properties
  private readonly cones: number
  private readonly sections: number
  private readonly distance: number
  private readonly total: number
  private readonly out?: { color: string[]; count: number; distance: number }

  constructor(data: ColorPositionWithRelations) {
    // fabricContent → PosisiWarna (cones, seksi)
    this.cones = data.fabricContent.cones[0]
    this.sections = data.fabricContent.sections

    // colorLayout.colorContent → Kain.colour.type (distance, total, out)
    const cc = data.colorLayout.colorContent
    this.distance = cc.colorDistance
    this.total = cc.colorCount
    this.out = cc.OUT

    this.result = Array.from({ length: this.sections + 1 }, () => [])
  }

  /**
   * Menentukan posisi pertama.
   * PHP: firstPos()
   */
  private firstPos(): number {
    return Math.floor(
      (this.cones * this.sections -
        (this.distance * (this.total - 1) + this.total)) /
        2,
    )
  }

  /**
   * Posisi berikutnya di seksi yang sama.
   * PHP: nextPosCurrentSect()
   */
  private nextPosCurrentSect(current: number[]): number {
    const sum = current.reduce((a, b) => a + b, 0)
    return this.cones - sum - current.length
  }

  /**
   * Posisi seksi pertama.
   * PHP: firstPosFirstSect()
   */
  private firstPosFirstSect(current: number[]): number[] {
    const result = [...current]
    result[0] = this.firstPos()

    for (let key = 0; key < result.length; key++) {
      let i: number | null = this.nextPosCurrentSect(result)

      while (i !== null && i > this.distance) {
        result.push(this.distance)
        i = i - this.distance === 1 ? null : this.nextPosCurrentSect(result)
      }

      if (i !== null) {
        result.push(i)
      }
    }

    return result
  }

  /**
   * Posisi pertama seksi berikutnya.
   * PHP: posNextSect()
   */
  private posNextSect(current: number[]): number[] {
    const result: number[] = []
    result[0] = this.distance - current[current.length - 1]

    for (let key = 0; key < result.length; key++) {
      let i: number | null = this.nextPosCurrentSect(result)

      while (i !== null && i > this.distance) {
        result.push(this.distance)
        i = i - this.distance === 1 ? null : this.nextPosCurrentSect(result)
      }

      if (i !== null) {
        result.push(i)
      }
    }

    return result
  }

  /**
   * Posisi seksi terakhir jika ada benang warna di OUT.
   * PHP: lastSect()
   */
  private lastSect(current: number[]): number[] {
    const result: number[] = []
    result[0] = this.distance - current[current.length - 1]

    if (this.out) {
      const outColors = Array(this.out.count).fill(10) as number[]
      result.push(
        this.nextPosCurrentSect(result) -
          outColors.length -
          outColors.length * 10,
      )

      for (const value of outColors) {
        result.push(value)
      }
    } else {
      result.push(this.nextPosCurrentSect(current))
    }

    return result
  }

  /**
   * Menghitung posisi seluruh seksi.
   * PHP: hitung()
   */
  public calculate(): number[][] {
    for (let key = 1; key <= this.sections; key++) {
      if (key === 1) {
        this.result[key] = this.firstPosFirstSect(this.result[1])
      } else if (this.out && key === this.sections) {
        this.result[key] = this.lastSect(this.result[key - 1])
      } else {
        this.result[key] = this.posNextSect(this.result[key - 1])
      }
    }

    return this.result.slice(1)
  }
}
