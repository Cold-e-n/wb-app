import * as React from 'react'
import { cn } from '@/lib/utils'
import { useFabric } from '@/features/fabrics/hooks/use-fabric'
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

interface FabricsComboboxProps {
  value?: string
  fieldName?: string
  onChange?: (value: string, colorLayoutId?: string) => void
}

export const FabricsCombobox = ({
  value = '',
  fieldName = 'fabricName',
  onChange,
}: FabricsComboboxProps) => {
  const [open, setOpen] = React.useState(false)
  const { data: fabrics, isLoading, error } = useFabric()
  const [comboboxValue, setComboboxValue] = React.useState('')

  // Sync comboboxValue dengan prop value dan colors data
  React.useEffect(() => {
    if (!fabrics || fabrics.length === 0) {
      setComboboxValue('')
      return
    }

    if (!value) {
      setComboboxValue('')
      return
    }

    const foundById = fabrics.find((fabric) => fabric.id === value)
    if (foundById) {
      setComboboxValue(foundById.id)
      return
    }

    const foundBySlug = fabrics.find((fabric) => fabric.slug === value)
    if (foundBySlug) {
      setComboboxValue(foundBySlug.id)
      return
    }

    const foundByName = fabrics.find((fabric) => fabric.name === value)
    setComboboxValue(foundByName?.id || '')
  }, [fabrics, value])

  // Cari color object berdasarkan comboboxValue
  const selectedFabric = React.useMemo(() => {
    return fabrics?.find((fabric) => fabric.id === comboboxValue)
  }, [fabrics, comboboxValue])

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
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : selectedFabric ? (
              selectedFabric.name
            ) : (
              'Pilih Kain'
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
            <CommandInput placeholder="Cari kain ..." />
            <CommandList>
              <CommandEmpty>Data tidak ditemukan</CommandEmpty>
              <CommandGroup>
                {fabrics?.map((fabric) => (
                  <CommandItem
                    key={fabric.id}
                    value={fabric.id}
                    onSelect={(currentItem) => {
                      const newValue =
                        currentItem === comboboxValue ? '' : currentItem
                      setComboboxValue(newValue)

                      // Find selected fabric to get colorLayoutId
                      const selected = fabrics?.find((f) => f.id === newValue)
                      onChange?.(newValue, selected?.colorLayoutId || undefined)

                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        comboboxValue === fabric.id
                          ? 'opacity-100'
                          : 'opacity-0',
                      )}
                    />
                    {fabric.name}
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
