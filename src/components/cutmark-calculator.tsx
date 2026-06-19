import { useEffect, useMemo } from 'react'
import { useStore } from '@tanstack/react-form'
import { withForm } from '@/features/fabric-constructions/hooks/use-fabric-contructions-form'
import { calculateMaxBeamingLoss, calculateTotalLength } from '@/lib/cutmark'
import type { FabricConstructionFormValues } from '@/types/FabricConstruction'
import { type CutmarkChunk } from '@/types/Cutmark'

const DEFAULT_TEST_TYING = 10
const DEFAULT_TEST_STRETCHING = [35]
const MIN_SECTION_COUNT = 1

const areRollsChanged = (
  current: Array<CutmarkChunk>,
  initial: Array<CutmarkChunk>,
): boolean => {
  const sort = (chunks: Array<CutmarkChunk>) =>
    [...chunks].sort((a, b) => a.id.localeCompare(b.id))

  const currentRolls = sort(current.filter((item) => item.type === 'roll'))
  const initialRolls = sort(initial)

  if (currentRolls.length !== initialRolls.length) return true

  return currentRolls.some(
    (item, i) =>
      item.id !== initialRolls[i]?.id ||
      item.roll !== initialRolls[i]?.roll ||
      item.count !== initialRolls[i]?.count ||
      item.length !== initialRolls[i]?.length,
  )
}

const createDefaultSequence = (
  initialRolls: Array<CutmarkChunk>,
  testTying = DEFAULT_TEST_TYING,
  testStretching = DEFAULT_TEST_STRETCHING,
): Array<CutmarkChunk> => [
  {
    id: 'test-tying',
    roll: 0,
    type: 'test-tying',
    length: testTying,
    count: 1,
  },
  ...initialRolls.map((r) => ({ ...r, type: 'roll' as const })),
  ...testStretching.map((length, i) => ({
    id: `test-stretching-${i}`,
    roll: 0,
    type: 'test-stretching' as const,
    length,
    count: 1,
  })),
]

const calculateSectionCount = (
  coneLength: number,
  sectionLength: number,
): number => {
  if (coneLength <= 0 || sectionLength <= 0) return MIN_SECTION_COUNT
  return Math.max(MIN_SECTION_COUNT, Math.floor(coneLength / sectionLength))
}

const generateFormula = (sequence: Array<CutmarkChunk>): string =>
  sequence
    .map((item) => {
      if (item.type === 'test-tying' || item.type === 'test-stretching') {
        return `${item.length}m`
      }
      return `( ${Number(item.length).toLocaleString('en-US')}m x ${item.count || 1} )`
    })
    .join(' + ')

export const CutMarkCalculator = withForm({
  defaultValues: {} as FabricConstructionFormValues,
  props: {} as { initialRolls: Array<CutmarkChunk> },

  render: function CutMarkCalculator({ form, initialRolls }) {
    const {
      testTying,
      testStretching,
      cutMarkSequence,
      coneLength,
      beamingLoss,
      warpingMachine,
      sectionCount,
    } = useStore(form.store, (state) => state.values)

    const normalizedTestTying = testTying ?? DEFAULT_TEST_TYING
    const currentSequence = (cutMarkSequence as CutmarkChunk[]) ?? []

    const normalizedTestStretching = useMemo(() => {
      if (Array.isArray(testStretching)) return testStretching
      if (typeof testStretching === 'number') return [testStretching]
      return DEFAULT_TEST_STRETCHING
    }, [testStretching])

    const { activeSequence, rollsChanged, calculations } = useMemo(() => {
      const rollsChanged = areRollsChanged(currentSequence, initialRolls)
      const shouldUseDefault = currentSequence.length === 0 || rollsChanged

      const sequence = shouldUseDefault
        ? createDefaultSequence(
            initialRolls,
            normalizedTestTying,
            normalizedTestStretching,
          )
        : currentSequence

      const rawLength = calculateTotalLength(sequence)

      // beamingLoss maksimum yang masih membuat totalLength ≤ coneLength,
      // dihitung pakai sectionCount yang berlaku (bukan beamingLoss yang sedang diketik)
      const referenceSectionCount =
        sectionCount && sectionCount > 0 ? sectionCount : MIN_SECTION_COUNT
      const maxBeamingLoss =
        warpingMachine === 'BENN_KM'
          ? 0
          : calculateMaxBeamingLoss(
              coneLength ?? 0,
              rawLength,
              referenceSectionCount,
            )

      // Clamp beamingLoss supaya tidak melebihi batas
      const clampedBeamingLoss =
        warpingMachine === 'BENN_KM'
          ? 0
          : Math.max(30, Math.min(beamingLoss ?? 30, maxBeamingLoss))

      const sectionLength =
        warpingMachine === 'BENN_KM'
          ? rawLength
          : rawLength + clampedBeamingLoss

      const maxSupportedSectionCount = calculateSectionCount(
        coneLength ?? 0,
        sectionLength,
      )
      const finalSectionCount =
        sectionCount && sectionCount > 0
          ? Math.min(sectionCount, maxSupportedSectionCount)
          : maxSupportedSectionCount

      const totalLength =
        warpingMachine === 'BENN_KM'
          ? sectionLength * finalSectionCount
          : (sectionLength + 8) * finalSectionCount

      const formula = generateFormula(sequence)

      return {
        activeSequence: sequence,
        rollsChanged,
        calculations: {
          sectionLength,
          sectionCount: finalSectionCount,
          totalLength,
          formula,
          maxBeamingLoss,
          clampedBeamingLoss,
        },
      }
    }, [
      currentSequence,
      initialRolls,
      normalizedTestTying,
      normalizedTestStretching,
      coneLength,
      beamingLoss,
      warpingMachine,
      sectionCount,
    ])

    useEffect(() => {
      const updates: Array<[keyof FabricConstructionFormValues, unknown]> = []

      if (rollsChanged || currentSequence.length === 0) {
        updates.push(['cutMarkSequence', activeSequence])
      }
      if (form.getFieldValue('cutmarkValue') !== calculations.formula) {
        updates.push(['cutmarkValue', calculations.formula])
      }
      if (form.getFieldValue('sectionLength') !== calculations.sectionLength) {
        updates.push(['sectionLength', calculations.sectionLength])
      }
      if (form.getFieldValue('sectionCount') !== calculations.sectionCount) {
        updates.push(['sectionCount', calculations.sectionCount])
      }
      if (form.getFieldValue('totalLength') !== calculations.totalLength) {
        updates.push(['totalLength', calculations.totalLength])
      }
      // Clamp beamingLoss kalau nilainya melebihi batas maksimum
      if (
        form.getFieldValue('beamingLoss') !==
        (Number(calculations.clampedBeamingLoss) || 0)
      ) {
        updates.push([
          'beamingLoss',
          Number(calculations.clampedBeamingLoss) || 0,
        ])
      }

      if (updates.length > 0) {
        queueMicrotask(() => {
          updates.forEach(([field, value]) => {
            form.setFieldValue(field, value as never)
          })
        })
      }
    }, [
      activeSequence,
      calculations,
      rollsChanged,
      currentSequence.length,
      form,
    ])

    return null
  },
})
