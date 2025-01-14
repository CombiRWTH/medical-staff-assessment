export type Patient = {
  id: number,
  name: string,
  lastClassification?: Date,
  missingClassificationsLastWeek?: Date[],
  currentBed?: string,
  currentRoom?: string
}
