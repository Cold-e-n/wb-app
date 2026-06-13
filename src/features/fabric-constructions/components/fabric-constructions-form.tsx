import { useMemo, useState, useEffect } from 'react'
import { useStore } from '@tanstack/react-form'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { useFabricSpecs } from '@/features/fabric-specs/hooks/use-fabric-specs'
import { useFabricConstructionMutation } from '../hooks/use-fabric-constructions'
import { useAppForm } from '../hooks/use-fabric-contructions-form'

import type {
  FabricConstructionForm,
  FabricConstructionFormValues,
} from '@/types/FabricConstruction'
import type { CutmarkItem, FabricSpecWithRelation } from '@/types/FabricSpec'
import { cn, fringeWidth, parseCutmarkTest } from '@/lib/utils'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import { FabricsCombobox } from '@/components/fabrics-combobox'
import { WarpingSection as WarpingSectionForm } from '@/components/form/warping-section'
import { BeamingSection as BeamingSectionForm } from '@/components/form/beaming-section'
import { CutMarkCalculator } from '@/components/cutmark-calculator'

import { CheckCircle2 } from 'lucide-react'

export const FabricConstructionsForm = ({
  mode = 'create',
  initialData,
}: FabricConstructionForm) => {
  const navigate = useNavigate()
  const route = useRouter()

  const { data: fabricSpecs } = useFabricSpecs()
  const { createMutation, updateMutation, isPending } =
    useFabricConstructionMutation()

  const [selectedFabricId, setSelectedFabricId] = useState<string>(
    initialData?.fabricId ?? '',
  )
  const [accordionValue, setAccordionValue] = useState<string>(
    mode === 'edit' ? '' : 'spec-list',
  )

  const specsByFabric = useMemo(() => {
    if (!selectedFabricId || !fabricSpecs) return []

    return fabricSpecs.filter((spec) => spec.fabricId === selectedFabricId)
  }, [selectedFabricId, fabricSpecs])

  const getInitialValues = useMemo((): FabricConstructionFormValues => {
    if (mode === 'edit' && initialData) {
      const { testTying, testStretching } = initialData.cutmarkValue
        ? parseCutmarkTest(initialData.cutmarkValue)
        : { testTying: 10, testStretching: [35] }

      return {
        ...initialData,
        conesCount: Number(initialData.conesCount),
        totalEnds: Number(initialData.totalEnds),
        beamingLoss: Number(initialData.beamingLoss),
        beamWidth: Number(initialData.beamWidth),
        testTying,
        testStretching,
      } as FabricConstructionFormValues
    }

    return {
      fabricSpecId: '',
      constructionId: '',
      rollCount: 1,
      warpingMachine: 'BENN_KM',
      conesCount: 1,
      sectionCount: 1,
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
  }, [mode, initialData])

  const form = useAppForm({
    defaultValues: getInitialValues,
    onSubmit: async ({ value }) => {
      const {
        fabricSpecId,
        rollCount,
        warpingMachine,
        conesCount,
        sectionCount,
        sectionLength,
        beamWidth,
        cutmarkValue,
        spareEnds,
        beamingLoss,
        coneLength,
        constructionId,
      } = value

      const payload = {
        fabricSpecId,
        rollCount,
        warpingMachine,
        conesCount,
        sectionCount,
        sectionLength,
        beamWidth,
        cutmarkValue,
        spareEnds,
        beamingLoss,
        coneLength,
        constructionId,
      }

      if (mode === 'edit' && initialData?.id) {
        await updateMutation.mutateAsync({ id: initialData.id, ...payload })
      } else {
        await createMutation.mutateAsync(payload)
      }

      route.invalidate()
      navigate({
        to: '/fabric-constructions',
      })
    },
  })

  const { rollCount, fabricSpecId, spareEnds, sectionCount } = useStore(
    form.store,
    (state) => state.values,
  )

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
    if (mode !== 'create') return false
    return !selectedFabricId || !fabricSpecId
  }, [mode, selectedFabricId, fabricSpecId])

  const initialRolls = useMemo(() => {
    if (!rollCount) return []

    const spec = selectedSpec
    const cutmarks =
      (spec?.cutmarkPerRoll as unknown as Array<CutmarkItem>) || []

    if (!cutmarks || cutmarks.length === 0) {
      return [
        {
          id: 'fallback-roll',
          roll: rollCount,
          length: 1,
          count: 1,
        },
      ]
    }

    const sortedCutmarks = [...cutmarks].sort((a, b) => b.roll - a.roll)
    let remaining = rollCount
    const chunks = []

    for (const cm of sortedCutmarks) {
      if (remaining >= cm.roll) {
        const count = Math.floor(remaining / cm.roll)
        chunks.push({
          id: `cutmark-${cm.roll}`,
          roll: cm.roll,
          length: cm.length,
          count: count,
        })
        remaining -= count * cm.roll
      }
      if (remaining === 0) break
    }

    if (remaining > 0) {
      chunks.push({
        id: 'cutmark-remainder',
        roll: remaining,
        length: 1,
        count: 1,
      })
    }

    return chunks
  }, [rollCount, selectedSpec])

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
        mode === 'edit' && selectedSpec.id === initialData?.fabricSpecId

      if (!isInitialSpecInEditMode) {
        if (form.getFieldValue('beamWidth') !== targetBeamWidth) {
          form.setFieldValue('beamWidth', targetBeamWidth)
        }
      }
    }
  }, [selectedSpec, form, mode, initialData])

  useEffect(() => {
    if (selectedSpec) {
      const currentSectionCount = Number(sectionCount || 1)
      const calculatedCones =
        (selectedSpec.totalEnds + (spareEnds ?? 0) + fringeVal) /
        currentSectionCount
      const targetConesCount = Number(Math.round(calculatedCones * 100) / 100)

      if (form.getFieldValue('conesCount') !== targetConesCount) {
        form.setFieldValue('conesCount', Number(targetConesCount))
      }

      const totalEnds =
        fringeVal !== 0
          ? selectedSpec.totalEnds + spareEnds + fringeVal
          : selectedSpec.totalEnds + spareEnds
      if (form.getFieldValue('totalEnds') !== totalEnds) {
        form.setFieldValue('totalEnds', totalEnds)
      }
    }
  }, [selectedSpec, spareEnds, sectionCount, form])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Detail Konstruksi</CardTitle>
      </CardHeader>

      <CardContent>
        <form
          id="fabric-constructions-form"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <CutMarkCalculator form={form} initialRolls={initialRolls} />

          {/* ID untuk konstruksi */}
          <form.Field name="constructionId">
            {(field) => <input type="hidden" value={field.state.value} />}
          </form.Field>

          <FieldGroup>
            <div className="flex items-start gap-2">
              {/* Pilih Kain */}
              <form.Field
                name="fabricId"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value || value.trim() === '') {
                      return 'Kain harus dipilih'
                    }
                    return undefined
                  },
                }}
              >
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0

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

              {/* Jumlah Roll */}
              <form.Field
                name="rollCount"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value || value < 1) {
                      return 'Jumlah Roll minimal 1'
                    }
                    return undefined
                  },
                }}
              >
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0

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

            {/* Spek Kain (muncul kalau kain sudah dipilih) */}
            {selectedFabricId ? (
              <form.Field
                name="fabricSpecId"
                validators={{
                  onBlur: ({ value }) =>
                    !value ? 'Spek kain harus dipilih' : undefined,
                }}
              >
                {(field) => {
                  const selectedSpec = specsByFabric.find(
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
                                {selectedSpec
                                  ? 'Spek Kain Terpilih'
                                  : 'Pilih Spek Kain'}
                              </span>
                              {selectedSpec ? (
                                <span className="text-sm text-primary font-jetbrains-mono bg-primary/10 px-2 py-0.5 rounded mt-1">
                                  {selectedSpec.width} mm x{' '}
                                  {selectedSpec.length} m
                                  {selectedSpec.warpYarn?.name
                                    ? ` | Lusi: ${selectedSpec.warpYarn.name} | Pakan: ${selectedSpec.weftYarn?.name}`
                                    : ''}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  Klik untuk melihat
                                </span>
                              )}
                            </div>
                          </AccordionTrigger>

                          <AccordionContent className="px-4 pb-4 pt-1 border-t bg-muted/20">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                              {specsByFabric.map((spec) => {
                                const isSelected = field.state.value === spec.id

                                return (
                                  <Card
                                    key={spec.id}
                                    role="radio"
                                    aria-checked={isSelected}
                                    onClick={() => {
                                      field.handleChange(spec.id)
                                      setTimeout(() => {
                                        setAccordionValue('')
                                      }, 300)
                                    }}
                                    className={cn(
                                      'relative cursor-pointer transition-all duration-200 overflow-hidden active:scale-[0.98]',
                                      isSelected
                                        ? 'border-primary ring-1 ring-primary shadow-sm'
                                        : 'border-border hover:border-primary/50 hover:shadow-sm',
                                      field.state.value && !isSelected
                                        ? 'opacity-50'
                                        : 'opacity-100',
                                    )}
                                  >
                                    {isSelected && (
                                      <div className="absolute top-2.5 right-2.5 text-primary animate-in fade-in zoom-in duration-150">
                                        <CheckCircle2 className="h-6 w-6" />
                                      </div>
                                    )}

                                    <CardHeader className="pr-8">
                                      <CardTitle className="text-primary font-bold">
                                        {spec.width} mm x {spec.length} m
                                      </CardTitle>
                                    </CardHeader>

                                    <CardContent className="grid grid-cols-2 gap-y-2.5 gap-x-2">
                                      <div className="flex flex-col">
                                        <span className="text-muted-foreground text-[13px]">
                                          Lusi
                                        </span>
                                        <span className="truncate">
                                          {spec.warpYarn?.name || '-'}
                                        </span>
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-muted-foreground text-[13px]">
                                          Pakan
                                        </span>
                                        <span className="truncate">
                                          {spec.weftYarn?.name || '-'}
                                        </span>
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-muted-foreground text-[13px]">
                                          Lebar Sisir
                                        </span>
                                        <span>
                                          {spec.reedWidth
                                            ? `${spec.reedWidth}"`
                                            : '-'}
                                        </span>
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-muted-foreground text-[13px]">
                                          Total Helai
                                        </span>
                                        <span>
                                          {`${spec.totalEnds.toLocaleString()} Helai`}
                                        </span>
                                      </div>
                                    </CardContent>
                                  </Card>
                                )
                              })}
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
              {/* Warping Section */}
              <WarpingSectionForm form={form} isFormDisabled={isFormDisabled} />

              {/* Beaming Section */}
              <BeamingSectionForm
                form={form}
                isFormDisabled={isFormDisabled}
                initialRolls={initialRolls}
                selectedSpec={selectedSpec as FabricSpecWithRelation}
              />
            </div>
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter>
        <Button
          type="submit"
          form="fabric-constructions-form"
          disabled={isPending}
        >
          {isPending ? 'Menyimpan...' : mode === 'edit' ? 'Simpan' : 'Buat'}
        </Button>
      </CardFooter>
    </Card>
  )
}
