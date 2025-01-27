import { useCallback, useEffect, useState } from 'react'
import { apiURL } from '@/config'
import type {
  DailyClassification, DailyClassificationField,
  DailyClassificationPatientInformation,
  DailyClassificationResult
} from '@/data-models/classification'
import { getCookie } from '@/util/getCookie'
import { formatDateBackend, parseDateString } from '@/util/date'

type QuestionUpdate = {
  id: number,
  selected: boolean
}

type UpdateType = {
  questionUpdate?: QuestionUpdate,
  isolationUpdate?: boolean
}

/**
 * Hook for loading a patient classification
 * @param stationId
 * @param patientId
 * @param date
 */
export const usePatientClassification = (stationId?: number, patientId?: number, date?: Date) => {
  const [classification, setClassification] = useState<DailyClassification>({
    date: date ?? new Date(),
    patientInformation: {
      dischargeDate: new Date(),
      admissionDate: new Date(),
      isInIsolation: false,
    },
    careServices: [],
  })
  const [hasMadeInitialLoad, setHasMadeInitialLoad] = useState<boolean>(false)
  const isValid = stationId !== undefined && patientId !== undefined && date !== undefined
  const backendDateString = formatDateBackend(date)

  const parseAsDailyClassification = useCallback((response: any): DailyClassification => {
    if (!date) {
      throw new Error('Invalid date')
    }
    const result: DailyClassificationResult | undefined = response['care_time'] === 0 ? undefined : {
      category1: response['a_index'],
      category2: response['s_index'],
      minutes: response['care_time'],
    }
    const patientInformation: DailyClassificationPatientInformation = {
      dischargeDate: parseDateString(response['discharge_date']),
      admissionDate: parseDateString(response['admission_date']),
      isInIsolation: response['is_in_isolation'],
    }
    const careServices: DailyClassificationField[] = response['careServices'] as DailyClassificationField[]
    return {
      date,
      careServices,
      patientInformation,
      result
    }
  }, [date])

  const load = useCallback(async () => {
    if (!isValid) {
      return
    }
    try {
      const response = await (await fetch(`${apiURL}/questions/${stationId}/${patientId}/${backendDateString}/`)).json()
      setClassification(parseAsDailyClassification(response))
    } catch (e) {
      console.error(e)
    }
  }, [backendDateString, isValid, parseAsDailyClassification, patientId, stationId])

  const calculate = useCallback(async () => {
    try {
      const result = await (await fetch(`${apiURL}/calculate/${stationId}/${patientId}/${backendDateString}/`)).json()
      const dailyClassificationResult: DailyClassificationResult | undefined = result['error'] === undefined ? result as DailyClassificationResult : undefined

      setClassification(prevState => ({
        ...prevState,
        result: dailyClassificationResult
      }))
    } catch (e) {
      console.error(e)
    }
  }, [backendDateString, patientId, stationId])

  const update = useCallback(async (update: UpdateType) => {
    if (!stationId || !patientId || !date) {
      return
    }
    let body: Record<string, unknown> = {}
    if (update.questionUpdate !== undefined) {
      body = update.questionUpdate
    }
    if (update.isolationUpdate !== undefined) {
      body.is_in_isolation = update.isolationUpdate
    }

    try {
      const response = await (await fetch(`${apiURL}/questions/${stationId}/${patientId}/${backendDateString}/`, {
        method: 'PUT',
        // TODO fix the header in production
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken') ?? '',
        },
        body: JSON.stringify(body),
        credentials: 'include'
      })).json()
      setClassification(parseAsDailyClassification(response))
      await calculate() // Needed to overwrite and create calculated results
    } catch (e) {
      console.error(e)
      await load()
    }
  }, [backendDateString, calculate, date, load, parseAsDailyClassification, patientId, stationId])

  const updateDirect = useCallback(async (category1: number, category2: number) => {
    try {
      const response = await (await fetch(`${apiURL}/calculate_direct/${stationId}/${patientId}/${backendDateString}/${category1}/${category2}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken') ?? '',
        },
        credentials: 'include'
      })).json()
      setClassification(prevState => ({
        ...prevState,
        result: {
          minutes: response['minutes'],
          // TODO backend should return this an int so now parsing should be needed
          category1: parseInt(response['category1']),
          category2: parseInt(response['category2']),
        }
      }))
      return true
    } catch (error) {
      console.error('Failed to add classification:', error)
      return false
    }
  }, [backendDateString, patientId, stationId])

  useEffect(() => {
    if (!hasMadeInitialLoad && isValid) {
      setHasMadeInitialLoad(true)
      load().then()
    }
  }, [load, hasMadeInitialLoad, isValid])

  return {
    classification,
    options: classification.careServices,
    result: classification.result,
    reload: load,
    addClassification: updateDirect,
    update
  }
}
