import { z } from 'zod'
import { useForm } from '@tanstack/react-form'
import { ColorPosition, colorPositionFormSchema } from '@/types/ColorPosition'
import { useColorPositionsMutation } from '../hooks/use-color-positions'

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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { FabricsCombobox } from '@/components/fabrics-combobox'

import { XIcon } from 'lucide-react'

interface ColorPositionsFormProps {
  mode?: 'create' | 'edit'
  initialData?: ColorPosition
  onSuccess?: () => void
  onCancel?: () => void
  showCard?: boolean
}

type FormValues = z.infer<typeof colorPositionFormSchema>

export const ColorPositionsForm = ({
  mode = 'create',
  initialData,
  onSuccess,
  onCancel,
  showCard = true,
}: ColorPositionsFormProps) => {
  const getInitialValues = (): FormValues => {
    if (mode === 'edit' && initialData?.fabricContent) {
      return {
        fabric: initialData.fabricId,
        colorLayout: initialData.colorLayoutId,
        cones: initialData.fabricContent.cones,
        sections: initialData.fabricContent.sections,
        fringe: initialData.fabricContent.fringe,
        wbNo: initialData.wbNo,
      }
    }
    return {
      fabric: '',
      colorLayout: '',
      cones: [1],
      sections: 1,
      fringe: 0,
      wbNo: '',
    }
  }
  const { createMutation, updateMutation } = useColorPositionsMutation()

  const handleFormSuccess = () => {
    onSuccess?.()
  }

  const form = useForm({
    defaultValues: getInitialValues(),
    validators: {
      onChange: ({ value }) => {
        const result = colorPositionFormSchema.safeParse(value)
        if (!result.success) {
          return result.error.issues[0]?.message
        }
        return undefined
      },
    },
    onSubmit: async ({ value }) => {
      const { fabric, colorLayout, cones, sections, fringe, wbNo } = value

      const payload = {
        fabricId: fabric,
        colorLayoutId: colorLayout,
        fabricContent: {
          cones,
          sections,
          fringe: fringe || 0,
        },
        wbNo,
      }

      if (mode === 'edit' && initialData) {
        await updateMutation.mutateAsync(
          { id: initialData.id, ...payload },
          { onSuccess: handleFormSuccess },
        )
      } else {
        await createMutation.mutateAsync(payload, {
          onSuccess: handleFormSuccess,
        })
      }
    },
  })

  const formContent = (
    <form
      id="color-position-form"
      onSubmit={async (e) => {
        e.preventDefault()
        e.stopPropagation()
        await form.handleSubmit()
      }}
    >
      <FieldGroup className="gap-6">
        {/* Pilih Kain */}
        <form.Field name="fabric">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched &&
              field.state.meta.errors &&
              field.state.meta.errors.length > 0

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Kain *</FieldLabel>
                <FieldContent>
                  <FabricsCombobox
                    fieldName={field.name}
                    value={field.state.value}
                    onChange={(value, colorLayoutId) => {
                      field.handleChange(value)

                      // Auto-fill colorLayoutId saat fabric dipilih
                      if (colorLayoutId) {
                        form.setFieldValue('colorLayout', colorLayoutId)
                      }
                    }}
                  />
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

        {/* Hidden ColorLayout field */}
        <form.Field name="colorLayout">
          {(field) => (
            <>
              <input
                type="hidden"
                name={field.name}
                value={field.state.value}
              />
            </>
          )}
        </form.Field>

        {/* No WB */}
        <form.Field name="wbNo">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched &&
              field.state.meta.errors &&
              field.state.meta.errors.length > 0

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="wbNo">Nomor WB *</FieldLabel>
                <FieldContent>
                  <Input
                    id="wbNo"
                    type="text"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Masukkan nomor WB"
                  />
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

        {/* Jumlah cones */}
        <form.Field name="cones">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched &&
              field.state.meta.errors &&
              field.state.meta.errors.length > 0

            return (
              <FieldSet className="gap-4">
                <FieldLabel>Jumlah Cones *</FieldLabel>

                <FieldGroup className="gap-3">
                  {field.state.value.map((_, index) => (
                    <form.Field key={index} name={`cones[${index}]`}>
                      {(subField) => {
                        const isSubFieldInvalid =
                          subField.state.meta.isTouched &&
                          subField.state.meta.errors &&
                          subField.state.meta.errors.length > 0

                        return (
                          <Field
                            orientation="horizontal"
                            data-invalid={isSubFieldInvalid}
                          >
                            <label
                              htmlFor={`cones-field-${index}`}
                              className="sr-only"
                            >
                              Cone {index + 1}
                            </label>
                            <FieldContent>
                              <InputGroup>
                                <InputGroupAddon>
                                  <span className="text-sm font-medium">
                                    #{index + 1}
                                  </span>
                                </InputGroupAddon>
                                <InputGroupInput
                                  id={`cones-field-${index}`}
                                  name={subField.name}
                                  value={subField.state.value}
                                  onBlur={subField.handleBlur}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    subField.handleChange(
                                      val === '' ? 0 : Number(val),
                                    )
                                  }}
                                  aria-invalid={isSubFieldInvalid}
                                  aria-describedby={
                                    isSubFieldInvalid
                                      ? `cones-field-${index}-error`
                                      : undefined
                                  }
                                  type="number"
                                  min="1"
                                  max="999"
                                  placeholder="Jumlah cone"
                                  autoComplete="off"
                                />
                                <InputGroupAddon align="inline-end">
                                  <span className="text-sm">Cones</span>
                                </InputGroupAddon>
                                {field.state.value.length > 1 && (
                                  <InputGroupAddon align="inline-end">
                                    <InputGroupButton
                                      type="button"
                                      variant="ghost"
                                      size="icon-xs"
                                      onClick={() => field.removeValue(index)}
                                      aria-label={`Hapus cone ${index + 1}`}
                                    >
                                      <XIcon className="h-4 w-4" />
                                    </InputGroupButton>
                                  </InputGroupAddon>
                                )}
                              </InputGroup>
                              {isSubFieldInvalid && (
                                <FieldError id={`cones-field-${index}-error`}>
                                  {subField.state.meta.errors.join(', ')}
                                </FieldError>
                              )}
                            </FieldContent>
                          </Field>
                        )
                      }}
                    </form.Field>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => field.pushValue(0)}
                    disabled={field.state.value.length >= 2}
                  >
                    Tambah Cone
                  </Button>
                </FieldGroup>

                <FieldDescription>
                  Jika ada pengurangan helai, klik tombol "Tambah Cone" lalu
                  tambahkan jumlah cones berikutnya.
                </FieldDescription>

                {isInvalid && (
                  <FieldError>{field.state.meta.errors.join(', ')}</FieldError>
                )}
              </FieldSet>
            )
          }}
        </form.Field>

        {/* Jumlah sections */}
        <form.Field name="sections">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched &&
              field.state.meta.errors &&
              field.state.meta.errors.length > 0

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="sections">Jumlah Sections *</FieldLabel>
                <FieldContent>
                  <InputGroup>
                    <InputGroupInput
                      id="sections"
                      type="number"
                      min="1"
                      max="100"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        const val = e.target.value
                        field.handleChange(val === '' ? 0 : Number(val))
                      }}
                      placeholder="Masukkan jumlah sections"
                    />
                    <InputGroupAddon align="inline-end">
                      <span className="text-sm">Sections</span>
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

        {/* Jumlah Pinggiran */}
        <form.Field name="fringe">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched &&
              field.state.meta.errors &&
              field.state.meta.errors.length > 0

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="fringe">Jumlah Pinggiran</FieldLabel>
                <FieldContent>
                  <InputGroup>
                    <InputGroupInput
                      id="fringe"
                      type="number"
                      min="0"
                      max="50"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        const val = e.target.value
                        field.handleChange(val === '' ? 0 : Number(val))
                      }}
                      placeholder="Masukkan jumlah pinggiran (opsional)"
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
        {/* Global Errors Display (Only shown if there are errors but they're not visible elsewhere) */}
        <form.Subscribe
          selector={(state) => ({
            errors: state.errors,
            fieldMeta: state.fieldMeta,
          })}
          children={(state: any) => {
            const allErrors = [...(state.errors || [])]
            // Only show errors that don't have a focused field counterpart showing it
            Object.values(state.fieldMeta || {}).forEach((meta: any) => {
              if (meta.errors && meta.errors.length > 0 && !meta.isTouched) {
                allErrors.push(...meta.errors)
              }
            })

            if (allErrors.length === 0) return null

            return (
              <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
                <p className="font-bold underline mb-1">
                  Cek kembali input anda:
                </p>
                <ul className="list-disc pl-5">
                  {allErrors.map((err: any, i) => (
                    <li key={i}>
                      {typeof err === 'string'
                        ? err
                        : err?.message || JSON.stringify(err)}
                    </li>
                  ))}
                </ul>
              </div>
            )
          }}
        />
      </FieldGroup>
    </form>
  )

  if (!showCard) {
    return (
      <>
        {formContent}
        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button
            type="submit"
            form="color-position-form"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending
              ? 'Menyimpan...'
              : mode === 'edit'
                ? 'Update'
                : 'Buat'}
          </Button>
        </div>
      </>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Detail Posisi Warna</CardTitle>
      </CardHeader>

      <CardContent>{formContent}</CardContent>

      <CardFooter className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          Reset
        </Button>
        <Button
          type="submit"
          form="color-position-form"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {createMutation.isPending || updateMutation.isPending
            ? 'Menyimpan...'
            : mode === 'edit'
              ? 'Update'
              : 'Buat'}
        </Button>
      </CardFooter>
    </Card>
  )
}
