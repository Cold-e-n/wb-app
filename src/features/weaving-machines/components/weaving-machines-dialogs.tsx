import * as React from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { incrementMachineName } from '@/lib/utils'
import { useWeavingMachinesContext } from './weaving-machines-provider'
import {
  useWeavingMachineMutation,
  useWeavingMachine,
} from '../hooks/use-weaving-machine'

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
  FieldLabel,
  FieldSet,
} from '@/components/ui/field'
import { InputGroupInput } from '@/components/ui/input-group'
import { WeavingMachinesTypeCombobox } from '@/components/weaving-machines-type-combobox'
import { WeavingMachinesWidthCombobox } from '@/components/weaving-machines-width-combobox'

import { XIcon } from 'lucide-react'

// Define validation schema
const formSchema = z.object({
  WeavingMachines: z
    .array(
      z.object({
        name: z
          .string()
          .min(1, 'Nama untuk Mesin Weaving tidak boleh kurang dari 1 karakter')
          .max(50, 'Nama mesin weaving maksimal 50 karakter')
          .regex(
            /.*?\d+$/,
            'Nama mesin harus diakhiri dengan angka (contoh: A1 atau B54)',
          )
          .trim(),
        width: z.number().min(230, 'Lebar mesin weaving minimal 230'),
        type: z.string().min(1, 'Tipe mesin weaving tidak boleh kosong'),
      }),
    )
    .min(1, 'Minimal harus ada 1 mesin')
    .max(5, 'Maksimal 5 mesin'),
})

export const WeavingMachinesDialogs = () => {
  const { open, setOpen, currentRow, setCurrentRow } =
    useWeavingMachinesContext()
  const { createMutation, updateMutation, isPending } =
    useWeavingMachineMutation()

  const form = useForm({
    defaultValues: {
      WeavingMachines: [{ name: '', width: 230, type: '' }],
    },
    validators: {
      onSubmit: formSchema,
    },

    onSubmit: async ({ value }) => {
      if (open === 'update' && currentRow) {
        updateMutation.mutate(
          {
            id: currentRow.id,
            name: value.WeavingMachines[0].name,
            width: value.WeavingMachines[0].width,
            type: value.WeavingMachines[0].type,
          },
          { onSuccess: () => handleOpenChange(false) },
        )
      } else {
        createMutation.mutate(
          { WeavingMachines: value.WeavingMachines },
          { onSuccess: () => handleOpenChange(false) },
        )
      }
    },
  })

  // Update form values when dialog opens with currentRow
  React.useEffect(() => {
    if (open === 'update' && currentRow) {
      form.setFieldValue('WeavingMachines', [
        {
          name: currentRow.name,
          width: currentRow.width,
          type: currentRow.type,
        },
      ])
    } else if (open === 'create') {
      // Reset form for create mode
      form.reset()
    }
  }, [open, currentRow?.id])

  const { data: existingMachines } = useWeavingMachine()

  React.useEffect(() => {
    if (open === 'update' && currentRow) {
      // ... logic update tetap sama
    } else if (open === 'create') {
      form.reset()

      // Cari mesin terakhir dari database (API sudah urut ASC, ambil yang terakhir)
      const lastMachine = existingMachines?.[existingMachines.length - 1]
      const nextName = lastMachine ? incrementMachineName(lastMachine.name) : ''

      form.setFieldValue('WeavingMachines', [
        {
          name: nextName,
          width: lastMachine?.width || 230,
          type: lastMachine?.type || '',
        },
      ])
    }
  }, [open, currentRow?.id, existingMachines])

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setOpen(null)
      setCurrentRow(null)
      form.reset()
    }
  }

  const dialogTitle =
    open === 'update' ? 'Edit Mesin Weaving' : 'Tambah Mesin Weaving'

  return (
    <Dialog
      open={open === 'create' || open === 'update'}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>

        <form
          id="weaving-machines-mutate-dialog"
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <form.Field name="WeavingMachines" mode="array">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <FieldSet className="gap-6">
                  {open === 'create' && (
                    <FieldDescription>
                      Maksimal bisa menambahkan 5 mesin.
                    </FieldDescription>
                  )}

                  <FieldGroup className="gap-8">
                    {field.state.value.map((_, index) => (
                      <div
                        key={index}
                        className="relative space-y-4 rounded-lg border p-4"
                      >
                        {field.state.value.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="absolute -right-2 -top-2 rounded-full bg-background border"
                            onClick={() => field.removeValue(index)}
                          >
                            <XIcon className="h-3 w-3" />
                          </Button>
                        )}

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <form.Field
                            name={`WeavingMachines[${index}].name`}
                            children={(subField) => (
                              <Field>
                                <label className="text-sm font-medium">
                                  Nama Mesin
                                </label>
                                <FieldContent>
                                  <InputGroupInput
                                    value={subField.state.value}
                                    onBlur={subField.handleBlur}
                                    onChange={(e) =>
                                      subField.handleChange(e.target.value)
                                    }
                                    placeholder="Nama Mesin"
                                  />
                                  {subField.state.meta.isTouched && (
                                    <FieldError
                                      errors={subField.state.meta.errors}
                                    />
                                  )}
                                </FieldContent>
                              </Field>
                            )}
                          />

                          <form.Field
                            name={`WeavingMachines[${index}].width`}
                            children={(subField) => (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={subField.name}>
                                  Tipe
                                </FieldLabel>
                                <WeavingMachinesWidthCombobox
                                  fieldName={subField.name}
                                  value={subField.state.value}
                                  onChange={(value) =>
                                    subField.handleChange(Number(value))
                                  }
                                />
                                {isInvalid && (
                                  <FieldError>
                                    {subField.state.meta.errors.join(', ')}
                                  </FieldError>
                                )}
                              </Field>
                            )}
                          />

                          <form.Field
                            name={`WeavingMachines[${index}].type`}
                            children={(subField) => (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={subField.name}>
                                  Tipe
                                </FieldLabel>
                                <WeavingMachinesTypeCombobox
                                  fieldName={subField.name}
                                  value={subField.state.value}
                                  onChange={(value) =>
                                    subField.handleChange(value)
                                  }
                                />
                                {isInvalid && (
                                  <FieldError>
                                    {subField.state.meta.errors.join(', ')}
                                  </FieldError>
                                )}
                              </Field>
                            )}
                          />
                        </div>
                      </div>
                    ))}

                    {open === 'create' && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentValues =
                            form.getFieldValue('WeavingMachines')
                          const lastEntry =
                            currentValues[currentValues.length - 1]

                          const nextName = lastEntry?.name
                            ? incrementMachineName(lastEntry.name)
                            : ''

                          field.pushValue({
                            name: nextName,
                            width: lastEntry?.width,
                            type: lastEntry?.type,
                          })
                        }}
                        disabled={field.state.value.length >= 5}
                      >
                        Tambah Mesin Lain
                      </Button>
                    )}
                  </FieldGroup>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </FieldSet>
              )
            }}
          </form.Field>

          <DialogFooter>
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
