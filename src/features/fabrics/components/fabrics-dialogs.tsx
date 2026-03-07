import * as React from 'react'
import { useForm } from '@tanstack/react-form'
import { useRouter } from '@tanstack/react-router'
import { useFabricsMutation } from '../hooks/use-fabric'
import { z } from 'zod'
import { fabricFormSchema } from '@/types/Fabric'

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

import { useFabricsContext } from './fabrics-provider'

import { XIcon } from 'lucide-react'

// Define validation schema
const formSchema = z.object({
  fabrics: z.array(fabricFormSchema),
})

// Infer type from schema
type FabricFormValues = z.infer<typeof formSchema>

export const FabricsDialogs = () => {
  const { open, setOpen, currentRow, setCurrentRow } = useFabricsContext()
  const { createMutation, updateMutation, isPending } = useFabricsMutation()
  const router = useRouter()

  const form = useForm({
    defaultValues: {
      fabrics: [
        {
          name: '',
          hasColor: false,
        },
      ],
    } as FabricFormValues,
    validators: {
      onSubmit: formSchema,
    },

    onSubmit: async ({ value }) => {
      if (open === 'update' && currentRow) {
        updateMutation.mutate(
          {
            id: currentRow.id,
            name: value.fabrics[0].name,
            hasColor: currentRow.hasColor,
          },
          { onSuccess: () => handleOpenChange(false) },
        )
      } else {
        createMutation.mutate(
          { fabrics: value.fabrics },
          { onSuccess: () => handleOpenChange(false) },
        )
      }

      await router.invalidate()
    },
  })

  // Update form values when dialog opens with currentRow
  React.useEffect(() => {
    if (open === 'update' && currentRow) {
      form.setFieldValue('fabrics', [{ name: currentRow.name }])
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

  // Detail Dialog - Read-only view
  if (open === 'detail' && currentRow) {
    return (
      <Dialog open={true} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Kain</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <span className="text-muted-foreground text-sm font-medium">
                Nama
              </span>
              <span className="col-span-2 text-sm">{currentRow.name}</span>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  let dialogTitle = ''
  if (open === 'create') {
    dialogTitle = 'Tambah Kain'
  } else if (open === 'update') {
    dialogTitle = 'Edit Kain'
  } else if (open === 'detail') {
    dialogTitle = 'Detail Kain'
  }

  return (
    <Dialog
      open={open === 'create' || open === 'update'}
      onOpenChange={handleOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        {(open === 'create' || open === 'update') && (
          <form
            id="fabrics-mutate-dialog"
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
          >
            <form.Field name="fabrics" mode="array">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <FieldSet className="gap-4">
                    {open === 'create' && (
                      <FieldDescription>
                        Maksimal bisa menambahkan 5 kain.
                      </FieldDescription>
                    )}

                    <FieldGroup className="gap-4">
                      {field.state.value.map((_, index) => (
                        <form.Field
                          key={index}
                          name={`fabrics[${index}].name`}
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
                                    />
                                    {field.state.value.length > 1 && (
                                      <InputGroupAddon align="inline-end">
                                        <InputGroupButton
                                          type="button"
                                          variant="ghost"
                                          size="icon-xs"
                                          onClick={() =>
                                            field.removeValue(index)
                                          }
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
                          Tambah Kain Lain
                        </Button>
                      )}
                    </FieldGroup>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
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
                    : 'Buat'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
