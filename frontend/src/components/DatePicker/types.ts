export const monthsList = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'] as const
/** A string enum for months */
export type Month = typeof monthsList[number]

export const weekDayList = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
/** A string enum for days of a week */
export type WeekDay = typeof weekDayList[number]

/** A data type for a duration */
export type Duration = {
  years?: number,
  months?: number,
  days?: number,
  hours?: number,
  minutes?: number,
  seconds?: number,
  milliseconds?: number
}
