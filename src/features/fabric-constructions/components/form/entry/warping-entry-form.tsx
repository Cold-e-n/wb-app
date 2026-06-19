import { useStore } from '@tanstack/react-form'
import { withForm } from '@/features/fabric-constructions/hooks/use-fabric-contructions-form'
import type { FabricConstructionFormValues } from '@/types/FabricConstruction'
import { calculateMaxBeamingLoss, calculateTotalLength } from '@/lib/cutmark'

import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const WarpingEntryForm = withForm({
  defaultValues: {} as FabricConstructionFormValues,
  props: {} as { isFormDisabled: boolean },
  render: ({ form, isFormDisabled }) => {
    const { warpingMachine, coneLength, sectionCount, cutMarkSequence } =
      useStore(form.store, (state) => ({
        warpingMachine: state.values.warpingMachine,
        coneLength: state.values.coneLength,
        sectionCount: state.values.sectionCount,
        cutMarkSequence: state.values.cutMarkSequence,
      }))

    // Batas maksimum beamingLoss supaya totalLength tidak melebihi coneLength
    const rawLength = calculateTotalLength(cutMarkSequence ?? [])
    const referenceSectionCount =
      sectionCount && sectionCount > 0 ? sectionCount : 1
    const maxBeamingLoss = calculateMaxBeamingLoss(
      coneLength ?? 0,
      rawLength,
      referenceSectionCount,
    )

    return (
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
                    const currentStretching =
                      form.getFieldValue('testStretching')
                    const isStillDefault =
                      currentStretching?.length === 1 &&
                      currentStretching[0] === 35
                    if (isStillDefault) {
                      form.setFieldValue('testStretching', [35])
                    }

                    if (value === 'BENN_KM') {
                      form.setFieldValue('beamingLoss', 0)
                    }

                    form.setFieldValue('testTying', testTying)
                    form.validateField('sectionCount', 'change')
                  }}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="BENN_KM">
                      BENNINGER / KARL MAYER
                    </TabsTrigger>
                    <TabsTrigger value="MO_TS">MO / TSUDAKOMA</TabsTrigger>
                  </TabsList>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Jumlah cones */}
                    <form.Field
                      name="coneCount"
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
                                  className="font-jetbrains-mono text-primary cursor-not-allowed"
                                  readOnly
                                />
                                <InputGroupAddon align="inline-end">
                                  <span className="text-sm">cones</span>
                                </InputGroupAddon>
                              </InputGroup>
                              {isInvalid && (
                                <FieldError>
                                  {subField.state.meta.errors.join(', ')}
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
                        onChange: ({ value }) => {
                          const currentMachine =
                            form.getFieldValue('warpingMachine')
                          const max = currentMachine === 'BENN_KM' ? 25 : 15
                          if (value > max) {
                            return `Maksimal ${max} ${currentMachine === 'BENN_KM' ? 'section' : 'beam'}`
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
                                  {subField.state.meta.errors.join(', ')}
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
                                  className="font-jetbrains-mono text-primary cursor-not-allowed"
                                  readOnly
                                />
                                <InputGroupAddon align="inline-end">
                                  <span className="text-sm">meter</span>
                                </InputGroupAddon>
                              </InputGroup>
                              {isInvalid && (
                                <FieldError>
                                  {subField.state.meta.errors.join(', ')}
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
                          if (
                            value === undefined ||
                            value === null ||
                            value < 0
                          ) {
                            return 'Spare tidak boleh kurang dari 0'
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
                                  min="0"
                                  max="10000"
                                  value={subField.state.value}
                                  onBlur={subField.handleBlur}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    subField.handleChange(
                                      val === '' ? 0 : Number(val),
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
                                  {subField.state.meta.errors.join(', ')}
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
                                  className="font-jetbrains-mono text-primary cursor-not-allowed"
                                  readOnly
                                />
                                <InputGroupAddon align="inline-end">
                                  <span className="text-sm">meter</span>
                                </InputGroupAddon>
                              </InputGroup>
                              {isInvalid && (
                                <FieldError>
                                  {subField.state.meta.errors.join(', ')}
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
                              Panjang per cones
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
                                  {subField.state.meta.errors.join(', ')}
                                </FieldError>
                              )}
                            </FieldContent>
                          </Field>
                        )
                      }}
                    </form.Field>

                    {/* Beaming Loss */}
                    {warpingMachine === 'MO_TS' && (
                      <form.Field
                        name="beamingLoss"
                        validators={{
                          onBlur: ({ value }) => {
                            if (!value || value <= 0) {
                              return 'Loss Beaming harus lebih dari 0'
                            }
                            if (maxBeamingLoss > 0 && value > maxBeamingLoss) {
                              return `Loss Beaming maksimal ${maxBeamingLoss}m (total panjang tidak boleh melebihi panjang benang)`
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

                          const isAtLimit =
                            maxBeamingLoss > 0 &&
                            (subField.state.value ?? 0) >= maxBeamingLoss

                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={subField.name}>
                                Loss Beaming
                                {maxBeamingLoss < 50 && (
                                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                                    (maks.{' '}
                                    {maxBeamingLoss.toLocaleString('id-ID')}m)
                                  </span>
                                )}
                              </FieldLabel>
                              <FieldContent>
                                <InputGroup>
                                  <InputGroupInput
                                    id={subField.name}
                                    name={subField.name}
                                    // Agar tidak error saat dihapus, berikan fallback string kosong untuk UI saja
                                    value={
                                      subField.state.value === 0
                                        ? 0
                                        : subField.state.value || ''
                                    }
                                    type="number"
                                    min={1}
                                    max={maxBeamingLoss}
                                    onChange={(e) => {
                                      // 1. SABUK PENGAMAN: Jika input dihapus habis, paksa jadi 0, BUKAN null!
                                      let val =
                                        e.target.value === ''
                                          ? 0
                                          : Number(e.target.value)

                                      // 2. Cegah nilai NaN (Not a Number) atau angka minus
                                      if (isNaN(val) || val < 0) {
                                        val = 0
                                      }

                                      // 3. Batasi sesuai sisa benang (Auto-Clamp yang kita buat sebelumnya)
                                      if (val > maxBeamingLoss) {
                                        val = Math.floor(maxBeamingLoss)
                                      }

                                      // 4. Update ke Tanstack Form (pasti number!)
                                      subField.handleChange(val)
                                    }}
                                    className={
                                      isAtLimit
                                        ? 'font-jetbrains-mono text-amber-500 focus-visible:ring-amber-500'
                                        : 'font-jetbrains-mono'
                                    }
                                  />
                                  <InputGroupAddon align="inline-end">
                                    <span className="text-sm">meter</span>
                                  </InputGroupAddon>
                                </InputGroup>
                                {isInvalid ? (
                                  <FieldError>
                                    {subField.state.meta.errors.join(', ')}
                                  </FieldError>
                                ) : isAtLimit ? (
                                  <span className="text-xs text-amber-500">
                                    Sudah mencapai batas maksimum
                                  </span>
                                ) : null}
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
    )
  },
})
