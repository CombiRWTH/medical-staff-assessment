import type { DailyClassificationResult } from '@/data-models/classification'

export type PatientLastClassification = DailyClassificationResult & {
  date: Date
}

/**
 * Data type for a patient
 */
export type Patient = {
  id: number,
  name: string,
  lastClassification?: PatientLastClassification,
  missingClassificationsLastWeek?: Date[],
  currentBed?: string,
  currentRoom?: string
}
