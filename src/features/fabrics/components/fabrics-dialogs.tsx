import * as React from 'react'
import { useForm } from '@tanstack/react-form'
import { useRouter } from '@tanstack/react-router'
import { useFabricsMutation } from '../hooks/use-fabric'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Field, FieldContent, FieldError } from '@/components/ui/field'
import { InputGroup, InputGroupInput } from '@/components/ui/input-group'

import { useFabricsContext } from './fabrics-provider'

// Define validation schema
const formSchema = z.object({
  name: z
    .string()
    .min(3, 'Nama kain minimal 3 karakter')
    .max(50, 'Nama kain maksimal 50 karakter')
    .trim(),
})

// Infer type from schema
type FabricFormValues = z.infer<typeof formSchema>

export const FabricsDialogs = () => {
  const router = useRouter()

  const { open, setOpen, currentRow, setCurrentRow } = useFabricsContext()
  const { createMutation, updateMutation, isPending } = useFabricsMutation()

  const form = useForm({
    defaultValues: {
      name: '',
    } as FabricFormValues,
    validators: {
      onSubmit: formSchema,
    },

    onSubmit: async ({ value }) => {
      if (open === 'update' && currentRow) {
        updateMutation.mutate(
          { id: currentRow.id, name: value.name },
          { onSuccess: () => handleOpenChange(false) },
        )
      } else {
        createMutation.mutate(
          { name: value.name },
          { onSuccess: () => handleOpenChange(false) },
        )
      }

      await router.invalidate()
    },
  })

  // Update form values when dialog opens with currentRow
  React.useEffect(() => {
    if (open === 'update' && currentRow) {
      form.setFieldValue('name', currentRow.name)
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
            <form.Field
              name="name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field orientation="horizontal" data-invalid={isInvalid}>
                    <label htmlFor={field.name} className="sr-only">
                      Nama Kain
                    </label>
                    <FieldContent>
                      <InputGroup>
                        <InputGroupInput
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          aria-describedby={
                            isInvalid ? `${field.name}-error` : undefined
                          }
                          type="text"
                          autoComplete="off"
                          placeholder={`Nama kain`}
                        />
                      </InputGroup>
                      {isInvalid && (
                        <FieldError
                          id={`${field.name}-error`}
                          errors={field.state.meta.errors}
                        />
                      )}
                    </FieldContent>
                  </Field>
                )
              }}
            />

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
