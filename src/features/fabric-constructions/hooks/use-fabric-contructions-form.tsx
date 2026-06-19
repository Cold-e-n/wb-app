import { useState, useCallback, useEffect, useMemo } from 'react'
import { createId } from '@paralleldrive/cuid2'
import { createFormHook } from '@tanstack/react-form'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { useFabricConstructionMutation } from './use-fabric-constructions'
import { useConstructionDraft } from '@/hooks/use-construction-draft'
import { parseCutmarkTest } from '@/lib/cutmark'
import type {
  FabricConstruction,
  FabricConstructionFormEntry,
  FabricConstructionFormValues,
} from '@/types/FabricConstruction'

import { fieldContext, formContext } from '@/lib/form-context'

const MIN_SECTION_COUNT = 1
const MIN_REMAINDER_LENGTH = 2000
const DEFAULT_FORM_VALUES: FabricConstructionFormValues = {
  fabricSpecId: '',
  constructionId: '',
  rollCount: 1,
  warpingMachine: 'BENN_KM',
  coneCount: 1,
  sectionCount: MIN_SECTION_COUNT,
  sectionLength: 1,
  beamWidth: 1.0,
  spareEnds: 5,
  totalEnds: 100,
  beamingLoss: 30,
  totalLength: 1,
  coneLength: 1,
  fabricId: '',
  testTying: 10,
  testStretching: [35],
  cutMarkSequence: [],
  cutmarkValue: '',
}

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {},
  formComponents: {},
  fieldContext,
  formContext,
})

/**
 *
 * @param entry
 * @returns
 */
export const calculateRemainder = (
  entry: FabricConstructionFormEntry,
): number => {
  const { formValues } = entry
  const startLength = Number(formValues.coneLength || 0)
  const used = Number(formValues.totalLength || 0)

  return startLength - used
}

/**
 *
 * @param entry
 * @returns
 */
export const canAddChild = (entry: FabricConstructionFormEntry): boolean => {
  if (!entry.formValues.fabricSpecId || !entry.formValues.fabricId) {
    return false
  }

  const remainder = calculateRemainder(entry)
  return (
    remainder > entry.formValues.sectionLength &&
    remainder >= MIN_REMAINDER_LENGTH
  )
}

/**
 *
 * @param parent
 * @returns
 */
export const makeNewEntry = (
  parent: FabricConstructionFormEntry | null,
  initialConeLength: number,
): FabricConstructionFormEntry => {
  const effectiveConeLength = parent
    ? calculateRemainder(parent)
    : initialConeLength

  return {
    constructionId: createId().slice(-7),
    parentConstructionId: parent?.constructionId ?? null,
    effectiveConeLength,
    formValues: {
      ...DEFAULT_FORM_VALUES,
      coneLength: effectiveConeLength,
      sectionLength:
        parent?.formValues.sectionLength ?? DEFAULT_FORM_VALUES.sectionLength,
    },
  }
}

type UseFabricConstructionFormOptions = {
  mode?: 'create' | 'edit'
  initialData?: FabricConstruction
  initialConeLength?: number
}

export const useFabricConstructionForm = ({
  mode = 'create',
  initialData,
  initialConeLength = 1,
}: UseFabricConstructionFormOptions = {}) => {
  const navigate = useNavigate()
  const router = useRouter()
  const { createMutation, updateMutation, createManyMutation, isPending } =
    useFabricConstructionMutation()

  const [entries, setEntries] = useState<Array<FabricConstructionFormEntry>>(
    () => {
      if (mode === 'edit' && initialData) {
        const parsedTests = initialData.cutmarkValue
          ? parseCutmarkTest(initialData.cutmarkValue)
          : {
              testTying: initialData?.warpingMachine === 'BENN_KM' ? 10 : 7,
              testStretching: [35],
            }

        return [
          {
            constructionId: initialData.constructionId,
            parentConstructionId: null,
            effectiveConeLength: initialData.coneLength ?? initialConeLength,
            formValues: {
              ...DEFAULT_FORM_VALUES,
              ...initialData,
              coneCount: Number(initialData.coneCount),
              totalEnds: Number(initialData.totalEnds),
              beamingLoss: Number(initialData.beamingLoss),
              beamWidth: Number(initialData.beamWidth),
              testTying: parsedTests.testTying,
              testStretching: parsedTests.testStretching,
            } as FabricConstructionFormValues,
          },
        ]
      }

      return [makeNewEntry(null, initialConeLength)]
    },
  )

  const [showDraft, setShowDraft] = useState(false)
  const [pendingDraft, setPendingDraft] =
    useState<Array<FabricConstructionFormEntry> | null>(null)

  const { saveDraft, clearDraft } = useConstructionDraft({
    onDraftFound: (draft) => {
      if (mode === 'create') {
        setPendingDraft(draft.entries)
        setShowDraft(true)
      }
    },
  })

  useEffect(() => {
    if (mode !== 'create') return
    if (entries.length > 0) {
      saveDraft(entries)
    }
  }, [entries, mode, saveDraft])

  const restoreDraft = useCallback(() => {
    if (pendingDraft) {
      setEntries(pendingDraft)
    }

    setShowDraft(false)
    setPendingDraft(null)
  }, [pendingDraft])

  const dismissDraft = useCallback(() => {
    clearDraft()
    setShowDraft(false)
    setPendingDraft(null)
  }, [clearDraft])

  const updateEntry = useCallback(
    (index: number, values: Partial<FabricConstructionFormValues>) => {
      setEntries((prev) => {
        const next = [...prev]
        next[index] = {
          ...next[index],
          formValues: { ...next[index].formValues, ...values },
          effectiveConeLength:
            values.coneLength ?? next[index].effectiveConeLength,
        }

        for (let i = index + 1; i < next.length; i++) {
          const parentRemainder = calculateRemainder(next[i - 1])
          next[i] = {
            ...next[i],
            effectiveConeLength: parentRemainder,
            formValues: {
              ...next[i].formValues,
              coneLength: parentRemainder,
            },
          }
        }

        return next
      })
    },
    [],
  )

  const addEntry = useCallback(() => {
    setEntries((prev) => {
      const lastEntry = prev[prev.length - 1]
      if (!canAddChild(lastEntry)) return prev
      return [...prev, makeNewEntry(lastEntry, initialConeLength)]
    })
  }, [initialConeLength])

  const removeEntry = useCallback((index: number) => {
    if (index === 0) return
    setEntries((prev) => prev.slice(0, index))
  }, [])

  const lastEntry = useMemo(() => entries[entries.length - 1], [entries])
  const canAddMore = useMemo(
    () => mode === 'create' && canAddChild(lastEntry),
    [mode, lastEntry],
  )

  const executeUpdate = useCallback(async () => {
    if (!initialData?.id) return
    const entry = entries[0]
    await updateMutation.mutateAsync({
      id: initialData.id,
      ...entry.formValues,
      constructionId: entry.constructionId,
      coneLength: entry.effectiveConeLength,
    })
    clearDraft()
    router.invalidate()
    navigate({ to: '/fabric-constructions' })
  }, [initialData, entries, updateMutation, clearDraft, router, navigate])

  const executeCreate = useCallback(async () => {
    if (entries.length === 1) {
      const entry = entries[0]
      await createMutation.mutateAsync({
        ...entry.formValues,
        constructionId: entry.constructionId,
        parentConstructionId: entry.parentConstructionId,
        coneLength: entry.formValues.coneLength,
      })
    } else {
      await createManyMutation.mutateAsync({
        entries: entries.map((entry) => ({
          ...entry.formValues,
          constructionId: entry.constructionId,
          parentConstructionId: entry.parentConstructionId,
          coneLength: entry.formValues.coneLength,
        })),
      })
    }
    clearDraft()
    router.invalidate()
    navigate({ to: '/fabric-constructions' })
  }, [
    entries,
    createMutation,
    createManyMutation,
    clearDraft,
    router,
    navigate,
  ])

  const handleSubmit = useCallback(async () => {
    if (mode === 'edit') {
      const hasChildrenToConfirm =
        (initialData?.hasChildren ?? false) &&
        (initialData?.effectedChildren?.length ?? 0) > 0

      if (!hasChildrenToConfirm) {
        await executeUpdate()
      }
    } else {
      await executeCreate()
    }
  }, [mode, initialData, executeUpdate, executeCreate])

  const needsConfirmation = useMemo(
    () =>
      mode === 'edit' &&
      (initialData?.hasChildren ?? false) &&
      (initialData?.effectedChildren?.length ?? 0) > 0,
    [mode, initialData],
  )

  return {
    entries,
    updateEntry,
    addEntry,
    removeEntry,
    canAddMore,
    handleSubmit,
    executeUpdate,
    needsConfirmation,
    isPending,
    hasChildren: initialData?.hasChildren ?? false,
    effectedChildren: initialData?.effectedChildren ?? [],
    // Draft
    showDraft,
    restoreDraft,
    dismissDraft,
  }
}
