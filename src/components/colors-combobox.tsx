import * as React from 'react'
import { cn } from '@/lib/utils'
import { useColor } from '@/features/colors/hooks/use-color'
import { Button } from './ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'

interface ColorsComboboxProps {
  value?: string | null
  fieldName?: string
  onChange?: (value: string) => void
}

export const ColorsCombobox = ({
  value = '',
  fieldName = 'colorName',
  onChange,
}: ColorsComboboxProps) => {
  const [popoverOpen, setPopoverOpen] = React.useState(false)
  const { data: colors, isLoading, error } = useColor()

  const [comboboxValue, setComboboxValue] = React.useState('')

  // Sync comboboxValue dengan prop value dan colors data
  React.useEffect(() => {
    if (!colors || colors.length === 0) {
      setComboboxValue('')
      return
    }

    if (!value) {
      setComboboxValue('')
      return
    }

    const foundById = colors.find((color) => color.id === value)
    if (foundById) {
      setComboboxValue(foundById.id)
      return
    }

    const foundBySlug = colors.find((color) => color.slug === value)
    if (foundBySlug) {
      setComboboxValue(foundBySlug.id)
      return
    }

    const foundByName = colors.find((color) => color.name === value)
    setComboboxValue(foundByName?.id || '')
  }, [colors, value])

  // Cari color object berdasarkan comboboxValue
  const selectedColor = React.useMemo(() => {
    return colors?.find((color) => color.id === comboboxValue)
  }, [colors, comboboxValue])

  if (error) {
    return (
      <Button variant="outline" className="w-full justify-between" disabled>
        Error memuat data
      </Button>
    )
  }

  return (
    <>
      <input type="hidden" name={fieldName} value={comboboxValue || ''} />
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={popoverOpen}
            className="w-full justify-between"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : selectedColor ? (
              selectedColor.name
            ) : (
              'Pilih Benang Warna'
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-full p-0"
          style={{ width: 'var(--radix-popover-trigger-width)' }}
        >
          <Command>
            <CommandInput placeholder="Cari benang warna ..." />
            <CommandList>
              <CommandEmpty>Data tidak ditemukan</CommandEmpty>
              <CommandGroup>
                {colors?.map((color) => (
                  <CommandItem
                    key={color.id}
                    value={color.id}
                    onSelect={(currentItem) => {
                      const newValue =
                        currentItem === comboboxValue ? '' : currentItem
                      setComboboxValue(newValue)
                      onChange?.(newValue)
                      setPopoverOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        comboboxValue === color.id
                          ? 'opacity-100'
                          : 'opacity-0',
                      )}
                    />
                    {color.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  )
}
