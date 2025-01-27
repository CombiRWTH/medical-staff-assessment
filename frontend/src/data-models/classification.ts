/**
 * The field of classifications, either general or specialized care
 */
export type DailyClassificationField = {
  id: number,
  name: string,
  short: string,
  categories: DailyClassificationCategory[]
}

/**
 * The different categories within a field of care
 */
export type DailyClassificationCategory = {
  id: number,
  name: string,
  short: string,
  severities: DailyClassificationSeverity[]
}

/**
 * The different severity categories in a category
 */
export type DailyClassificationSeverity = {
  severity: number,
  questions: DailyClassificationOption[]
}

/**
 * A single selectable option of a classification
 */
export type DailyClassificationOption = {
  id: number,
  name: string,
  description: string,
  selected: boolean,
  severity: number,
  short: string
}

/**
 * Data type for a classification
 */
export type DailyClassification = {
  date: Date,
  careServices: DailyClassificationField[],
  patientInformation: DailyClassificationPatientInformation,
  result?: DailyClassificationResult
}

export type DailyClassificationPatientInformation = {
  isInIsolation: boolean,
  admissionDate: Date,
  dischargeDate: Date
}

/**
 * Data type for a classification result
 */
export type DailyClassificationResult = {
  category1: number,
  category2: number,
  minutes: number
}
