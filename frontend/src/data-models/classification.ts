export type DailyClassificationField = {
  id: number,
  name: string,
  short: string,
  categories: DailyClassificationCategory[]
}

export type DailyClassificationCategory = {
  id: number,
  name: string,
  short: string,
  severities: DailyClassificationSeverity[]
}

export type DailyClassificationSeverity = {
  severity: number,
  questions: DailyClassificationOption[]
}

export type DailyClassificationOption = {
  id: number,
  name: string,
  description: string,
  selected: boolean,
  severity: number,
  short: string
}

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
  result: DailyClassificationResult
}

export type DailyClassificationResult = {
  category1: string,
  category2: string,
  minutes: number
}
