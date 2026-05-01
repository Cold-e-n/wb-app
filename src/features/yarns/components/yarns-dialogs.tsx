import * as React from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { XIcon } from 'lucide-react'
import { useYarnsMutation } from '../hooks/use-yarn'

import { useYarnsContext } from './yarns-provider'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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

// Define validation schema
const formSchema = z.object({
  yarns: z
    .array(
      z.object({
        name: z
          .string()
          .min(3, 'Nama untuk Benang tidak boleh kurang dari 3 karakter')
          .max(50, 'Nama benang maksimal 50 karakter')
          .trim(),
      }),
    )
    .min(1, 'Minimal harus ada 1 benang')
    .max(5, 'Maksimal 5 benang'),
})

export const YarnsDialogs = () => {
  const { open, setOpen, currentRow, setCurrentRow } = useYarnsContext()
  const { createMutation, updateMutation, isPending } = useYarnsMutation()

  const form = useForm({
    defaultValues: {
      yarns: [{ name: '' }],
    },
    validators: {
      onSubmit: formSchema,
    },

    onSubmit: async ({ value }) => {
      if (open === 'update' && currentRow) {
        updateMutation.mutate(
          { id: currentRow.id, name: value.yarns[0].name },
          { onSuccess: () => handleOpenChange(false) },
        )
      } else {
        createMutation.mutate(
          { yarns: value.yarns },
          { onSuccess: () => handleOpenChange(false) },
        )
      }
    },
  })

  // Update form values when dialog opens with currentRow
  React.useEffect(() => {
    if (open === 'update' && currentRow) {
      form.setFieldValue('yarns', [{ name: currentRow.name }])
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
    open === 'update' ? 'Edit Benang' : 'Tambah Benang'

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
          id="yarns-mutate-dialog"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <form.Field name="yarns" mode="array">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <FieldSet className="gap-4">
                  {open === 'create' && (
                    <FieldDescription>
                      Maksimal bisa menambahkan 5 benang.
                    </FieldDescription>
                  )}

                  <FieldGroup className="gap-4">
                    {field.state.value.map((_, index) => (
                      <form.Field
                        key={index}
                        name={`yarns[${index}].name`}
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
                                htmlFor={`yarns-field-${index}`}
                                className="sr-only"
                              >
                                Nama Benang {index + 1}
                              </label>
                              <FieldContent>
                                <InputGroup>
                                  <InputGroupInput
                                    id={`yarns-field-${index}`}
                                    name={subField.name}
                                    value={subField.state.value}
                                    onBlur={subField.handleBlur}
                                    onChange={(e) =>
                                      subField.handleChange(e.target.value)
                                    }
                                    aria-invalid={isSubFieldInvalid}
                                    aria-describedby={
                                      isSubFieldInvalid
                                        ? `yarns-field-${index}-error`
                                        : undefined
                                    }
                                    type="text"
                                    autoComplete="off"
                                    placeholder={`ex: 20/2 Cotton`}
                                  />
                                  {field.state.value.length > 1 && (
                                    <InputGroupAddon align="inline-end">
                                      <InputGroupButton
                                        type="button"
                                        variant="ghost"
                                        size="icon-xs"
                                        onClick={() => field.removeValue(index)}
                                        aria-label={`Hapus benang ${index + 1}`}
                                      >
                                        <XIcon />
                                      </InputGroupButton>
                                    </InputGroupAddon>
                                  )}
                                </InputGroup>
                                {isSubFieldInvalid && (
                                  <FieldError
                                    id={`yarns-field-${index}-error`}
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
                        Tambah Benang Lain
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
