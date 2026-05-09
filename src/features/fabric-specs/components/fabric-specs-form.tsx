import { useMemo } from 'react'
import { useForm } from '@tanstack/react-form'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { useFabricSpecMutation } from '../hooks/use-fabric-specs'
import { useColorLayout } from '@/features/color-layout/hooks/use-color-layout'

import type { FabricSpecForm, FabricSpecFormValues } from '@/types/FabricSpec'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Input } from '@/components/ui/input'

import { ColorsCombobox } from '@/components/colors-combobox'
import { ColorLayoutsCombobox } from '@/components/color-layouts-combobox'
import { FabricsCombobox } from '@/components/fabrics-combobox'
import { YarnCombobox } from '@/components/yarn-combobox'

import { XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export const FabricSpecsForm = ({
  mode = 'create',
  initialData,
}: FabricSpecForm) => {
  const navigate = useNavigate()
  const router = useRouter()
  const { createMutation, updateMutation, isPending } = useFabricSpecMutation()
  const { data: colorLayouts } = useColorLayout()

  const getInitialValues = useMemo((): FabricSpecFormValues => {
    if (mode === 'edit' && initialData) {
      const safeColor = initialData.color ?? '-'
      const parts = safeColor.split(' ')
      const colorId = parts[0]

      // Determine if it's a layout or manual input
      // If it exists in colorLayouts, it's a layout. Otherwise if it's not '-', it's manual.
      const isLayout = colorLayouts?.some((l) => l.id === colorId)
      const isNone = safeColor === '-' || !safeColor
      const isManual = !isLayout && !isNone

      return {
        ...initialData,
        color: safeColor,
        cutmarkPerRoll: (initialData.cutmarkPerRoll as {
          roll: number
          length: number
        }[]) ?? [{ roll: 1, length: 1 }],
        hasColorLayout: !isNone,
        colorInputType: isLayout ? 'layout' : 'manual',
        manualColorName: isManual ? colorId : '',
        manualColorDescription: isManual ? parts.slice(1).join(' ') : '',
      } as FabricSpecFormValues
    }

    return {
      fabricId: '',
      width: 1,
      length: 1,
      warpYarnId: '',
      weftYarnId: '',
      color: '-',
      cutmarkPerRoll: [{ roll: 1, length: 1 }],
      totalEnds: 1,
      reedWidth: 1.0,
      reedNo: '',
      fringe: 0,
      pickPerInch: 1,
      hasColorLayout: false,
      colorInputType: 'manual',
      manualColorName: '',
      manualColorDescription: '',
    }
  }, [mode, initialData, colorLayouts])

  const form = useForm({
    defaultValues: getInitialValues,
    onSubmit: async ({ value }) => {
      let finalColorValue = '-'

      if (value.hasColorLayout) {
        if (value.colorInputType === 'layout') {
          finalColorValue = value.color || '-'
        } else {
          finalColorValue =
            `${value.manualColorName} ${value.manualColorDescription}`.trim() ||
            '-'
        }
      }

      const payload = {
        ...value,
        color: finalColorValue,
        reedWidth: Number(value.reedWidth),
      }

      if (mode === 'edit' && initialData?.id) {
        await updateMutation.mutateAsync({ id: initialData.id, ...payload })
      } else {
        await createMutation.mutateAsync(payload)
      }

      router.invalidate()
      navigate({ to: '/fabric-specs' })
    },
  })

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Detail Spek</CardTitle>
      </CardHeader>

      <CardContent>
        <form
          id="fabric-spec-form"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
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
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Kain</FieldLabel>
                    <FabricsCombobox
                      fieldName={field.name}
                      value={field.state.value}
                      onChange={(value) => field.handleChange(value)}
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

            <div className="flex items-center gap-2">
              {/* Lebar */}
              <form.Field
                name="width"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value || value <= 0) {
                      return 'Lebar harus lebih dari 0'
                    }
                    return undefined
                  },
                }}
              >
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    field.state.meta.errors &&
                    field.state.meta.errors.length > 0

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="width">Lebar</FieldLabel>
                      <FieldContent>
                        <InputGroup>
                          <InputGroupInput
                            id="lebar"
                            type="number"
                            min="1"
                            max="10000"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => {
                              const val = e.target.value
                              field.handleChange(val === '' ? 0 : Number(val))
                            }}
                            placeholder="Masukkan lebar"
                          />
                          <InputGroupAddon align="inline-end">
                            <span className="text-sm">cm</span>
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

              <div className="mt-8 flex items-center justify-center">
                <XIcon className="h-4 w-4 text-muted-foreground" />
              </div>

              {/* Panjang */}
              <form.Field
                name="length"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value || value <= 0) {
                      return 'Panjang harus lebih dari 0'
                    }
                    return undefined
                  },
                }}
              >
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    field.state.meta.errors &&
                    field.state.meta.errors.length > 0

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="length">Panjang</FieldLabel>
                      <FieldContent>
                        <InputGroup>
                          <InputGroupInput
                            id="length"
                            type="number"
                            min="1"
                            max="10000"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => {
                              const val = e.target.value
                              field.handleChange(val === '' ? 0 : Number(val))
                            }}
                            placeholder="Masukkan panjang"
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Lusi */}
              <form.Field
                name="warpYarnId"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value || value.trim() === '') {
                      return 'Benang Lusi harus dipilih'
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
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Lusi</FieldLabel>
                      <YarnCombobox
                        fieldName={field.name}
                        value={field.state.value}
                        onChange={(value) => field.handleChange(value)}
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

              {/* Pakan */}
              <form.Field
                name="weftYarnId"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value || value.trim() === '') {
                      return 'Benang Pakan harus dipilih'
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
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Pakan</FieldLabel>
                      <YarnCombobox
                        fieldName={field.name}
                        value={field.state.value}
                        onChange={(value) => field.handleChange(value)}
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
            </div>

            {/* Cutmark */}
            <div className="space-y-4 rounded-lg border p-4">
              <form.Field name="cutmarkPerRoll">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    field.state.meta.errors &&
                    field.state.meta.errors.length > 0

                  return (
                    <FieldSet className="gap-4">
                      <FieldLabel>Cutmark per Roll</FieldLabel>

                      <FieldGroup className="gap-3">
                        {field.state.value.map((_, index) => (
                          <div key={index} className="flex items-start gap-2">
                            {/* Input Jumlah Roll */}
                            <form.Field name={`cutmarkPerRoll[${index}].roll`}>
                              {(subField) => (
                                <Field className="flex-1">
                                  <InputGroup>
                                    <InputGroupInput
                                      type="number"
                                      value={subField.state.value}
                                      onChange={(e) =>
                                        subField.handleChange(
                                          Number(e.target.value),
                                        )
                                      }
                                      placeholder="Jml Roll"
                                    />
                                    <InputGroupAddon align="inline-end">
                                      <span className="text-xs">Roll</span>
                                    </InputGroupAddon>
                                  </InputGroup>
                                </Field>
                              )}
                            </form.Field>

                            <span className="mt-2 text-muted-foreground">
                              <XIcon className="h-4 w-4" />
                            </span>

                            {/* Input Panjang per Roll */}
                            <form.Field
                              name={`cutmarkPerRoll[${index}].length`}
                            >
                              {(subField) => (
                                <Field className="flex-2">
                                  <InputGroup>
                                    <InputGroupInput
                                      type="number"
                                      value={subField.state.value}
                                      onChange={(e) =>
                                        subField.handleChange(
                                          Number(e.target.value),
                                        )
                                      }
                                      placeholder="Panjang"
                                    />
                                    <InputGroupAddon align="inline-end">
                                      <span className="text-xs">Meter</span>
                                    </InputGroupAddon>

                                    {/* Tombol Hapus */}
                                    {field.state.value.length > 1 && (
                                      <InputGroupAddon align="inline-end">
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon-sm"
                                          onClick={() =>
                                            field.removeValue(index)
                                          }
                                        >
                                          <XIcon className="h-4 w-4" />
                                        </Button>
                                      </InputGroupAddon>
                                    )}
                                  </InputGroup>
                                </Field>
                              )}
                            </form.Field>
                          </div>
                        ))}

                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          disabled={field.state.value.length >= 5}
                          onClick={() => {
                            const currentValues = field.state.value

                            const lastLengthValue =
                              currentValues.length > 0
                                ? currentValues[currentValues.length - 1].length
                                : 0

                            field.pushValue({
                              roll: 1,
                              length: lastLengthValue || 1,
                            })
                          }}
                        >
                          Tambah Cutmark
                        </Button>
                      </FieldGroup>

                      <FieldDescription>
                        Jika panjang cutmark berbeda untuk tiap roll, klik
                        tombol "Tambah Cutmark" untuk menambahkan jumlah roll
                        dan cutmark yang sesuai.
                      </FieldDescription>

                      {isInvalid && (
                        <FieldError>
                          {field.state.meta.errors.join(', ')}
                        </FieldError>
                      )}
                    </FieldSet>
                  )
                }}
              </form.Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Lebar Sisir */}
              <form.Field
                name="reedWidth"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value || value <= 0) {
                      return 'Lebar sisir harus lebih dari 0'
                    }
                    return undefined
                  },
                }}
              >
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    field.state.meta.errors &&
                    field.state.meta.errors.length > 0

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="reedWidth">Lebar Sisir</FieldLabel>
                      <FieldContent>
                        <InputGroup>
                          <InputGroupInput
                            id="lebar"
                            type="number"
                            min="1.00"
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
                            placeholder="Masukkan lebar sisir"
                          />
                          <InputGroupAddon align="inline-end">
                            <span className="text-sm">inch</span>
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

              {/* Nomor Sisir */}
              <form.Field
                name="reedNo"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value || value.trim() === '') {
                      return 'Nomor sisir harus diisi'
                    }
                    return undefined
                  },
                }}
              >
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    field.state.meta.errors &&
                    field.state.meta.errors.length > 0

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="reedNo">Nomor Sisir</FieldLabel>
                      <FieldContent>
                        <InputGroup>
                          <InputGroupAddon align="inline-start">
                            <span className="text-sm">#</span>
                          </InputGroupAddon>

                          <InputGroupInput
                            id="reedNo"
                            type="text"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
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

            <div className="grid grid-cols-2 gap-4">
              {/* Jumlah Helai Lusi */}
              <form.Field
                name="totalEnds"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value || value <= 0) {
                      return 'Total helai lusi harus lebih dari 0'
                    }
                    return undefined
                  },
                }}
              >
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    field.state.meta.errors &&
                    field.state.meta.errors.length > 0

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="totalEnds">
                        Jumlah Helai Lusi
                      </FieldLabel>
                      <FieldContent>
                        <InputGroup>
                          <InputGroupInput
                            id="totalEnds"
                            type="number"
                            min="1"
                            max="100000"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => {
                              const val = e.target.value
                              field.handleChange(val === '' ? 1 : Number(val))
                            }}
                            placeholder="Masukkan jumlah helai"
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

              {/* Jumlah Helai Pakan/Inch */}
              <form.Field
                name="pickPerInch"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value || value <= 0) {
                      return 'Pick per inch harus lebih dari 0'
                    }
                    return undefined
                  },
                }}
              >
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    field.state.meta.errors &&
                    field.state.meta.errors.length > 0

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="pickPerInch">
                        Jumlah Helai Pakan/Inch
                      </FieldLabel>
                      <FieldContent>
                        <InputGroup>
                          <InputGroupInput
                            id="pickPerInch"
                            type="number"
                            min="1"
                            max="10000"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => {
                              const val = e.target.value
                              field.handleChange(val === '' ? 1 : Number(val))
                            }}
                            placeholder="Masukkan jumlah helai pakan"
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

            <div className="grid grid-cols-2 gap-4">
              {/* Pinggiran */}
              <form.Field name="fringe">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    field.state.meta.errors &&
                    field.state.meta.errors.length > 0

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="fringe">Pinggiran</FieldLabel>
                      <FieldContent>
                        <InputGroup>
                          <InputGroupInput
                            id="fringe"
                            type="number"
                            min="0"
                            max="10000"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => {
                              const val = e.target.value
                              field.handleChange(val === '' ? 0 : Number(val))
                            }}
                            placeholder="Masukkan panjang"
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

              {/* Warna */}
              <form.Field name="hasColorLayout">
                {(hasColorField) => (
                  <div className="flex flex-col gap-2">
                    {/* Checkbox */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasColorLayout"
                        checked={hasColorField.state.value}
                        onCheckedChange={(checked) => {
                          hasColorField.handleChange(!!checked)
                          if (!checked) {
                            form.setFieldValue('color', '-')
                          }
                        }}
                      />
                      <FieldLabel htmlFor="hasColorLayout" className="mb-0">
                        Benang Warna yang Masuk
                      </FieldLabel>
                    </div>

                    <div
                      className={cn(
                        hasColorField.state.value ? 'block' : 'hidden',
                      )}
                    >
                      <Accordion
                        type="single"
                        collapsible
                        className="w-full"
                        defaultValue="color-content"
                      >
                        <AccordionItem
                          value="color-content"
                          className="border-none"
                        >
                          <AccordionContent className="space-y-4 rounded-lg border p-4 pt-4">
                            <form.Field name="colorInputType">
                              {(typeField) => (
                                <>
                                  <div className="flex gap-4 pb-2 border-b">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        value="manual"
                                        checked={
                                          typeField.state.value === 'manual'
                                        }
                                        onChange={() =>
                                          typeField.handleChange('manual')
                                        }
                                      />
                                      <span className="text-sm">
                                        Input Manual
                                      </span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        value="layout"
                                        checked={
                                          typeField.state.value === 'layout'
                                        }
                                        onChange={() =>
                                          typeField.handleChange('layout')
                                        }
                                      />
                                      <span className="text-sm">
                                        Pilih dari Layout
                                      </span>
                                    </label>
                                  </div>

                                  {/* Conditional input */}
                                  {typeField.state.value === 'layout' &&
                                  colorLayouts ? (
                                    <form.Field name="color">
                                      {(field) => {
                                        const isInvalid =
                                          field.state.meta.isTouched &&
                                          field.state.meta.errors.length > 0

                                        return (
                                          <Field data-invalid={isInvalid}>
                                            <FieldLabel>
                                              Pilih Layout Benang Warna
                                            </FieldLabel>
                                            <ColorLayoutsCombobox
                                              fieldName={field.name}
                                              value={field.state.value}
                                              onChange={(value) =>
                                                field.handleChange(value)
                                              }
                                            />
                                            {isInvalid && (
                                              <FieldError>
                                                {field.state.meta.errors.join(
                                                  ', ',
                                                )}
                                              </FieldError>
                                            )}
                                          </Field>
                                        )
                                      }}
                                    </form.Field>
                                  ) : typeField.state.value === 'layout' ? (
                                    <div>Loading...</div>
                                  ) : (
                                    <div className="space-y-4">
                                      <form.Field name="manualColorName">
                                        {(nameField) => {
                                          const isInvalid =
                                            nameField.state.meta.isTouched &&
                                            nameField.state.meta.errors.length >
                                              0

                                          return (
                                            <Field data-invalid={isInvalid}>
                                              <FieldLabel>
                                                Pilih Warna
                                              </FieldLabel>
                                              <ColorsCombobox
                                                value={nameField.state.value}
                                                onChange={(val) =>
                                                  nameField.handleChange(val)
                                                }
                                              />
                                              {isInvalid && (
                                                <FieldError>
                                                  {nameField.state.meta.errors.join(
                                                    ', ',
                                                  )}
                                                </FieldError>
                                              )}
                                            </Field>
                                          )
                                        }}
                                      </form.Field>

                                      <form.Field name="manualColorDescription">
                                        {(descField) => (
                                          <Field>
                                            <FieldLabel>Keterangan</FieldLabel>
                                            <Input
                                              placeholder="Misal: 1 helai dari OUT (helai ke-23)"
                                              value={descField.state.value}
                                              onChange={(e) =>
                                                descField.handleChange(
                                                  e.target.value,
                                                )
                                              }
                                            />
                                          </Field>
                                        )}
                                      </form.Field>
                                    </div>
                                  )}
                                </>
                              )}
                            </form.Field>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </div>
                )}
              </form.Field>
            </div>
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter>
        <Button type="submit" form="fabric-spec-form" disabled={isPending}>
          {isPending ? 'Menyimpan...' : mode === 'edit' ? 'Simpan' : 'Buat'}
        </Button>
      </CardFooter>
    </Card>
  )
}
