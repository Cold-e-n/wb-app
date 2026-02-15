import { useState, useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { useColorLayoutMutation } from '../hooks/use-color-layout'
import type { ColorContent } from '@/types/ColorLayout'

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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ColorsCombobox } from '@/components/colors-combobox'
import { FabricsCombobox } from '@/components/fabrics-combobox'

const formSchema = z.object({
  fabric: z.string().min(1, 'Kain harus dipilih'),
  type: z.enum(['single', 'double', 'triple']),
  color1: z.string().min(1, 'Benang warna harus dipilih').optional(),
  color2: z.string().optional(),
  colorDistance: z.number().min(1, 'Jarak warna minimal 1'),
  colorPairDistance: z.number().min(1, 'Jarak warna minimal 1').optional(),
  colorCount: z.number().min(1, 'Jumlah warna minimal 1'),
  isIn: z.boolean().optional(),
  isOut: z.boolean().optional(),
  colorInCount: z.number().min(1, 'Jumlah warna minimal 1').optional(),
  colorIn: z.array(z.string()).optional(),
  colorInDistance: z.number().min(1, 'Jarak warna minimal 1').optional(),
  colorOutCount: z.number().min(1, 'Jumlah warna minimal 1').optional(),
  colorOut: z.array(z.string()).optional(),
  colorOutDistance: z.number().min(1, 'Jarak warna minimal 1').optional(),
})

type FormValues = z.infer<typeof formSchema>

type ColorLayoutFormProps = {
  mode?: 'create' | 'edit'
  initialData?: {
    id: string
    fabricId: string
    colorContent: ColorContent
  }
}

export const ColorLayoutForm = ({
  mode = 'create',
  initialData,
}: ColorLayoutFormProps) => {
  const navigate = useNavigate()
  const { createMutation, updateMutation, isPending } = useColorLayoutMutation()

  // State untuk menyimpan ID yang dipilih
  const [fabricId, setFabricId] = useState(initialData?.fabricId ?? '')

  // Parse initialData colorContent for edit mode
  const getInitialValues = (): FormValues => {
    if (mode === 'edit' && initialData?.colorContent) {
      const content = initialData.colorContent
      return {
        fabric: initialData.fabricId,
        type: (content.type as 'single' | 'double' | 'triple') || 'single',
        color1: content.color?.[0] || '',
        color2: content.color?.[1] || '',
        colorDistance: content.colorDistance || 1,
        colorPairDistance: (content as any).colorPairDistance || 1,
        colorCount: content.colorCount || 1,
        isIn: !!content.IN,
        isOut: !!content.OUT,
        colorInCount: content.IN?.count || 1,
        colorIn: content.IN?.color || [],
        colorInDistance: content.IN?.distance || 1,
        colorOutCount: content.OUT?.count || 1,
        colorOut: content.OUT?.color || [],
        colorOutDistance: content.OUT?.distance || 1,
      }
    }
    return {
      fabric: '',
      type: 'single',
      color1: '',
      color2: '',
      colorDistance: 1,
      colorPairDistance: 1,
      colorCount: 1,
      isIn: false,
      isOut: false,
      colorInCount: 1,
      colorIn: [],
      colorInDistance: 1,
      colorOutCount: 1,
      colorOut: [],
      colorOutDistance: 1,
    }
  }

  const form = useForm({
    defaultValues: getInitialValues(),
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const colorContent = {
        type: value.type,
        ...(value.type === 'single' || value.type === 'triple'
          ? {
              color: [value.color1],
              colorDistance: value.colorDistance,
              colorCount: value.colorCount,
            }
          : {}),
        ...(value.type === 'double'
          ? {
              color: [value.color1, value.color2],
              colorDistance: value.colorDistance,
              colorPairDistance: value.colorPairDistance,
              colorCount: value.colorCount,
            }
          : {}),

        ...(value.isIn && {
          IN: {
            color: value.colorIn || [],
            distance: value.colorInDistance || 1,
            count: value.colorInCount || 1,
          },
        }),

        ...(value.isOut && {
          OUT: {
            color: value.colorOut || [],
            distance: value.colorOutDistance || 1,
            count: value.colorOutCount || 1,
          },
        }),
      }

      if (mode === 'edit' && initialData?.id) {
        await updateMutation.mutateAsync({
          id: initialData.id,
          fabricId: value.fabric,
          colorContent,
        })
      } else {
        await createMutation.mutateAsync({
          fabricId: value.fabric,
          colorContent,
        })
      }

      navigate({ to: '/color-layouts' })
    },
  })

  const [isInValue, setIsInValue] = useState(!!initialData?.colorContent?.IN)
  const [isOutValue, setIsOutValue] = useState(!!initialData?.colorContent?.OUT)

  useEffect(() => {
    const unsubscribe = form.store.subscribe(() => {
      const fabricValue = form.getFieldValue('fabric') ?? ''

      if (fabricValue !== fabricId) {
        setFabricId(fabricValue)
      }

      setIsInValue(form.getFieldValue('isIn') ?? false)
      setIsOutValue(form.getFieldValue('isOut') ?? false)
    })

    return unsubscribe
  }, [fabricId, form])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Detail Layout</CardTitle>
      </CardHeader>

      <CardContent>
        <form
          id="color-layout-form"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            {/* Pilih Kain */}
            <form.Field
              name="fabric"
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
                    <FieldLabel htmlFor={field.name}>Kain *</FieldLabel>
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

            {/* Tipe Tabs */}
            <form.Field name="type">
              {(field) => (
                <Field>
                  <FieldLabel>Tipe</FieldLabel>
                  <Tabs
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(
                        value as 'single' | 'double' | 'triple',
                      )
                    }
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="single">Single</TabsTrigger>
                      <TabsTrigger value="double">Double</TabsTrigger>
                      <TabsTrigger value="triple">Triple</TabsTrigger>
                    </TabsList>

                    {/* Single & Triple Content */}
                    {(field.state.value === 'single' ||
                      field.state.value === 'triple') && (
                      <div className="mt-4 space-y-4 rounded-lg border p-4">
                        <form.Field name="color1">
                          {(subField) => (
                            <Field>
                              <FieldLabel>Benang Warna</FieldLabel>
                              <ColorsCombobox
                                value={subField.state.value}
                                onChange={(val) => subField.handleChange(val)}
                              />
                            </Field>
                          )}
                        </form.Field>

                        <div className="grid grid-cols-2 gap-4">
                          <form.Field name="colorDistance">
                            {(subField) => (
                              <Field>
                                <FieldLabel>Jarak Warna</FieldLabel>
                                <Input
                                  type="number"
                                  value={subField.state.value}
                                  onChange={(e) =>
                                    subField.handleChange(
                                      Number(e.target.value),
                                    )
                                  }
                                  min={1}
                                />
                              </Field>
                            )}
                          </form.Field>

                          <form.Field name="colorCount">
                            {(subField) => (
                              <Field>
                                <FieldLabel>Jumlah Warna</FieldLabel>
                                <Input
                                  type="number"
                                  value={subField.state.value}
                                  onChange={(e) =>
                                    subField.handleChange(
                                      Number(e.target.value),
                                    )
                                  }
                                  min={1}
                                />
                              </Field>
                            )}
                          </form.Field>
                        </div>
                      </div>
                    )}

                    {/* Double Content */}
                    {field.state.value === 'double' && (
                      <div className="mt-4 space-y-5 rounded-lg border p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <form.Field name="color1">
                            {(subField) => (
                              <Field>
                                <FieldLabel>Benang Warna 1</FieldLabel>
                                <ColorsCombobox
                                  value={subField.state.value}
                                  onChange={(val) => subField.handleChange(val)}
                                />
                              </Field>
                            )}
                          </form.Field>
                          <form.Field name="color2">
                            {(subField) => (
                              <Field>
                                <FieldLabel>Benang Warna 2</FieldLabel>
                                <ColorsCombobox
                                  value={subField.state.value}
                                  onChange={(val) => subField.handleChange(val)}
                                />
                              </Field>
                            )}
                          </form.Field>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <form.Field name="colorDistance">
                            {(subField) => (
                              <Field>
                                <FieldLabel>
                                  Jarak Warna (1 pasang warna ke pasangan
                                  lainnya)
                                </FieldLabel>
                                <Input
                                  type="number"
                                  value={subField.state.value}
                                  onChange={(e) =>
                                    subField.handleChange(
                                      Number(e.target.value),
                                    )
                                  }
                                />
                              </Field>
                            )}
                          </form.Field>

                          <form.Field name="colorPairDistance">
                            {(subField) => (
                              <Field>
                                <FieldLabel>
                                  Jarak Warna (warna ke warna dalam satu pasang)
                                </FieldLabel>
                                <Input
                                  type="number"
                                  value={subField.state.value}
                                  onChange={(e) =>
                                    subField.handleChange(
                                      Number(e.target.value),
                                    )
                                  }
                                />
                              </Field>
                            )}
                          </form.Field>
                        </div>

                        <form.Field name="colorCount">
                          {(subField) => (
                            <Field>
                              <FieldLabel>Jumlah Warna</FieldLabel>
                              <Input
                                type="number"
                                value={subField.state.value}
                                onChange={(e) =>
                                  subField.handleChange(Number(e.target.value))
                                }
                              />
                            </Field>
                          )}
                        </form.Field>
                      </div>
                    )}
                  </Tabs>
                </Field>
              )}
            </form.Field>

            {/* In/Out Checkboxes */}
            <div className="grid grid-cols-2 gap-6 pt-2">
              {/* IN Section */}
              <div className="flex flex-col gap-2">
                <form.Field name="isIn">
                  {(field) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isIn"
                        checked={field.state.value}
                        onCheckedChange={(checked) =>
                          field.handleChange(!!checked)
                        }
                      />
                      <FieldLabel htmlFor="isIn" className="mb-0">
                        IN
                      </FieldLabel>
                    </div>
                  )}
                </form.Field>

                {isInValue && (
                  <Accordion
                    type="single"
                    collapsible
                    className="w-full"
                    defaultValue="in-content"
                  >
                    <AccordionItem value="in-content" className="border-none">
                      <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
                        Konfigurasi IN
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 px-1 pt-2">
                        <form.Field name="colorInCount">
                          {(field) => (
                            <Field>
                              <FieldLabel>Jumlah Warna</FieldLabel>
                              <Input
                                type="number"
                                value={field.state.value}
                                onChange={(e) =>
                                  field.handleChange(Number(e.target.value))
                                }
                                min={1}
                              />
                            </Field>
                          )}
                        </form.Field>

                        {/* Dynamic IN Color Comboboxes */}
                        <form.Subscribe
                          selector={(state) => state.values.colorInCount}
                        >
                          {(colorInCount) =>
                            Array.from({
                              length: colorInCount || 1,
                            }).map((_, index) => (
                              <form.Field
                                key={`colorIn-${index}`}
                                name={`colorIn[${index}]`}
                              >
                                {(subField) => (
                                  <Field>
                                    <FieldLabel>
                                      Benang Warna {index + 1}
                                    </FieldLabel>
                                    <ColorsCombobox
                                      value={subField.state.value}
                                      onChange={(val) =>
                                        subField.handleChange(val)
                                      }
                                    />
                                  </Field>
                                )}
                              </form.Field>
                            ))
                          }
                        </form.Subscribe>

                        <form.Field name="colorInDistance">
                          {(field) => (
                            <Field>
                              <FieldLabel>Jarak Warna</FieldLabel>
                              <Input
                                type="number"
                                value={field.state.value}
                                onChange={(e) =>
                                  field.handleChange(Number(e.target.value))
                                }
                                min={1}
                              />
                            </Field>
                          )}
                        </form.Field>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </div>

              {/* OUT Section */}
              <div className="flex flex-col gap-2">
                <form.Field name="isOut">
                  {(field) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isOut"
                        checked={field.state.value}
                        onCheckedChange={(checked) =>
                          field.handleChange(!!checked)
                        }
                      />
                      <FieldLabel htmlFor="isOut" className="mb-0">
                        OUT
                      </FieldLabel>
                    </div>
                  )}
                </form.Field>

                {isOutValue && (
                  <Accordion
                    type="single"
                    collapsible
                    className="w-full"
                    defaultValue="out-content"
                  >
                    <AccordionItem value="out-content" className="border-none">
                      <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
                        Konfigurasi OUT
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 px-1 pt-2">
                        <form.Field name="colorOutCount">
                          {(field) => (
                            <Field>
                              <FieldLabel>Jumlah Warna</FieldLabel>
                              <Input
                                type="number"
                                value={field.state.value}
                                onChange={(e) =>
                                  field.handleChange(Number(e.target.value))
                                }
                                min={1}
                              />
                            </Field>
                          )}
                        </form.Field>

                        {/* Dynamic OUT Color Comboboxes */}
                        <form.Subscribe
                          selector={(state) => state.values.colorOutCount}
                        >
                          {(colorOutCount) =>
                            Array.from({
                              length: colorOutCount || 1,
                            }).map((_, index) => (
                              <form.Field
                                key={`colorOut-${index}`}
                                name={`colorOut[${index}]`}
                              >
                                {(subField) => (
                                  <Field>
                                    <FieldLabel>
                                      Benang Warna {index + 1}
                                    </FieldLabel>
                                    <ColorsCombobox
                                      value={subField.state.value}
                                      onChange={(val) =>
                                        subField.handleChange(val)
                                      }
                                    />
                                  </Field>
                                )}
                              </form.Field>
                            ))
                          }
                        </form.Subscribe>

                        <form.Field name="colorOutDistance">
                          {(field) => (
                            <Field>
                              <FieldLabel>Jarak Warna</FieldLabel>
                              <Input
                                type="number"
                                value={field.state.value}
                                onChange={(e) =>
                                  field.handleChange(Number(e.target.value))
                                }
                                min={1}
                              />
                            </Field>
                          )}
                        </form.Field>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </div>
            </div>
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter>
        <Button type="submit" form="color-layout-form" disabled={isPending}>
          {isPending ? 'Menyimpan...' : mode === 'edit' ? 'Simpan' : 'Buat'}
        </Button>
      </CardFooter>
    </Card>
  )
}
