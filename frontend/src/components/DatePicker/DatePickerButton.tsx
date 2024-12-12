import React, { useEffect, useState } from 'react'
import { noop } from '@/util/noop'
import type { DatePickerProps } from '@/components/DatePicker/DatePicker'
import { DatePicker } from '@/components/DatePicker/DatePicker'
import { formatDateVisual } from '@/util/date'
import { tailwindCombine } from '@/util/tailwind'

export type DatePickerButtonProps = Omit<DatePickerProps, 'yearMonth'> & {
  date: Date
}

/**
 * A component for showing days of a month with events
 */
export const DatePickerButton = ({
  date = new Date(),
  onDateClick = noop,
  className = '',
  ...restProps
}: DatePickerButtonProps) => {
  const [currentDate, setCurrentDate] = useState<Date>(date)
  const [isOpen, setIsOpen] = useState<boolean>(false)

  useEffect(() => { setCurrentDate(date) }, [date])

  const triangleSize = 6
  return (
    <div className={tailwindCombine('relative', className)}>
      <button onClick={() => setIsOpen(!isOpen)} >
        <span className="font-bold text-3xl">{formatDateVisual(currentDate)}</span>
      </button>
      {isOpen && (
        <div
          className="absolute z-50 bg-container px-3 py-2 rounded-xl shadow-lg top-full left-1/2 -translate-x-1/2 mt-2"
          style={{ width: '600px' }}>
          <DatePicker
            yearMonth={date}
            {...restProps}
            onDateClick={(events, selectedDate) => {
              setCurrentDate(selectedDate)
              setIsOpen(false)
              onDateClick(events, selectedDate)
            }}
          />
          <div
            className="absolute w-0 h-0 z-10 bottom-full left-1/2 -translate-x-1/2 border-b-container border-l-transparent border-r-transparent"
            style={{ borderWidth: `0 ${triangleSize}px ${triangleSize}px ${triangleSize}px` }}
          />
        </div>
      )}
    </div>
  )
}
