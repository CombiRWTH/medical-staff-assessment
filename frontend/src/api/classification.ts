import { useCallback, useEffect, useState } from 'react'
import { baseURL } from '@/config'
import type { DailyClassification, DailyClassificationOption } from '@/data-models/classification'

export const usePatientClassification = (patientId: string) => {
  const [classification, setClassification] = useState<DailyClassification>({
    id: 'daily-classification-001',
    patientId: 'patient-12345',
    date: new Date('2024-11-25'),
    isInIsolation: false,
    isDayOfAdmission: true,
    isDayOfDischarge: false,
    options: [],
    result: {
      category1: 'A1',
      category2: 'S2',
      minutes: 120,
    }
  })

  patientId = '1' // TODO this is should be your patient id

  const load = useCallback(async () => {
    const options: DailyClassificationOption[] = await (await fetch(`${baseURL}/questions/${patientId}`)).json()
    setClassification(prevState => ({ ...prevState, options }))
  }, [patientId])

  useEffect(() => {
    load().then()
  }, [load])

  return {
    classification,
    options: classification.options,
    result: classification.result,
    reload: load
  }
}
