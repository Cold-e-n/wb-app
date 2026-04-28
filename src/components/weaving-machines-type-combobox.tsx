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

interface WeavingMachinesTypeComboboxProps {
  value?: string | null
  fieldName?: string
  onChange?: (value: string) => void
}

export const WeavingMachinesTypeCombobox = ({
  value = '',
  fieldName = 'machineType',
  onChange,
}: WeavingMachinesTypeComboboxProps) => {
  const [popoverOpen, setPopoverOpen] = React.useState(false)
  const [comboboxValue, setComboboxValue] = React.useState('')

  const data = [
    'ZA205(-60)',
    'ZA203(-60)',
    'ZAX-N',
    'ZAX-E',
    'ZAX-E(-60)',
    'ZAX-E(-90)',
    'ZAX',
    'ZAX-N(-90)',
    'ZAX(-90)',
    'PICANOL',
    'ZAX-9200i',
    'ZAX-9100',
  ] as const

  // Sync comboboxValue dengan prop value yang masuk
  React.useEffect(() => {
    if (!value) {
      setComboboxValue('')
      return
    }

    // Pastikan value yang masuk ada di dalam daftar data
    const found = data.find((item) => item === value)
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
            {comboboxValue ? comboboxValue : 'Pilih Tipe Mesin'}
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
            <CommandInput placeholder="Cari tipe mesin ..." />
            <CommandList>
              <CommandEmpty>Data tidak ditemukan</CommandEmpty>
              <CommandGroup>
                {data.map((machine) => (
                  <CommandItem
                    key={machine}
                    value={machine}
                    onSelect={(currentItem) => {
                      // Jika klik item yang sama, maka kosongkan (toggle)
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
                        comboboxValue === machine ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {machine}
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
