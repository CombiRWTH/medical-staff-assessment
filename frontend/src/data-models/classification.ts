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
  a_index: number,
  s_index: number,
  admission_date: string,
  discharge_date: string,
  barthel_index: number,
  expanded_barthel_index: number,
  care_time: number,
  mini_mental_status: number,
  is_in_isolation: boolean,
  careServices: DailyClassificationField[],
  result?: DailyClassificationResult
}

/**
 * Data type for a classification result
 */
export type DailyClassificationResult = {
  category1: number,
  category2: number,
  minutes: number
}
