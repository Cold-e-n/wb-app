import * as React from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { useColorsMutation } from '../hooks/use-color'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldSet,
} from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'

import { useColorsContext } from './colors-provider'

import { XIcon } from 'lucide-react'

// Define validation schema
const formSchema = z.object({
  colors: z
    .array(
      z.object({
        name: z
          .string()
          .min(3, 'Nama untuk Benang Warna tidak boleh kurang dari 3 karakter')
          .max(50, 'Nama benang warna maksimal 50 karakter')
          .trim(),
      }),
    )
    .min(1, 'Minimal harus ada 1 warna')
    .max(5, 'Maksimal 5 warna'),
})

// Infer type from schema
type ColorFormValues = z.infer<typeof formSchema>

export const ColorsDialogs = () => {
  const { open, setOpen, currentRow, setCurrentRow } = useColorsContext()
  const { createMutation, updateMutation, isPending } = useColorsMutation()

  const form = useForm({
    defaultValues: {
      colors: [{ name: '' }],
    } as ColorFormValues,
    validators: {
      onSubmit: formSchema,
    },

    onSubmit: async ({ value }) => {
      if (open === 'update' && currentRow) {
        updateMutation.mutate(
          { id: currentRow.id, name: value.colors[0].name },
          { onSuccess: () => handleOpenChange(false) },
        )
      } else {
        createMutation.mutate(
          { colors: value.colors },
          { onSuccess: () => handleOpenChange(false) },
        )
      }
    },
  })

  // Update form values when dialog opens with currentRow
  React.useEffect(() => {
    if (open === 'update' && currentRow) {
      form.setFieldValue('colors', [{ name: currentRow.name }])
    } else if (open === 'create') {
      // Reset form for create mode
      form.reset()
    }
  }, [open, currentRow?.id]) // Only track ID to avoid unnecessary re-renders

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setOpen(null)
      setCurrentRow(null)
      form.reset()
    }
  }

  const dialogTitle =
    open === 'update' ? 'Edit Benang Warna' : 'Tambah Benang Warna'

  return (
    <Dialog
      open={open === 'create' || open === 'update'}
      onOpenChange={handleOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>

        <form
          id="colors-mutate-dialog"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <form.Field name="colors" mode="array">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <FieldSet className="gap-4">
                  {open === 'create' && (
                    <FieldDescription>
                      Maksimal bisa menambahkan 5 warna.
                    </FieldDescription>
                  )}

                  <FieldGroup className="gap-4">
                    {field.state.value.map((_, index) => (
                      <form.Field
                        key={index}
                        name={`colors[${index}].name`}
                        children={(subField) => {
                          const isSubFieldInvalid =
                            subField.state.meta.isTouched &&
                            !subField.state.meta.isValid
                          return (
                            <Field
                              orientation="horizontal"
                              data-invalid={isSubFieldInvalid}
                            >
                              <label
                                htmlFor={`colors-field-${index}`}
                                className="sr-only"
                              >
                                Nama Warna {index + 1}
                              </label>
                              <FieldContent>
                                <InputGroup>
                                  <InputGroupInput
                                    id={`colors-field-${index}`}
                                    name={subField.name}
                                    value={subField.state.value}
                                    onBlur={subField.handleBlur}
                                    onChange={(e) =>
                                      subField.handleChange(e.target.value)
                                    }
                                    aria-invalid={isSubFieldInvalid}
                                    aria-describedby={
                                      isSubFieldInvalid
                                        ? `colors-field-${index}-error`
                                        : undefined
                                    }
                                    type="text"
                                    autoComplete="off"
                                    placeholder={`ex: 20/2 Green, 20/2 Black, etc.`}
                                  />
                                  {field.state.value.length > 1 && (
                                    <InputGroupAddon align="inline-end">
                                      <InputGroupButton
                                        type="button"
                                        variant="ghost"
                                        size="icon-xs"
                                        onClick={() => field.removeValue(index)}
                                        aria-label={`Hapus warna ${index + 1}`}
                                      >
                                        <XIcon />
                                      </InputGroupButton>
                                    </InputGroupAddon>
                                  )}
                                </InputGroup>
                                {isSubFieldInvalid && (
                                  <FieldError
                                    id={`colors-field-${index}-error`}
                                    errors={subField.state.meta.errors}
                                  />
                                )}
                              </FieldContent>
                            </Field>
                          )
                        }}
                      />
                    ))}
                    {open === 'create' && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => field.pushValue({ name: '' })}
                        disabled={field.state.value.length >= 5}
                      >
                        Tambah Warna Lain
                      </Button>
                    )}
                  </FieldGroup>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </FieldSet>
              )
            }}
          </form.Field>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? 'Menyimpan...'
                : open === 'update'
                  ? 'Update'
                  : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
