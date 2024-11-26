export type DailyClassificationOption = {
  id: number,
  field__name: string,
  field__short: string,
  category__name: string,
  name: string,
  description: string,
  selected: boolean,
  severity: number
}

export type DailyClassification = {
  id: string,
  patientId: string,
  date: Date,
  isInIsolation: boolean,
  isDayOfAdmission: boolean,
  isDayOfDischarge: boolean,
  options: DailyClassificationOption[],
  result: DailyClassificationResult
}

export type DailyClassificationResult = {
  category1: string,
  category2: string,
  minutes: number
}
