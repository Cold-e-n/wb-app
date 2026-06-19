import { useCallback, useMemo } from 'react'
import { useStore } from '@tanstack/react-form'
import { withForm } from '@/features/fabric-constructions/hooks/use-fabric-contructions-form'
import type { FabricConstructionFormValues } from '@/types/FabricConstruction'
import type { FabricSpecWithRelation } from '@/types/FabricSpec'
import type { CutmarkChunk, CutmarkCombination } from '@/types/Cutmark'
import { cn } from '@/lib/utils'

import {
  Field,
  FieldContent,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Button } from '@/components/ui/button'
import { CutMarkKanban } from '@/components/cutmark-kanban'
import { Plus, X } from 'lucide-react'

export const BeamingEntryForm = withForm({
  defaultValues: {} as FabricConstructionFormValues,
  props: {} as {
    isFormDisabled: boolean
    initialRolls: Array<CutmarkChunk>
    selectedSpec?: FabricSpecWithRelation
    combinations: CutmarkCombination[]
    selectedComboId: string
    onComboSelect: (id: string) => void
    kanbanKey?: number
  },

  render: ({
    form,
    isFormDisabled,
    initialRolls,
    selectedSpec,
    combinations,
    selectedComboId,
    onComboSelect,
    kanbanKey,
  }) => {
    const { testTying, testStretching, spareEnds } = useStore(
      form.store,
      (state) => state.values,
    )

    const stretchingItems = useMemo(() => {
      if (Array.isArray(testStretching)) return testStretching
      if (typeof testStretching === 'number') return [testStretching]
      return [35]
    }, [testStretching])

    const handleKanbanChange = useCallback(
      (val: { sequence: Array<CutmarkChunk>; formula: string }) => {
        form.setFieldValue('cutMarkSequence', val.sequence as CutmarkChunk[])
        form.setFieldValue('cutmarkValue', val.formula)
      },
      [form],
    )

    const addStretchingItem = useCallback(() => {
      form.setFieldValue('testStretching', [...stretchingItems, 35])
    }, [form, stretchingItems])

    const removeStretchingItem = useCallback(
      (index: number) => {
        const updated = stretchingItems.filter((_, i) => i !== index)
        // Minimal selalu ada 1 item
        form.setFieldValue(
          'testStretching',
          updated.length > 0 ? updated : [35],
        )
      },
      [form, stretchingItems],
    )

    const updateStretchingItem = useCallback(
      (index: number, value: number) => {
        const updated = [...stretchingItems]
        updated[index] = value
        form.setFieldValue('testStretching', updated)
      },
      [form, stretchingItems],
    )

    return (
      <FieldSet
        disabled={isFormDisabled}
        className="border border-border rounded-xl p-5 pt-0 bg-card/50 shadow-sm"
      >
        <FieldLegend className="px-5">Beaming</FieldLegend>

        {/* Cutmark display */}
        <form.Field name="cutmarkValue">
          {(field) => (
            // PERBAIKAN 1 (Border Fatigue):
            // Ganti border dan shadow berlapis dengan background tipis (bg-muted/30)
            <div className="rounded-lg bg-muted/30 space-y-2">
              <div className="text-xs font-bold text-muted-foreground tracking-wider mb-2">
                Cutmark
              </div>
              {/* PERBAIKAN 2 (Text Breaking):
                  Ganti break-all dengan overflow-x-auto dan whitespace-nowrap
                  agar angka tetap utuh dan bisa digeser jika terlalu panjang */}
              <div className="p-3 bg-background rounded-lg min-h-12 flex items-center overflow-x-auto custom-scrollbar">
                <span className="font-mono text-base font-semibold text-primary whitespace-nowrap tracking-wide">
                  {field.state.value || '-'}
                </span>
              </div>
            </div>
          )}
        </form.Field>

        {/* Row 1: Kanban + Kombinasi Cutmark */}
        <div className="rounded-xl bg-muted/20 w-full overflow-hidden">
          {/* Menggunakan xl:grid-cols-12 dengan distribusi 8:4 agar Kanban luas & List tetap fit */}
          <div className="grid grid-cols-1 xl:grid-cols-12 items-start w-full">
            {/* Kiri: Kanban Board (8 Kolom) */}
            <div className="xl:col-span-7 w-full overflow-x-auto">
              <CutMarkKanban
                key={`kanban-board-${kanbanKey}`}
                initialRolls={initialRolls}
                testTying={testTying ?? 10}
                testStretching={stretchingItems}
                onChange={handleKanbanChange}
              />
            </div>

            {/* Kanan: List Kombinasi Cutmark (4 Kolom) */}
            <div className="xl:col-span-5 w-full min-w-0 flex flex-col">
              {combinations.length > 1 && (
                <div className="rounded-lg border border-border/40 bg-background flex flex-col shadow-sm w-full min-w-0 overflow-hidden">
                  {/* Header List */}
                  <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/50 bg-muted/30">
                    <div className="text-xs font-bold text-muted-foreground tracking-wider">
                      Opsi Cutmark
                    </div>
                    <div className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border/40">
                      {combinations.length} Opsi
                    </div>
                  </div>

                  {/* Scrollable List Container */}
                  <div className="divide-y divide-border/50 overflow-y-auto max-h-75 w-full min-w-0">
                    {combinations.map((combo) => {
                      const isSelected = combo.id === selectedComboId

                      return (
                        <button
                          key={combo.id}
                          type="button"
                          onClick={() => onComboSelect(combo.id)}
                          className={cn(
                            'w-full text-left px-3 py-2.5 transition-all flex items-start gap-2 relative group min-w-0',
                            isSelected
                              ? 'bg-primary/5 text-foreground font-medium'
                              : 'hover:bg-muted/30 text-muted-foreground hover:text-foreground',
                          )}
                        >
                          {/* Indicator garis vertikal kiri */}
                          {isSelected && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r" />
                          )}

                          {/* Radio indicator circle */}
                          <span
                            className={cn(
                              'mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border transition-colors',
                              isSelected
                                ? 'border-primary bg-primary'
                                : 'border-muted-foreground/30 group-hover:border-primary/40',
                            )}
                          >
                            {isSelected && (
                              <span className="h-1 w-1 rounded-full bg-primary-foreground" />
                            )}
                          </span>

                          {/* Text Container */}
                          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                            <span
                              className={cn(
                                'font-mono text-xs leading-tight break-all',
                                isSelected
                                  ? 'text-primary font-semibold'
                                  : 'text-foreground/90',
                              )}
                            >
                              {combo.label}
                            </span>

                            <div className="text-[10px] text-muted-foreground flex flex-col gap-0.5 mt-0.5">
                              <span>
                                Total:{' '}
                                {combo.totalLength.toLocaleString('id-ID')}m
                              </span>

                              {combo.remainderRolls > 0 && (
                                <span className="w-fit text-[9px] font-medium text-amber-700 bg-amber-500/10 px-1 py-0.5 rounded border border-amber-500/20 mt-0.5">
                                  +{combo.remainderRolls}R tidak ter-cover
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Test inputs */}
        <div className="space-y-4 bg-muted/20 p-4 border border-border rounded-xl">
          <div className="text-xs font-bold text-muted-foreground tracking-wider border-b pb-2 mb-2">
            Test
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Test Tying — single value */}
            <form.Field name="testTying">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name} className="text-xs">
                    Test Tying
                  </FieldLabel>
                  <FieldContent>
                    <InputGroup>
                      <InputGroupInput
                        id={field.name}
                        type="number"
                        min="1"
                        max="10000"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          const val = e.target.value
                          field.handleChange(val === '' ? 0 : Number(val))
                        }}
                        placeholder="Masukkan panjang test"
                        className="font-jetbrains-mono h-9 text-sm"
                      />
                      <InputGroupAddon align="inline-end">
                        <span className="text-sm">meter</span>
                      </InputGroupAddon>
                    </InputGroup>
                  </FieldContent>
                </Field>
              )}
            </form.Field>

            {/* Test Stretching — array, bisa tambah/hapus */}
            <div className="space-y-2">
              <FieldLabel className="text-xs">Test Stretching</FieldLabel>

              {stretchingItems.map((val, index) => (
                <div key={index} className="flex gap-1.5 items-center">
                  <InputGroup className="flex-1">
                    <InputGroupInput
                      type="number"
                      min="1"
                      max="10000"
                      value={val}
                      onChange={(e) => {
                        const raw = e.target.value
                        updateStretchingItem(
                          index,
                          raw === '' ? 0 : Number(raw),
                        )
                      }}
                      placeholder="Panjang test"
                      className="font-jetbrains-mono h-9 text-sm"
                    />
                    <InputGroupAddon align="inline-end">
                      <span className="text-sm">meter</span>
                    </InputGroupAddon>
                  </InputGroup>

                  {stretchingItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeStretchingItem(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full mt-1"
                onClick={addStretchingItem}
              >
                <Plus className="h-4 w-4" />
                Tambah item test
              </Button>
            </div>
          </div>
        </div>

        <FieldSeparator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {/* Lebar Beam */}
          <form.Field name="beamWidth">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Lebar Beam</FieldLabel>
                <FieldContent>
                  <InputGroup>
                    <InputGroupInput
                      id={field.name}
                      type="number"
                      min="1"
                      max="10000"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        const val = e.target.value
                        field.handleChange(val === '' ? 0 : Number(val))
                      }}
                      placeholder="Masukkan lebar beam"
                      className="font-jetbrains-mono text-sm"
                    />
                    <InputGroupAddon align="inline-end">
                      <span className="text-sm">mm</span>
                    </InputGroupAddon>
                  </InputGroup>
                </FieldContent>
              </Field>
            )}
          </form.Field>

          {/* Jumlah Helai Lusi */}
          <form.Field name="totalEnds">
            {(field) => (
              <Field>
                <FieldLabel>Jumlah Helai Lusi</FieldLabel>
                <FieldContent>
                  {/* Container diubah menyerupai input agar tinggi dan bentuknya sejajar dengan Lebar Beam */}
                  <div className="flex min-h-9 w-full items-center rounded-md border border-border/50 bg-muted/20 px-3 py-1 shadow-sm">
                    <span className="font-jetbrains-mono text-sm text-primary">
                      {selectedSpec ? (
                        <span>
                          {selectedSpec.totalEnds.toLocaleString('en-US')}
                          {spareEnds === 0 ? '' : ` + ${spareEnds}`}
                          {selectedSpec.fringe !== 0
                            ? ` + ${selectedSpec.fringe}`
                            : ''}
                          {' = '}
                          <span className="font-semibold">
                            {field.state.value?.toLocaleString('en-US') || '-'}{' '}
                            Helai
                          </span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </span>
                  </div>
                </FieldContent>
              </Field>
            )}
          </form.Field>
        </div>
      </FieldSet>
    )
  },
})
