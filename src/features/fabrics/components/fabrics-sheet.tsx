import * as React from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { useFabricsMutation, useFabricById } from '../hooks/use-fabric'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

import { useFabricsContext } from './fabrics-provider'
import { ColorsCombobox } from '@/components/colors-combobox'

const formSchema = z.object({
  name: z
    .string()
    .min(3, 'Nama kain minimal 3 karakter')
    .max(50, 'Nama kain maksimal 50 karakter')
    .trim(),
  hasColor: z.boolean().optional(),
  colorNote: z.string().optional(),
  colorName: z.string().optional(),
})
type FabricFormValues = z.infer<typeof formSchema>

export const FabricsSheet = () => {
  const { open, setOpen, currentRow, setCurrentRow } = useFabricsContext()
  const { createMutation, updateMutation, isPending } = useFabricsMutation()

  const form = useForm({
    defaultValues: {
      name: '',
      hasColor: false,
      colorNote: '',
      colorName: '',
    } as FabricFormValues,
    validators: {
      onSubmit: formSchema,
    },

    onSubmit: async ({ value }) => {
      if (open === 'update' && currentRow) {
        updateMutation.mutate(
          {
            id: currentRow.id,
            name: value.name,
            hasColor: value.hasColor,
            colorName: value.colorName,
            colorNote: value.colorNote,
          },
          { onSuccess: () => handleOpenChange(false) },
        )
      } else {
        createMutation.mutate(
          {
            name: value.name,
            hasColor: value.hasColor,
            colorName: value.colorName,
            colorNote: value.colorNote,
          },
          { onSuccess: () => handleOpenChange(false) },
        )
      }
    },
  })

  const { data: fullFabric } = useFabricById(currentRow?.id ?? '')

  // Update form values when dialog opens with fullFabric data
  React.useEffect(() => {
    if (open === 'update' && fullFabric) {
      form.setFieldValue('name', fullFabric.name)
      form.setFieldValue('hasColor', fullFabric.hasColor)

      const layout = fullFabric.colorLayout?.colorContent as {
        name?: string
        note?: string
      } | null

      if (layout) {
        form.setFieldValue('colorName', layout.name ?? '')
        form.setFieldValue('colorNote', layout.note ?? '')
      }
    } else if (open === 'create') {
      // Reset form for create mode
      form.reset()
    }
  }, [open, fullFabric, form])

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setOpen(null)
      setCurrentRow(null)
      form.reset()
    }
  }

  const sheetTitle = open === 'create' ? 'Tambah Kain' : 'Edit Kain'

  // Watch hasColor value for conditional rendering
  const [hasColorValue, setHasColorValue] = React.useState(false)

  React.useEffect(() => {
    const unsubscribe = form.store.subscribe(() => {
      setHasColorValue(form.getFieldValue('hasColor') ?? false)
    })
    return unsubscribe
  }, [form])

  return (
    <Sheet
      open={
        open === 'create' ||
        (open === 'update' && currentRow?.hasColor === true)
      }
      onOpenChange={handleOpenChange}
      modal={true}
    >
      <SheetContent
        side="right"
        onInteractOutside={(e) => {
          // If the target is the combobox content, don't prevent default
          if (
            (e.target as HTMLElement).closest('[data-slot="combobox-content"]')
          ) {
            e.preventDefault()
          }
        }}
        className="border-l border-border/30"
      >
        <SheetHeader>
          <SheetTitle>{sheetTitle}</SheetTitle>
        </SheetHeader>

        <form
          id="fabrics-mutate-sheet"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="space-y-6"
        >
          <div className="grid gap-4 px-4 py-6">
            <FieldGroup>
              <form.Field
                name="name"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Nama Kain</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Masukkan nama kain"
                        aria-invalid={isInvalid}
                        aria-describedby={
                          isInvalid ? `${field.name}-error` : undefined
                        }
                        type="text"
                      />
                      {isInvalid && (
                        <FieldError
                          id={`${field.name}-error`}
                          errors={field.state.meta.errors}
                        />
                      )}
                    </Field>
                  )
                }}
              />
            </FieldGroup>

            {/* Benang Warna Checkbox */}
            <FieldGroup>
              <form.Field
                name="hasColor"
                children={(field) => (
                  <Field>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={field.name}
                        checked={field.state.value}
                        onCheckedChange={(checked) =>
                          field.handleChange(checked === true)
                        }
                      />
                      <FieldLabel
                        htmlFor={field.name}
                        className="cursor-pointer"
                      >
                        Benang Warna
                      </FieldLabel>
                    </div>
                  </Field>
                )}
              />
            </FieldGroup>

            {/* Accordion for color details - shown when hasColor is checked */}
            {hasColorValue && (
              <Accordion type="single" collapsible defaultValue="color-details">
                <AccordionItem value="color-details">
                  <AccordionTrigger>Detail Benang Warna</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <form.Field
                      name="colorName"
                      children={(field) => (
                        <Field>
                          <FieldLabel htmlFor={field.name}>
                            Pilih Warna
                          </FieldLabel>
                          <ColorsCombobox value={field.state.value} />
                        </Field>
                      )}
                    />

                    <form.Field
                      name="colorNote"
                      children={(field) => (
                        <Field>
                          <FieldLabel htmlFor={field.name}>
                            Keterangan Warna
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value ?? ''}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="Masukkan keterangan warna"
                            type="text"
                          />
                        </Field>
                      )}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </div>

          <SheetFooter>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? 'Menyimpan...'
                : open === 'update'
                  ? 'Update'
                  : 'Buat'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Batal
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
