import { useMemo, useState, useEffect, useRef } from 'react'
import { useStore } from '@tanstack/react-form'
import { useAppForm } from '../../hooks/use-fabric-contructions-form'

import type {
  FabricConstructionFormEntry,
  FabricConstructionFormValues,
} from '@/types/FabricConstruction'
import type { FabricSpecWithRelation } from '@/types/FabricSpec'
import type { CutmarkItem, CutmarkCombination } from '@/types/Cutmark'

import { cn, fringeWidth } from '@/lib/utils'
import { generateCutmarkCombinations, parseCutmarkChunks } from '@/lib/cutmark'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import { FabricsCombobox } from '@/components/fabrics-combobox'
import { WarpingEntryForm } from './entry/warping-entry-form'
import { BeamingEntryForm } from './entry/beaming-entry-form'
import { CutMarkCalculator } from '@/components/cutmark-calculator'

import { CheckCircle2 } from 'lucide-react'

interface FabricConstructionFormEntryProps {
  entry: FabricConstructionFormEntry
  index?: number
  onUpdate: (values: FabricConstructionFormValues) => void
  isEditMode: boolean
  fabricSpecs: Array<FabricSpecWithRelation> | undefined
}

export const FabricConstructionEntryForm = ({
  entry,
  index = 0,
  onUpdate,
  isEditMode,
  fabricSpecs,
}: FabricConstructionFormEntryProps) => {
  const [selectedFabricId, setSelectedFabricId] = useState<string>(
    entry.formValues.fabricId ?? '',
  )
  const [accordionValue, setAccordionValue] = useState<string>('')

  // State untuk Kontrol Manual & Reset Kanban
  const [selectedComboId, setSelectedComboId] = useState<string>('')
  const [isManualCombo, setIsManualCombo] = useState<boolean>(false)
  const [kanbanKey, setKanbanKey] = useState<number>(0)

  const form = useAppForm({
    defaultValues: entry.formValues,
  })

  const formValues = useStore(form.store, (state) => state.values)
  const { rollCount, fabricSpecId, spareEnds, sectionCount } = formValues

  const lastUpdatedValuesRef = useRef(entry.formValues)
  const initialDbCutmarkRef = useRef(entry.formValues.cutmarkValue)
  const prevRollRef = useRef(rollCount)
  const prevSpecRef = useRef(fabricSpecId)
  const autoCalcSectionCountRef = useRef<number | null>(null)
  const isManualSectionCountRef = useRef<boolean>(false)

  // Sinkronisasi dari Form Lokal ke Parent State
  useEffect(() => {
    if (
      JSON.stringify(formValues) !==
      JSON.stringify(lastUpdatedValuesRef.current)
    ) {
      lastUpdatedValuesRef.current = formValues
      onUpdate(formValues)
    }
  }, [formValues, onUpdate])

  // Update internal ref jika prop dari parent berubah
  useEffect(() => {
    lastUpdatedValuesRef.current = entry.formValues
  }, [entry.formValues])

  // Sinkronisasi dari Parent State ke Form Lokal
  useEffect(() => {
    if (entry.formValues.coneLength !== form.getFieldValue('coneLength')) {
      form.setFieldValue('coneLength', entry.formValues.coneLength)
    }
    if (
      entry.formValues.sectionLength !== form.getFieldValue('sectionLength')
    ) {
      form.setFieldValue('sectionLength', entry.formValues.sectionLength)
    }
  }, [entry.formValues.coneLength, entry.formValues.sectionLength, form])

  const specsByFabric = useMemo(() => {
    if (!selectedFabricId || !fabricSpecs) return []
    return fabricSpecs.filter((spec) => spec.fabricId === selectedFabricId)
  }, [selectedFabricId, fabricSpecs])

  const selectedSpec = useMemo(() => {
    if (!fabricSpecId || !specsByFabric) return undefined
    return specsByFabric.find((s) => s.id === fabricSpecId)
  }, [fabricSpecId, specsByFabric])

  const fringeVal = useMemo(() => {
    return selectedSpec?.fringe && selectedSpec.fringe !== 0
      ? selectedSpec.fringe
      : 0
  }, [selectedSpec])

  const isFormDisabled = useMemo(() => {
    if (isEditMode) return false
    return !selectedFabricId || !fabricSpecId
  }, [isEditMode, selectedFabricId, fabricSpecId])

  const combinations = useMemo<CutmarkCombination[]>(() => {
    if (!rollCount || !selectedSpec) return []

    const cutmarks =
      (selectedSpec?.cutmarkPerRoll as unknown as Array<CutmarkItem>) || []
    if (!cutmarks.length) return []
    return generateCutmarkCombinations(rollCount, cutmarks)
  }, [rollCount, selectedSpec])

  // Matcher otomatis untuk Mode Edit (Hanya berjalan sekali saat awal Load)
  useEffect(() => {
    if (
      isEditMode &&
      !isManualCombo &&
      initialDbCutmarkRef.current &&
      combinations.length > 0
    ) {
      const dbChunks = parseCutmarkChunks(initialDbCutmarkRef.current)
      const matched = combinations.find((combo) => {
        if (combo.chunks.length !== dbChunks.length) return false
        const sortedCombo = [...combo.chunks].sort(
          (a, b) => b.length - a.length,
        )
        const sortedDb = [...dbChunks].sort((a, b) => b.length - a.length)
        return sortedCombo.every(
          (c, i) =>
            c.length === sortedDb[i].length && c.count === sortedDb[i].count,
        )
      })
      if (matched) setSelectedComboId(matched.id)
    }
  }, [isEditMode, isManualCombo, combinations])

  // Detektor Pergantian Spek atau Roll Count oleh User
  useEffect(() => {
    if (
      prevRollRef.current !== rollCount ||
      prevSpecRef.current !== selectedSpec?.id
    ) {
      setSelectedComboId(combinations[0]?.id ?? '')
      setKanbanKey((k) => k + 1) // Reset Kanban secara paksa
      isManualSectionCountRef.current = false
      autoCalcSectionCountRef.current = null

      if (isEditMode) {
        setIsManualCombo(true) // Putuskan sambungan dengan teks DB lama
      } else {
        setIsManualCombo(false)
      }
    }
    prevRollRef.current = rollCount
    prevSpecRef.current = selectedSpec?.id ?? ''
  }, [rollCount, selectedSpec?.id, combinations, isEditMode])

  const initialRolls = useMemo(() => {
    // Mode Create ATAU User memilih opsi manual / mengubah jumlah roll
    if (!isEditMode || isManualCombo) {
      if (!rollCount || !selectedSpec) return []
      const cutmarks =
        (selectedSpec?.cutmarkPerRoll as unknown as Array<CutmarkItem>) || []

      if (!cutmarks.length) {
        return [
          {
            id: 'fallback-roll',
            roll: rollCount,
            length: 1,
            count: 1,
            type: 'roll' as const,
          },
        ]
      }

      const selected =
        combinations.find((c) => c.id === selectedComboId) ?? combinations[0]
      if (!selected) return []

      const result = [...selected.chunks]
      if (selected.remainderRolls > 0) {
        result.push({
          id: 'cutmark-remainder',
          roll: selected.remainderRolls,
          length: 1,
          count: 1,
          type: 'roll' as const,
        })
      }
      return result
    }

    // Mode Edit Awal (Menggunakan DB murni)
    if (isEditMode && initialDbCutmarkRef.current) {
      const cutmarks =
        (selectedSpec?.cutmarkPerRoll as unknown as Array<CutmarkItem>) || []
      const chunks = parseCutmarkChunks(initialDbCutmarkRef.current)

      if (!chunks.length) return []

      return chunks.map((chunk, i) => {
        const specItem = cutmarks.find((cm) => cm.length === chunk.length)
        return {
          id: specItem ? `cutmark-${specItem.roll}` : `cutmark-edit-${i}`,
          roll: specItem?.roll ?? 0,
          length: chunk.length,
          count: chunk.count,
          type: 'roll' as const,
        }
      })
    }

    return []
  }, [
    isEditMode,
    isManualCombo,
    rollCount,
    selectedSpec,
    combinations,
    selectedComboId,
  ])

  useEffect(() => {
    if (selectedSpec) {
      const targetBeamWidth =
        fringeVal !== 0
          ? Math.round(
              (selectedSpec.reedWidth +
                0.474 * 2 +
                fringeWidth({
                  fringe: fringeVal,
                  reedNo: selectedSpec.reedNo,
                }) *
                  2) *
                25.4,
            )
          : Math.round(selectedSpec.reedWidth * 25.4)

      const isInitialSpecInEditMode =
        isEditMode && selectedSpec.id === entry.formValues.fabricSpecId

      if (!isInitialSpecInEditMode) {
        if (form.getFieldValue('beamWidth') !== targetBeamWidth) {
          form.setFieldValue('beamWidth', targetBeamWidth)
        }
      }
    }
  }, [selectedSpec, form, isEditMode, entry.formValues.fabricSpecId, fringeVal])

  useEffect(() => {
    if (selectedSpec) {
      const currentSectionCount = Number(sectionCount || 1)
      const calculatedCones =
        (selectedSpec.totalEnds + (spareEnds ?? 0) + fringeVal) /
        currentSectionCount
      const targetconeCount = Number(Math.round(calculatedCones * 100) / 100)

      if (form.getFieldValue('coneCount') !== targetconeCount) {
        form.setFieldValue('coneCount', Number(targetconeCount))
      }

      const totalEnds =
        fringeVal !== 0
          ? selectedSpec.totalEnds + spareEnds + fringeVal
          : selectedSpec.totalEnds + spareEnds
      if (form.getFieldValue('totalEnds') !== totalEnds) {
        form.setFieldValue('totalEnds', totalEnds)
      }
    }
  }, [selectedSpec, spareEnds, sectionCount, form, fringeVal])

  // 1. AUTO-FILL SECTION COUNT UNTUK KAIN TURUNAN (CHILD)
  useEffect(() => {
    // Berlaku hanya jika ini adalah kain ke-2, ke-3 (index > 0) dan sedang di mode Create
    if (index > 0 && !isEditMode) {
      const currentCone = Number(formValues.coneLength) || 0
      const currentSecLen = Number(formValues.sectionLength) || 0

      if (currentCone > 0 && currentSecLen > 0) {
        // Hitung maksimal tarikan (Sisa Benang / Panjang per Tarikan)
        const maxPossibleSections = Math.floor(currentCone / currentSecLen)
        const validCount = maxPossibleSections > 0 ? maxPossibleSections : 1

        // Jika hasilnya berbeda dan operator belum mengubahnya secara manual...
        if (
          validCount !== autoCalcSectionCountRef.current &&
          !isManualSectionCountRef.current
        ) {
          autoCalcSectionCountRef.current = validCount // Simpan di ingatan sistem

          if (formValues.sectionCount !== validCount) {
            form.setFieldValue('sectionCount', validCount) // Set nilai form otomatis!
          }
        }
      }
    }
  }, [
    index,
    isEditMode,
    formValues.coneLength,
    formValues.sectionLength,
    formValues.sectionCount,
    form,
  ])

  // 2. DETEKTOR INTERUPSI (OVERRIDE) MANUAL OLEH OPERATOR
  useEffect(() => {
    if (index > 0 && !isEditMode) {
      if (
        autoCalcSectionCountRef.current !== null &&
        formValues.sectionCount !== autoCalcSectionCountRef.current
      ) {
        // Jika angka di form tiba-tiba berbeda dengan yang dihitung sistem,
        // berarti operator sengaja menghapusnya dan mengetik angka lain. KUNCI!
        isManualSectionCountRef.current = true
      }
    }
  }, [formValues.sectionCount, index, isEditMode])

  return (
    <div className="space-y-4">
      <CutMarkCalculator form={form} initialRolls={initialRolls} />

      {/* ID untuk konstruksi */}
      <form.Field name="constructionId">
        {(field) => <input type="hidden" value={field.state.value} />}
      </form.Field>

      <FieldGroup>
        <div className="flex items-start gap-4">
          <form.Field
            name="fabricId"
            validators={{
              onBlur: ({ value }) => {
                if (!value || value.trim() === '') return 'Kain harus dipilih'
                return undefined
              },
            }}
          >
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && field.state.meta.errors.length > 0

              return (
                <Field data-invalid={isInvalid} className="flex-2">
                  <FieldLabel htmlFor={field.name}>Kain</FieldLabel>
                  <FabricsCombobox
                    fieldName={field.name}
                    value={selectedFabricId}
                    onChange={(id) => {
                      setSelectedFabricId(id)
                      field.handleChange(id)
                    }}
                  />
                  {isInvalid && (
                    <FieldError>
                      {field.state.meta.errors.join(', ')}
                    </FieldError>
                  )}
                </Field>
              )
            }}
          </form.Field>

          <form.Field
            name="rollCount"
            validators={{
              onBlur: ({ value }) => {
                if (!value || value < 1) return 'Jumlah Roll minimal 1'
                return undefined
              },
            }}
          >
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && field.state.meta.errors.length > 0

              return (
                <Field data-invalid={isInvalid} className="flex-1">
                  <FieldLabel htmlFor="rollCount">Jumlah Roll</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    min={1}
                    type="number"
                    disabled={!selectedFabricId}
                    onChange={(e) => {
                      const val = e.target.value
                      field.handleChange(val === '' ? 0 : Number(val))
                    }}
                    className="font-jetbrains-mono"
                  />
                </Field>
              )
            }}
          </form.Field>
        </div>

        {selectedFabricId ? (
          <form.Field
            name="fabricSpecId"
            validators={{
              onBlur: ({ value }) =>
                !value ? 'Spek kain harus dipilih' : undefined,
            }}
          >
            {(field) => {
              const specValue = specsByFabric.find(
                (s) => s.id === field.state.value,
              )

              return (
                <div className="space-y-3">
                  <Accordion
                    type="single"
                    collapsible
                    value={accordionValue}
                    onValueChange={setAccordionValue}
                    className="w-full border rounded-lg bg-background"
                  >
                    <AccordionItem value="spec-list" className="border-b-0">
                      <AccordionTrigger className="px-4 hover:no-underline py-3">
                        <div className="flex flex-col items-start text-left gap-0.5">
                          <span className="font-semibold">
                            {specValue
                              ? 'Spek Kain Terpilih'
                              : 'Pilih Spek Kain'}
                          </span>
                          {specValue ? (
                            <span className="text-sm text-primary font-jetbrains-mono bg-primary/10 px-2 py-0.5 rounded mt-1">
                              {specValue.width} mm x {specValue.length} m
                              {specValue.warpYarn?.name
                                ? ` | Lusi: ${specValue.warpYarn.name} | Pakan: ${specValue.weftYarn?.name}`
                                : ''}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Klik untuk melihat
                            </span>
                          )}
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="px-4 pb-4 pt-3 border-t bg-muted/10">
                        <div className="space-y-3">
                          {/* List Compact dengan Scrollbar */}
                          <div className="max-h-60 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                            {specsByFabric.map((spec) => {
                              const isSelected = field.state.value === spec.id

                              return (
                                <div
                                  key={spec.id}
                                  onClick={() => {
                                    field.handleChange(spec.id)
                                    setTimeout(() => setAccordionValue(''), 250) // Auto close setelah pilih
                                  }}
                                  className={cn(
                                    'group flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all active:scale-[0.99]',
                                    isSelected
                                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                                      : 'bg-background hover:border-primary/50 hover:shadow-sm',
                                  )}
                                >
                                  <div className="flex flex-col gap-1.5">
                                    <span
                                      className={cn(
                                        'font-bold text-sm',
                                        isSelected
                                          ? 'text-primary'
                                          : 'text-foreground group-hover:text-primary',
                                      )}
                                    >
                                      {spec.width} mm x {spec.length} m
                                    </span>

                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <span className="font-medium text-foreground/70">
                                          Lusi:
                                        </span>{' '}
                                        {spec.warpYarn?.name || '-'}
                                      </span>
                                      <span className="w-1 h-1 rounded-full bg-border" />{' '}
                                      {/* Separator dot */}
                                      <span className="flex items-center gap-1">
                                        <span className="font-medium text-foreground/70">
                                          Pakan:
                                        </span>{' '}
                                        {spec.weftYarn?.name || '-'}
                                      </span>
                                      <span className="w-1 h-1 rounded-full bg-border" />{' '}
                                      {/* Separator dot */}
                                      <span className="flex items-center gap-1">
                                        <span className="font-medium text-foreground/70">
                                          Sisir:
                                        </span>{' '}
                                        {spec.reedWidth
                                          ? `${spec.reedWidth}"`
                                          : '-'}
                                      </span>
                                      <span className="w-1 h-1 rounded-full bg-border" />{' '}
                                      {/* Separator dot */}
                                      <span className="flex items-center gap-1">
                                        <span className="font-medium text-foreground/70">
                                          Jumlah Helai Lusi:
                                        </span>{' '}
                                        {spec.totalEnds
                                          ? `${spec.totalEnds.toLocaleString('en-Us')} Helai`
                                          : '-'}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="shrink-0 ml-3">
                                    {isSelected ? (
                                      <CheckCircle2 className="h-5 w-5 text-primary animate-in zoom-in" />
                                    ) : (
                                      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 group-hover:border-primary/50 transition-colors" />
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0 ? (
                    <span className="text-sm text-destructive">
                      {field.state.meta.errors.join(', ')}
                    </span>
                  ) : null}
                </div>
              )
            }}
          </form.Field>
        ) : null}

        <div className="grid lg:grid-cols-2 gap-4">
          <WarpingEntryForm form={form} isFormDisabled={isFormDisabled} />

          <BeamingEntryForm
            form={form}
            isFormDisabled={isFormDisabled}
            initialRolls={initialRolls}
            selectedSpec={selectedSpec as FabricSpecWithRelation}
            combinations={combinations}
            selectedComboId={selectedComboId}
            kanbanKey={kanbanKey} // Mengirim kunci Kanban untuk reset
            onComboSelect={(id) => {
              setSelectedComboId(id)
              setIsManualCombo(true)
              setKanbanKey((k) => k + 1) // Triger reset pada papan
            }}
          />
        </div>
      </FieldGroup>
    </div>
  )
}
