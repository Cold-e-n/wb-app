import { useEffect, useRef } from 'react'
import type { FabricConstructionFormEntry } from '@/types/FabricConstruction'

type ConstructionDraft = {
  entries: FabricConstructionFormEntry[]
  savedAt: string
}

const DRAFT_KEY = 'fabric-construction-draft'

const draftStorage = {
  save: (entries: FabricConstructionFormEntry[]): void => {
    try {
      const draft: ConstructionDraft = {
        entries,
        savedAt: new Date().toISOString(),
      }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    } catch (error) {
      console.warn('Gagal menyimpan draft.')
    }
  },

  load: (): ConstructionDraft | null => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY)
      return draft ? JSON.parse(draft) : null
    } catch (error) {
      console.warn('Gagal memuat draft.')
      return null
    }
  },

  clear: (): void => {
    localStorage.removeItem(DRAFT_KEY)
  },
}

type UseConstructionDraftOptions = {
  onDraftFound?: (draft: ConstructionDraft) => void
}

export const useConstructionDraft = (options?: UseConstructionDraftOptions) => {
  const { onDraftFound } = options ?? {}
  const hasCheked = useRef(false)

  useEffect(() => {
    if (hasCheked.current) return
    hasCheked.current = true

    const draft = draftStorage.load()
    if (draft && draft.entries.length > 0) onDraftFound?.(draft)
  }, [onDraftFound])

  return {
    saveDraft: draftStorage.save,
    clearDraft: draftStorage.clear,
    loadDraft: draftStorage.load,
  }
}
