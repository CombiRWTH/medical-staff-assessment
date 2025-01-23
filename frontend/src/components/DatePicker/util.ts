import type { TimeEvent, EventCalendarEntries } from './DatePicker'
import type { Duration, WeekDay } from '@/components/DatePicker/types'
import { weekDayList } from '@/components/DatePicker/types'
import { equalSizeGroups } from '@/util/array'

/**
 * A function to get the last day of a month for a given year and month
 */
export const getDaysInMonth = (year: number, month: number): number => {
  const lastDayOfMonth = new Date(year, month + 1, 0)
  return lastDayOfMonth.getDate()
}

/**
 * Changes a date by adding or subtracting a duration
 */
export const changeDuration = (date: Date, duration: Duration, isAdding?: boolean): Date => {
  const {
    years = 0,
    months = 0,
    days = 0,
    hours = 0,
    minutes = 0,
    seconds = 0,
    milliseconds = 0,
  } = duration

  // Check ranges
  if (years < 0) {
    console.error(`Range error years must be greater than 0: received ${years}`)
    return new Date(date)
  }
  if (months < 0 || months > 11) {
    console.error(`Range error month must be 0 <= month <= 11: received ${months}`)
    return new Date(date)
  }
  if (days < 0) {
    console.error(`Range error days must be greater than 0: received ${days}`)
    return new Date(date)
  }
  if (hours < 0 || hours > 23) {
    console.error(`Range error hours must be 0 <= hours <= 23: received ${hours}`)
    return new Date(date)
  }
  if (minutes < 0 || minutes > 59) {
    console.error(`Range error minutes must be 0 <= minutes <= 59: received ${minutes}`)
    return new Date(date)
  }
  if (seconds < 0 || seconds > 59) {
    console.error(`Range error seconds must be 0 <= seconds <= 59: received ${seconds}`)
    return new Date(date)
  }
  if (milliseconds < 0) {
    console.error(`Range error seconds must be greater than 0: received ${milliseconds}`)
    return new Date(date)
  }

  const multiplier = isAdding ? 1 : -1

  const newDate = new Date(date)

  newDate.setFullYear(newDate.getFullYear() + multiplier * years)

  newDate.setMonth(newDate.getMonth() + multiplier * months)

  newDate.setDate(newDate.getDate() + multiplier * days)

  newDate.setHours(newDate.getHours() + multiplier * hours)

  newDate.setMinutes(newDate.getMinutes() + multiplier * minutes)

  newDate.setSeconds(newDate.getSeconds() + multiplier * seconds)

  newDate.setMilliseconds(newDate.getMilliseconds() + multiplier * milliseconds)

  return newDate
}

/**
 * Add a duration to a date
 */
export const addDuration = (date: Date, duration: Duration): Date => {
  return changeDuration(date, duration, true)
}

/**
 * Subtract a duration to a date
 */
export const subtractDuration = (date: Date, duration: Duration): Date => {
  return changeDuration(date, duration, false)
}

/**
 * Calculates the duration between two dates
 */
export const getBetweenDuration = (startDate: Date, endDate: Date): Duration => {
  const durationInMilliseconds = endDate.getTime() - startDate.getTime()

  const millisecondsInSecond = 1000
  const millisecondsInMinute = 60 * millisecondsInSecond
  const millisecondsInHour = 60 * millisecondsInMinute
  const millisecondsInDay = 24 * millisecondsInHour
  const millisecondsInMonth = 30 * millisecondsInDay // Rough estimation, can be adjusted

  const years = Math.floor(durationInMilliseconds / (365.25 * millisecondsInDay))
  const months = Math.floor(durationInMilliseconds / millisecondsInMonth)
  const days = Math.floor(durationInMilliseconds / millisecondsInDay)
  const hours = Math.floor((durationInMilliseconds % millisecondsInDay) / millisecondsInHour)
  const seconds = Math.floor((durationInMilliseconds % millisecondsInHour) / millisecondsInSecond)
  const milliseconds = durationInMilliseconds % millisecondsInSecond

  return {
    years,
    months,
    days,
    hours,
    seconds,
    milliseconds,
  }
}

/** Compare two dates on the year, month, day */
export const equalDate = (date1: Date, date2: Date) => {
  return date1.getFullYear() === date2.getFullYear()
    && date1.getMonth() === date2.getMonth()
    && date1.getDate() === date2.getDate()
}

/**
 * Gets the weeks for a calendar month
 */
export const getWeeksForCalenderMonth = (date: Date, weekStart: WeekDay) => {
  const month = date.getMonth()
  const year = date.getFullYear()

  const dayList: Date[] = []
  let currentDate = new Date(year, month, 1) // Start of month
  const weekStartIndex = weekDayList.indexOf(weekStart)
  while (currentDate.getDay() !== weekStartIndex) {
    currentDate = subtractDuration(currentDate, { days: 1 })
  }

  while (currentDate.getMonth() !== (month + 1) % 12 || currentDate.getDay() !== weekStartIndex || dayList.length < 7 * 6) {
    const date = new Date(currentDate)
    date.setHours(date.getHours(), date.getMinutes()) // To make sure we are not overwriting the time
    dayList.push(date)
    currentDate = addDuration(currentDate, { days: 1 })
  }

  // weeks
  return equalSizeGroups(dayList, 7)
}

/** Returns the weekday for a date as a Weekday string */
export const dateToWeekDay = (date: Date) => {
  return weekDayList[date.getDay()]
}

/** Finds all events for a date based on the eventCalendar entries */
export const getEventsForDate = (date: Date = new Date(), timeTable: EventCalendarEntries = {}): TimeEvent[] => {
  const events: TimeEvent[] = []
  if (timeTable.events) {
    timeTable.events.forEach(event => {
      if (equalDate(event.date, date)) {
        events.push(event)
      }
    })
  }
  if (timeTable.dayChecker) {
    timeTable.dayChecker.forEach(dayChecker => {
      const event = dayChecker(date)
      if (event) {
        events.push(event)
      }
    })
  }
  return events
}
