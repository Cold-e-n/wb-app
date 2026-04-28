import * as React from 'react'
import { cn } from '@/lib/utils'

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
import { Check, ChevronsUpDown } from 'lucide-react'

interface WeavingMachinesWidthComboboxProps {
  value?: number | null
  fieldName?: string
  onChange?: (value: number) => void
}

export const WeavingMachinesWidthCombobox = ({
  value,
  fieldName = 'machineWidth',
  onChange,
}: WeavingMachinesWidthComboboxProps) => {
  const [popoverOpen, setPopoverOpen] = React.useState(false)
  const [comboboxValue, setComboboxValue] = React.useState('')

  const data = ['230', '250', '280', '330', '360', '380', '390'] as const

  // Sync comboboxValue dengan prop value yang masuk
  React.useEffect(() => {
    if (value === undefined || value === null) {
      setComboboxValue('')
      return
    }

    // Pastikan value yang masuk ada di dalam daftar data
    const found = data.find((item) => item === String(value))
    setComboboxValue(found || '')
  }, [value])

  return (
    <>
      {/* Hidden input untuk keperluan form submission (TanStack Start/Server Actions) */}
      <input type="hidden" name={fieldName} value={comboboxValue || ''} />

      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={popoverOpen}
            className="w-full justify-between"
          >
            {comboboxValue ? comboboxValue : 'Pilih Lebar Mesin'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-full p-0"
          // Menyesuaikan lebar popover dengan lebar button pemicunya
          style={{ width: 'var(--radix-popover-trigger-width)' }}
        >
          <Command>
            <CommandInput placeholder="Cari lebar mesin ..." />
            <CommandList>
              <CommandEmpty>Data tidak ditemukan</CommandEmpty>
              <CommandGroup>
                {data.map((machineWidth) => (
                  <CommandItem
                    key={machineWidth}
                    value={machineWidth}
                    onSelect={(currentItem) => {
                      // Jika klik item yang sama, maka kosongkan (toggle)
                      const isSame = currentItem === comboboxValue
                      const newValueString = isSame ? '' : currentItem

                      setComboboxValue(newValueString)

                      // Konversi string kembali ke number saat memanggil onChange
                      if (onChange) {
                        onChange(Number(newValueString))
                      }

                      setPopoverOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        comboboxValue === machineWidth
                          ? 'opacity-100'
                          : 'opacity-0',
                      )}
                    />
                    {machineWidth}
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
