import { useCallback, useEffect, useState } from 'react'
import { apiURL } from '@/config'
import type { DailyClassification, DailyClassificationResult } from '@/data-models/classification'
import { getCookie } from '@/util/getCookie'

type QuestionUpdate = {
  id: number,
  selected: boolean
}

type UpdateType = {
  questionUpdates?: QuestionUpdate,
  isolationUpdate?: boolean
}

/**
 * Hook for loading a patient classification
 * @param stationId
 * @param patientId
 * @param date
 */
export const usePatientClassification = (stationId?: number, patientId?: number, date?: string) => {
  const [classification, setClassification] = useState<DailyClassification>({
    is_in_isolation: false,
    careServices: [],
    discharge_date: '',
    admission_date: '',
    a_index: 0,
    s_index: 0,
    barthel_index: 0,
    expanded_barthel_index: 0,
    care_time: 0,
    mini_mental_status: 0,
  })

  const loadResult = useCallback(async () => {
    if (!stationId || !patientId || !date) {
      return
    }

    try {
      const result = await (await fetch(`${apiURL}/calculate/${stationId}/${patientId}/${date}/`)).json()
      setClassification(prevState => ({
        ...prevState,
        result: result as DailyClassificationResult
      }))
    } catch (e) {
      console.error(e)
    }
  }, [stationId, patientId, date])

  const load = useCallback(async () => {
    if (!stationId || !patientId || !date) {
      return
    }
    try {
      const response = await (await fetch(`${apiURL}/questions/${stationId}/${patientId}/${date}/`)).json()
      setClassification(prevState => ({
        ...response as DailyClassification,
        result: prevState.result
      }))
      await loadResult()
    } catch (e) {
      console.error(e)
    }
  }, [date, loadResult, patientId, stationId])

  const update = useCallback(async (update: UpdateType) => {
    if (!stationId || !patientId || !date) {
      return
    }
    let body: Record<string, unknown> = {}
    if (update.questionUpdates !== undefined) {
      body = update.questionUpdates
    }
    if (update.isolationUpdate !== undefined) {
      body.is_in_isolation = update.isolationUpdate
    }

    console.log(body)
    try {
      const response = await (await fetch(`${apiURL}/questions/${stationId}/${patientId}/${date}/`, {
        method: 'PUT',
        // TODO fix the header in production
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken') ?? '',
        },
        body: JSON.stringify(body),
        credentials: 'include'
      })).json()
      setClassification(prevState => ({
        ...response as DailyClassification,
        result: prevState.result
      }))
      await loadResult()
    } catch (e) {
      console.error(e)
      await load()
    }
  }, [date, load, loadResult, patientId, stationId])

  useEffect(() => {
    load().then()
  }, [load])

  return {
    classification,
    options: classification.careServices,
    result: classification.result,
    reload: load,
    update
  }
}
