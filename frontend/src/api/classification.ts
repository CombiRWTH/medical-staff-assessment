import { useCallback, useEffect, useState } from 'react'
import { apiURL } from '@/config'
import type { DailyClassification, DailyClassificationResult } from '@/data-models/classification'
import { getCookie } from '@/util/getCookie'

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
      console.log(result)
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

  const update = useCallback(async (id: number, selected: boolean) => {
    if (!stationId || !patientId || !date) {
      return
    }
    try {
      const response = await (await fetch(`${apiURL}/questions/${stationId}/${patientId}/${date}/`, {
        method: 'PUT',
        // TODO fix the header in production
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken') ?? '',
        },
        body: JSON.stringify({
          id,
          selected
        }),
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
