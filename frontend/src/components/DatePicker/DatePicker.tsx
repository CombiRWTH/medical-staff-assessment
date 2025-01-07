import type { HTMLAttributes } from 'react'
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { addDuration, equalDate, getEventsForDate, getWeeksForCalenderMonth, subtractDuration } from './util'
import type { WeekDay } from '@/components/DatePicker/types'
import { Grid } from '@/components/Grid'
import { noop } from '@/util/noop'
import { tailwindChoice, tailwindCombine } from '@/util/tailwind'

export type TimeEvent = {
  date: Date
}

export type EventCalendarEntries = {
  events?: TimeEvent[],
  dayChecker?: ((date: Date) => (TimeEvent | undefined))[]
}

export type DatePickerProps = HTMLAttributes<HTMLDivElement> & {
  yearMonth?: Date,
  eventList: EventCalendarEntries,
  markToday?: boolean,
  weekStart?: WeekDay,
  onDateClick?: (events: TimeEvent[], date: Date) => void,
  className?: string
}

/**
 * A component for showing days of a month with events
 */
export const DatePicker = ({
  yearMonth = new Date(),
  eventList,
  markToday = true,
  weekStart = 'monday',
  onDateClick = noop,
  className = '',
  ...restProps
}: DatePickerProps) => {
  const [date, setDate] = useState<Date>(yearMonth)
  const month = date.getMonth()
  const weeks = getWeeksForCalenderMonth(date, weekStart)
  const monthName = new Intl.DateTimeFormat('de-DE', { month: 'long' }).format(date)

  useEffect(() => {
    setDate(yearMonth)
  }, [yearMonth])

  return (
    <div className={tailwindCombine('flex flex-col gap-y-1 w-full select-none', className)} {...restProps}>
      <Grid colCount={7} className={tailwindCombine('text-center')}>
        {weeks[0].map((weekDay, index) => (
          <div key={index} className={tailwindCombine('font-semibold')}>
            {new Intl.DateTimeFormat('de-DE', { weekday: 'long' }).format(weekDay).substring(0, 2)}
          </div>
        ))}
      </Grid>
      {weeks.map((week, index) => (
        <Grid colCount={7} key={index} className={tailwindCombine('text-center')}>
          {week.map((date) => {
            const isToday = equalDate(new Date(), date)
            const eventsForDate = getEventsForDate(date, eventList)
            const color = 'primary'
            return (
              <div
                key={date.getDate()}
                className={tailwindCombine('flex flex-col justify-center cursor-pointer rounded-md hover:bg-primary/20 border-2 hover:border-primary/80 min-h-[50px]',
                  tailwindChoice({
                    'text-gray-500': date.getMonth() !== month,
                    'border-gray-700 hover:border-black-base': isToday && markToday,
                    [`bg-${color}/60 hover:!bg-${color}/70 border-${color}/80 hover:!border-${color} text-black`]: eventsForDate.length > 0,
                  }))}
                onClick={() => onDateClick(eventsForDate, date)}
              >
                {date.getDate()}
              </div>
            )
          })}
        </Grid>
      ))}
      <div className="flex flex-row items-center justify-center mt-2 gap-x-2">
        <ChevronLeft onClick={() => setDate(subtractDuration(date, { months: 1 }))}/>
        <span className="font-bold text-lg w-48 text-center">{`${monthName} ${date?.getFullYear()}`}</span>
        <ChevronRight onClick={() => setDate(addDuration(date, { months: 1 }))}/>
      </div>
      <div className="flex flex-row justify-center">
        <button onClick={() => setDate(new Date())} className="text-primary hover:text-primary/90">Zu heute springen</button>
      </div>
    </div>
  )
}
