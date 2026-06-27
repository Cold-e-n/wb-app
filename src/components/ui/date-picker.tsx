'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format, parse, isValid } from 'date-fns'

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  id?: string
}

export const DatePicker = ({
  value: externalValue,
  onChange,
  id = 'date-picker-input',
}: DatePickerProps) => {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [month, setMonth] = useState<Date | undefined>(undefined)
  const [inputValue, setInputValue] = useState('')

  // Helper untuk memformat Date Object ke string '22-Jun-26'
  // Secara default format ini menggunakan bahasa Inggris (Jan, Feb, Mar, May, Jun, dsb)
  const formatDateStr = (d: Date | undefined) => {
    if (!d) return ''
    return format(d, 'dd-MMM-yy')
  }

  // Efek untuk sinkronisasi jika ada nilai awal dari luar (misal: initialData / state TanStack)
  useEffect(() => {
    if (externalValue) {
      const d = new Date(externalValue)
      if (isValid(d)) {
        setDate(d)
        setMonth(d)
        setInputValue(formatDateStr(d))
        return
      }
    }

    // Tidak ada nilai dari luar -> biarkan kosong/null, jangan auto-fill ke hari ini
    setDate(undefined)
    setInputValue('')
  }, [externalValue])

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="relative flex gap-2">
        <Input
          id={id}
          value={inputValue}
          placeholder="Pilih tanggal"
          className="bg-background pr-10"
          onChange={(e) => {
            const val = e.target.value
            setInputValue(val)

            // Parse teks '22-Jun-26' kembali menjadi Date Object asli
            const parsedDate = parse(val, 'dd-MMM-yy', new Date())

            if (isValid(parsedDate)) {
              setDate(parsedDate)
              setMonth(parsedDate)
              onChange?.(parsedDate)
            } else if (val === '') {
              setDate(undefined)
              onChange?.(undefined)
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <CalendarIcon className="h-4 w-4" />
              <span className="sr-only">Pick a date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="end"
            alignOffset={-8}
            sideOffset={10}
          >
            <Calendar
              mode="single"
              selected={date}
              month={month}
              onMonthChange={setMonth}
              onSelect={(selectedDate) => {
                if (selectedDate) {
                  setDate(selectedDate)
                  setInputValue(formatDateStr(selectedDate))
                  onChange?.(selectedDate)
                  setOpen(false)
                }
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
