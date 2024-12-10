export const monthsList = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'] as const
export type Month = typeof monthsList[number]

export const weekDayList = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
export type WeekDay = typeof weekDayList[number]

export type Duration = {
  years?: number,
  months?: number,
  days?: number,
  hours?: number,
  minutes?: number,
  seconds?: number,
  milliseconds?: number
}
