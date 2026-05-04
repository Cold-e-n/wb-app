import * as React from 'react'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
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
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ComboboxItem {
  /** Value yang disimpan dan dikembalikan via onChange */
  value: string
  /** Label yang ditampilkan di list dan trigger */
  label: string
  /** Data asli — bisa diakses di onSelect untuk kebutuhan tambahan */
  original?: unknown
}

interface BaseComboboxProps {
  value?: string
  fieldName?: string
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  onChange?: (value: string, item?: ComboboxItem) => void
}

interface StaticComboboxProps extends BaseComboboxProps {
  /** Data hardcode — gunakan ini untuk data statis */
  items: ComboboxItem[]
  isLoading?: never
  error?: never
}

interface AsyncComboboxProps extends BaseComboboxProps {
  /** Data dari API/hook — gunakan ini untuk data dinamis */
  items: ComboboxItem[] | undefined
  isLoading?: boolean
  error?: Error | null
}

type ComboboxProps = StaticComboboxProps | AsyncComboboxProps

// ─── Component ────────────────────────────────────────────────────────────────

export const Combobox = ({
  value = '',
  fieldName,
  placeholder = 'Pilih...',
  searchPlaceholder = 'Cari...',
  emptyText = 'Data tidak ditemukan',
  disabled = false,
  items,
  isLoading = false,
  error,
  onChange,
}: ComboboxProps) => {
  const [open, setOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState('')

  // Sync internal state dengan prop value
  React.useEffect(() => {
    if (!items || items.length === 0) {
      setSelectedValue('')
      return
    }

    if (!value) {
      setSelectedValue('')
      return
    }

    // Cari by value exact match
    const found = items.find((item) => item.value === value)
    setSelectedValue(found?.value ?? '')
  }, [items, value])

  const selectedItem = React.useMemo(
    () => items?.find((item) => item.value === selectedValue),
    [items, selectedValue],
  )

  const handleSelect = (currentValue: string) => {
    const newValue = currentValue === selectedValue ? '' : currentValue
    setSelectedValue(newValue)

    const item = items?.find((i) => i.value === newValue)
    onChange?.(newValue, item)

    setOpen(false)
  }

  if (error) {
    return (
      <Button variant="outline" className="w-full justify-between" disabled>
        Error memuat data
      </Button>
    )
  }

  return (
    <>
      {fieldName && (
        <input type="hidden" name={fieldName} value={selectedValue} />
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={isLoading || disabled}
          >
            {isLoading ? (
              <span className="flex items-center text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </span>
            ) : selectedItem ? (
              selectedItem.label
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="p-0"
          style={{ width: 'var(--radix-popover-trigger-width)' }}
        >
          <Command
            filter={(itemValue, search) => {
              const item = items?.find((i) => i.value === itemValue)
              if (!item) return 0
              return item.label.toLowerCase().includes(search.toLowerCase())
                ? 1
                : 0
            }}
          >
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {items?.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.value}
                    onSelect={handleSelect}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedValue === item.value
                          ? 'opacity-100'
                          : 'opacity-0',
                      )}
                    />
                    {item.label}
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
