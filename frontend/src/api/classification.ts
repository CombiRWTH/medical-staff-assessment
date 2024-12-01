import { useCallback, useEffect, useState } from 'react'
import { apiURL } from '@/config'
import type { DailyClassification, DailyClassificationOption } from '@/data-models/classification'

export const usePatientClassification = (stationId?: number, patientId?: number, date?: string) => {
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

  const load = useCallback(async () => {
    if (!stationId || !patientId || !date) {
      return
    }
    try {
      // TODO fix this to the better format
      const response = await (await fetch(`${apiURL}/questions/${stationId}/${patientId}/${date}`)).json()
      console.log(response)
      setClassification(prevState => ({ ...prevState, options: response as DailyClassificationOption[] }))
    } catch (e) {
      console.error(e)
    }
  }, [date, patientId, stationId])

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
