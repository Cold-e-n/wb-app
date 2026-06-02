import { useMemo, useState, useCallback, useEffect } from 'react'
import { useForm, useStore } from '@tanstack/react-form'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { useFabricSpecs } from '@/features/fabric-specs/hooks/use-fabric-specs'
import { useFabricConstructionMutation } from '../hooks/use-fabric-constructions'

import type {
  FabricConstructionForm,
  FabricConstructionFormValues,
} from '@/types/FabricConstruction'
import type { CutmarkItem } from '@/types/FabricSpec'
import { cn } from '@/lib/utils'

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
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldSeparator,
} from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { FabricsCombobox } from '@/components/fabrics-combobox'
import { CutMarkCalculator } from '@/components/cutmark-calculator'
import { CutMarkKanban, CutMarkChunk } from '@/components/cutmark-kanban'

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

  const parseCutmark = (
    value: string,
  ): {
    testTying: number
    testStretching: number
  } => {
    const parts = value
      .split('+')
      .map((s) => s.trim())
      .filter(Boolean)

    const parseMeters = (s: string) => {
      const match = s.match(/^(\d+(?:\.\d+)?)m$/)
      return match ? Number(match[1]) : 0
    }

    const first = parts.at(0) ?? ''
    const last = parts.at(-1) ?? ''

    return {
      testTying: parts.length >= 1 ? parseMeters(first) : 10,
      testStretching: parts.length >= 2 ? parseMeters(last) : 35,
    }
  }

  const getInitialValues = useMemo((): FabricConstructionFormValues => {
    if (mode === 'edit' && initialData) {
      const { testTying, testStretching } = initialData.cutmarkValue
        ? parseCutmark(initialData.cutmarkValue)
        : { testTying: 10, testStretching: 35 }

      return {
        ...initialData,
        conesCount: Number(initialData.conesCount),
        totalEnds: Number(initialData.totalEnds),
        beamingLoss: Number(initialData.beamingLoss),
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
      testStretching: 35,
      cutMarkSequence: [],
      cutmarkValue: '',
    }
  }, [mode, initialData])

  const form = useForm({
    defaultValues: getInitialValues,
    onSubmit: async ({ value }) => {
      const payload = {
        fabricSpecId: value.fabricSpecId,
        rollCount: value.rollCount,
        warpingMachine: value.warpingMachine,
        conesCount: value.conesCount,
        sectionCount: value.sectionCount,
        sectionLength: value.sectionLength,
        beamWidth: value.beamWidth,
        cutmarkValue: value.cutmarkValue,
        spareEnds: value.spareEnds,
        beamingLoss: value.beamingLoss,
        coneLength: value.coneLength,
        constructionId: value.constructionId,
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

  const rollCount = useStore(form.store, (state) => state.values.rollCount)
  const warpingMachine = useStore(
    form.store,
    (state) => state.values.warpingMachine,
  )
  const sectionLength = useStore(
    form.store,
    (state) => state.values.sectionLength,
  )
  const testTying = useStore(form.store, (state) => state.values.testTying)
  const testStretching = useStore(
    form.store,
    (state) => state.values.testStretching,
  )

  const fabricSpecId = useStore(
    form.store,
    (state) => state.values.fabricSpecId,
  )
  const spareEnds = useStore(form.store, (state) => state.values.spareEnds)
  const sectionCount = useStore(
    form.store,
    (state) => state.values.sectionCount,
  )

  const isFormDisabled = useMemo(() => {
    if (mode !== 'create') return false
    return !selectedFabricId || !fabricSpecId
  }, [mode, selectedFabricId, fabricSpecId])

  const initialRolls = useMemo(() => {
    if (!rollCount) return []

    const spec = specsByFabric.find((s) => s.id === fabricSpecId)
    const cutmarks =
      (spec?.cutmarkPerRoll as unknown as Array<CutmarkItem>) || []

    if (!cutmarks || cutmarks.length === 0) {
      return [
        {
          id: 'fallback-roll',
          roll: rollCount,
          length: sectionLength || 1,
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
  }, [rollCount, fabricSpecId, specsByFabric])

  const handleKanbanChange = useCallback(
    (val: { sequence: Array<CutMarkChunk>; formula: string }) => {
      form.setFieldValue('cutMarkSequence', val.sequence)

      if (val.formula) {
        form.setFieldValue('cutmarkValue', val.formula)
      }
    },
    [form],
  )

  const selectedSpec = useMemo(() => {
    if (!fabricSpecId || !specsByFabric) return undefined
    return specsByFabric.find((s) => s.id === fabricSpecId)
  }, [fabricSpecId, specsByFabric])

  useEffect(() => {
    if (selectedSpec) {
      const fringeVal =
        selectedSpec.fringe && selectedSpec.fringe !== 0
          ? selectedSpec.fringe
          : 0
      const currentSectionCount = Number(sectionCount || 1)
      const calculatedCones =
        (selectedSpec.totalEnds + (spareEnds ?? 0) + fringeVal) /
        currentSectionCount
      const targetConesCount = Number(Math.round(calculatedCones * 100) / 100)

      if (form.getFieldValue('conesCount') !== targetConesCount) {
        form.setFieldValue('conesCount', Number(targetConesCount))
      }

      const targetBeamWidth =
        selectedSpec.fringe !== 0
          ? Math.floor((selectedSpec.reedWidth + 0.474 + 0.474) * 25.4)
          : Math.floor(selectedSpec.reedWidth * 25.4)
      if (form.getFieldValue('beamWidth') !== targetBeamWidth) {
        form.setFieldValue('beamWidth', targetBeamWidth)
      }

      const totalEnds =
        selectedSpec.fringe !== 0
          ? selectedSpec.totalEnds + spareEnds + (selectedSpec.fringe ?? 1)
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
                                          {`${spec.totalEnds.toLocaleString()} Helai` ||
                                            '-'}
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

                      {/* Pesan Error Validasi */}
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
              <FieldSet
                disabled={isFormDisabled}
                className="border border-border rounded-xl p-5 pt-0 bg-card/50 shadow-sm"
              >
                <FieldLegend className="px-5">Warping</FieldLegend>

                <FieldGroup>
                  {/* Mesin Warping Tabs */}
                  <form.Field name="warpingMachine">
                    {(field) => (
                      <Field>
                        <Tabs
                          value={field.state.value}
                          onValueChange={(value) => {
                            field.handleChange(value)

                            const testTying = value === 'BENN_KM' ? 10 : 7
                            const testStretching = 35

                            form.setFieldValue('testTying', testTying)
                            form.setFieldValue('testStretching', testStretching)
                          }}
                        >
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="BENN_KM">
                              BENNINGER / KARL MAYER
                            </TabsTrigger>
                            <TabsTrigger value="MO_TS">
                              MO / TSUDAKOMA
                            </TabsTrigger>
                          </TabsList>

                          <div className="grid grid-cols-2 gap-4">
                            {/* Jumlah cones */}
                            <form.Field
                              name="conesCount"
                              validators={{
                                onBlur: ({ value }) => {
                                  if (!value || value <= 0) {
                                    return 'Jumlah cones harus lebih dari 0'
                                  }
                                  return undefined
                                },
                              }}
                            >
                              {(subField) => {
                                const isInvalid =
                                  subField.state.meta.isTouched &&
                                  subField.state.meta.errors &&
                                  subField.state.meta.errors.length > 0

                                return (
                                  <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={subField.name}>
                                      Jumlah Cones
                                    </FieldLabel>
                                    <FieldContent>
                                      <InputGroup>
                                        <InputGroupInput
                                          id={subField.name}
                                          type="number"
                                          min="0"
                                          step="0.01"
                                          value={subField.state.value}
                                          onBlur={subField.handleBlur}
                                          onChange={(e) => {
                                            const val = e.target.value
                                            subField.handleChange(
                                              val === '' ? 0 : Number(val),
                                            )
                                          }}
                                          placeholder="Masukkan jumlah cones"
                                          className="font-jetbrains-mono"
                                          readOnly
                                        />
                                        <InputGroupAddon align="inline-end">
                                          <span className="text-sm">cones</span>
                                        </InputGroupAddon>
                                      </InputGroup>
                                      {isInvalid && (
                                        <FieldError>
                                          {subField.state.meta.errors.join(
                                            ', ',
                                          )}
                                        </FieldError>
                                      )}
                                    </FieldContent>
                                  </Field>
                                )
                              }}
                            </form.Field>

                            {/* Jumlah Section / Beam */}
                            <form.Field
                              name="sectionCount"
                              validators={{
                                onBlur: ({ value }) => {
                                  if (!value || value <= 0) {
                                    return 'Jumlah section / beam harus lebih dari 0'
                                  }
                                  return undefined
                                },
                              }}
                            >
                              {(subField) => {
                                const isInvalid =
                                  subField.state.meta.isTouched &&
                                  subField.state.meta.errors &&
                                  subField.state.meta.errors.length > 0

                                return (
                                  <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={subField.name}>
                                      Jumlah{' '}
                                      {warpingMachine === 'BENN_KM'
                                        ? 'Section'
                                        : 'Beam'}
                                    </FieldLabel>
                                    <FieldContent>
                                      <InputGroup>
                                        <InputGroupInput
                                          id={subField.name}
                                          type="number"
                                          min="1"
                                          max="10000"
                                          value={subField.state.value}
                                          onBlur={subField.handleBlur}
                                          onChange={(e) => {
                                            const val = e.target.value
                                            subField.handleChange(
                                              val === '' ? 0 : Number(val),
                                            )
                                          }}
                                          placeholder="Masukkan jumlah section / beam"
                                          className="font-jetbrains-mono"
                                          readOnly
                                        />
                                        <InputGroupAddon align="inline-end">
                                          <span className="text-sm">
                                            {warpingMachine === 'BENN_KM'
                                              ? 'section'
                                              : 'beam'}
                                          </span>
                                        </InputGroupAddon>
                                      </InputGroup>
                                      {isInvalid && (
                                        <FieldError>
                                          {field.state.meta.errors.join(', ')}
                                        </FieldError>
                                      )}
                                    </FieldContent>
                                  </Field>
                                )
                              }}
                            </form.Field>

                            {/* Panjang Benang */}
                            <form.Field
                              name="sectionLength"
                              validators={{
                                onBlur: ({ value }) => {
                                  if (!value || value <= 0) {
                                    return 'Panjang benang harus lebih dari 0'
                                  }
                                  return undefined
                                },
                              }}
                            >
                              {(subField) => {
                                const isInvalid =
                                  subField.state.meta.isTouched &&
                                  subField.state.meta.errors &&
                                  subField.state.meta.errors.length > 0

                                return (
                                  <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={subField.name}>
                                      Panjang Benang
                                    </FieldLabel>
                                    <FieldContent>
                                      <InputGroup>
                                        <InputGroupInput
                                          id={subField.name}
                                          type="number"
                                          min="1"
                                          max="10000"
                                          value={subField.state.value}
                                          onBlur={subField.handleBlur}
                                          onChange={(e) => {
                                            const val = e.target.value
                                            subField.handleChange(
                                              val === '' ? 0 : Number(val),
                                            )
                                          }}
                                          placeholder="Masukkan panjang benang"
                                          className="font-jetbrains-mono"
                                          readOnly
                                        />
                                        <InputGroupAddon align="inline-end">
                                          <span className="text-sm">meter</span>
                                        </InputGroupAddon>
                                      </InputGroup>
                                      {isInvalid && (
                                        <FieldError>
                                          {field.state.meta.errors.join(', ')}
                                        </FieldError>
                                      )}
                                    </FieldContent>
                                  </Field>
                                )
                              }}
                            </form.Field>

                            <form.Field
                              name="spareEnds"
                              validators={{
                                onBlur: ({ value }) => {
                                  if (!value || value <= 0) {
                                    return 'Spare harus lebih dari 0'
                                  }
                                  return undefined
                                },
                              }}
                            >
                              {(subField) => {
                                const isInvalid =
                                  subField.state.meta.isTouched &&
                                  subField.state.meta.errors &&
                                  subField.state.meta.errors.length > 0

                                return (
                                  <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={subField.name}>
                                      Spare
                                    </FieldLabel>
                                    <FieldContent>
                                      <InputGroup>
                                        <InputGroupInput
                                          id={subField.name}
                                          type="number"
                                          min="1"
                                          max="10000"
                                          value={subField.state.value}
                                          onBlur={subField.handleBlur}
                                          onChange={(e) => {
                                            const val = e.target.value
                                            subField.handleChange(
                                              val === '' ? 1 : Number(val),
                                            )
                                          }}
                                          placeholder="Masukkan jumlah spare"
                                          className="font-jetbrains-mono"
                                        />
                                        <InputGroupAddon align="inline-end">
                                          <span className="text-sm">Helai</span>
                                        </InputGroupAddon>
                                      </InputGroup>
                                      {isInvalid && (
                                        <FieldError>
                                          {field.state.meta.errors.join(', ')}
                                        </FieldError>
                                      )}
                                    </FieldContent>
                                  </Field>
                                )
                              }}
                            </form.Field>
                          </div>

                          <FieldSeparator className="my-2" />

                          <div className="grid grid-cols-2 gap-4">
                            {/* Total panjang yang terpakai */}
                            <form.Field
                              name="totalLength"
                              validators={{
                                onBlur: ({ value }) => {
                                  if (!value || value <= 0) {
                                    return 'Total panjang yang terpakai harus lebih dari 0'
                                  }
                                  return undefined
                                },
                              }}
                            >
                              {(subField) => {
                                const isInvalid =
                                  subField.state.meta.isTouched &&
                                  subField.state.meta.errors &&
                                  subField.state.meta.errors.length > 0

                                return (
                                  <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={subField.name}>
                                      Total Panjang Yang Terpakai
                                    </FieldLabel>
                                    <FieldContent>
                                      <InputGroup>
                                        <InputGroupInput
                                          id={subField.name}
                                          type="number"
                                          min="1"
                                          max="1000000"
                                          value={subField.state.value}
                                          onBlur={subField.handleBlur}
                                          onChange={(e) => {
                                            const val = e.target.value
                                            subField.handleChange(
                                              val === '' ? 0 : Number(val),
                                            )
                                          }}
                                          placeholder="Masukkan total panjang yang terpakai"
                                          className="font-jetbrains-mono"
                                          readOnly
                                        />
                                        <InputGroupAddon align="inline-end">
                                          <span className="text-sm">meter</span>
                                        </InputGroupAddon>
                                      </InputGroup>
                                      {isInvalid && (
                                        <FieldError>
                                          {field.state.meta.errors.join(', ')}
                                        </FieldError>
                                      )}
                                    </FieldContent>
                                  </Field>
                                )
                              }}
                            </form.Field>

                            {/* Panjang per cones */}
                            <form.Field
                              name="coneLength"
                              validators={{
                                onBlur: ({ value }) => {
                                  if (!value || value <= 0) {
                                    return 'Panjang per cones harus lebih dari 0'
                                  }
                                  return undefined
                                },
                              }}
                            >
                              {(subField) => {
                                const isInvalid =
                                  subField.state.meta.isTouched &&
                                  subField.state.meta.errors &&
                                  subField.state.meta.errors.length > 0

                                return (
                                  <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={subField.name}>
                                      Panjang per cones (hasil test panjang)
                                    </FieldLabel>
                                    <FieldContent>
                                      <InputGroup>
                                        <InputGroupInput
                                          id={subField.name}
                                          type="number"
                                          min="1"
                                          max="1000000"
                                          value={subField.state.value ?? 1}
                                          onBlur={subField.handleBlur}
                                          onChange={(e) => {
                                            const val = e.target.value
                                            subField.handleChange(
                                              val === '' ? 0 : Number(val),
                                            )
                                          }}
                                          placeholder="Masukkan total panjang per cones"
                                          className="font-jetbrains-mono"
                                        />
                                        <InputGroupAddon align="inline-end">
                                          <span className="text-sm">meter</span>
                                        </InputGroupAddon>
                                      </InputGroup>
                                      {isInvalid && (
                                        <FieldError>
                                          {field.state.meta.errors.join(', ')}
                                        </FieldError>
                                      )}
                                    </FieldContent>
                                  </Field>
                                )
                              }}
                            </form.Field>

                            {/* Beaming Loss */}
                            {warpingMachine === 'mo_ts' && (
                              <form.Field
                                name="beamingLoss"
                                validators={{
                                  onBlur: ({ value }) => {
                                    if (!value || value <= 0) {
                                      return 'Loss Beaming harus lebih dari 0'
                                    }
                                    return undefined
                                  },
                                }}
                              >
                                {(subField) => {
                                  const isInvalid =
                                    subField.state.meta.isTouched &&
                                    subField.state.meta.errors &&
                                    subField.state.meta.errors.length > 0

                                  return (
                                    <Field data-invalid={isInvalid}>
                                      <FieldLabel htmlFor={subField.name}>
                                        Loss Beaming
                                      </FieldLabel>
                                      <FieldContent>
                                        <InputGroup>
                                          <InputGroupInput
                                            id={subField.name}
                                            type="number"
                                            min="1"
                                            max="1000000"
                                            value={subField.state.value}
                                            onBlur={subField.handleBlur}
                                            onChange={(e) => {
                                              const val = e.target.value
                                              subField.handleChange(
                                                val === '' ? 0 : Number(val),
                                              )
                                            }}
                                            placeholder="Masukkan total panjang per cones"
                                            className="font-jetbrains-mono"
                                          />
                                          <InputGroupAddon align="inline-end">
                                            <span className="text-sm">
                                              meter
                                            </span>
                                          </InputGroupAddon>
                                        </InputGroup>
                                        {isInvalid && (
                                          <FieldError>
                                            {field.state.meta.errors.join(', ')}
                                          </FieldError>
                                        )}
                                      </FieldContent>
                                    </Field>
                                  )
                                }}
                              </form.Field>
                            )}
                          </div>
                        </Tabs>
                      </Field>
                    )}
                  </form.Field>
                </FieldGroup>
              </FieldSet>

              <FieldSet
                disabled={isFormDisabled}
                className="border border-border rounded-xl p-5 pt-0 bg-card/50 shadow-sm"
              >
                {/* Legend bertindak sebagai Label Utama/Judul Fieldset */}
                <FieldLegend className="px-5">Beaming</FieldLegend>

                <form.Field name="cutmarkValue">
                  {(field) => (
                    <div className="rounded-lg border border-border bg-card p-4 shadow-sm space-y-2">
                      <div className="text-xs font-bold text-muted-foreground tracking-wider border-b pb-2 mb-2">
                        Cutmark
                      </div>
                      <div className="p-3 bg-muted/40 rounded-lg min-h-12 flex items-center">
                        <span className="font-mono text-base font-semibold text-primary break-all tracking-wide">
                          {field.state.value || '-'}
                        </span>
                      </div>
                    </div>
                  )}
                </form.Field>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                  <div className="xl:col-span-8 flex flex-col gap-2 min-h-100">
                    <div className="border border-border rounded-xl p-4 bg-muted/10 flex-1 shadow-inner">
                      <CutMarkKanban
                        initialRolls={initialRolls}
                        testTying={testTying ?? 10}
                        testStretching={testStretching ?? 35}
                        onChange={handleKanbanChange}
                      />
                    </div>
                  </div>

                  <div className="xl:col-span-4 space-y-4 bg-muted/20 p-4 border border-border rounded-xl">
                    <div className="text-xs font-bold text-muted-foreground tracking-wider border-b pb-2 mb-2">
                      Test
                    </div>

                    <form.Field name="testTying">
                      {(field) => (
                        <Field>
                          <FieldLabel htmlFor={field.name} className="text-xs">
                            Test Awal
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
                                  field.handleChange(
                                    val === '' ? 0 : Number(val),
                                  )
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

                    <form.Field name="testStretching">
                      {(field) => (
                        <Field>
                          <FieldLabel htmlFor={field.name} className="text-xs">
                            Test Akhir
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
                                  field.handleChange(
                                    val === '' ? 0 : Number(val),
                                  )
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
                  </div>
                </div>

                <FieldSeparator />

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
                            min="1.0"
                            max="10000"
                            step="0.01"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => {
                              const val = e.target.value
                              if (val === '') {
                                field.handleChange(0)
                                return
                              }
                              const parsed = parseFloat(val)
                              if (!isNaN(parsed)) {
                                field.handleChange(parsed)
                              }
                            }}
                            placeholder="Masukkan lebar beam"
                            className="font-jetbrains-mono h-9 text-sm"
                          />
                          <InputGroupAddon align="inline-end">
                            <span className="text-sm">mm</span>
                          </InputGroupAddon>
                        </InputGroup>
                      </FieldContent>
                    </Field>
                  )}
                </form.Field>

                {/* Jumlah helai lusi */}
                <form.Field name="totalEnds">
                  {(field) => (
                    <div className="rounded-lg border border-border bg-card p-4 shadow-sm space-y-2">
                      <div className="text-[14px]">
                        Jumlah Helai Lusi
                        <span className="font-jetbrains-mono">
                          {selectedSpec && (
                            <span>
                              {' '}
                              {selectedSpec?.totalEnds.toLocaleString(
                                'en-US',
                              )}{' '}
                              + {spareEnds}{' '}
                              {selectedSpec?.fringe !== 0
                                ? `+ ${selectedSpec?.fringe}`
                                : ''}{' '}
                              ={' '}
                              {field.state.value?.toLocaleString('en-US') ||
                                '-'}{' '}
                              Helai
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </form.Field>
              </FieldSet>
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
