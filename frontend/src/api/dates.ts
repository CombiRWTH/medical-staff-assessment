import { useCallback, useEffect, useState } from 'react'
import { apiURL } from '@/config'
import { parseDateString } from '@/util/date'

type PatientDateData = {
  date: Date,
  hasClassification: boolean
}

type DatesData = {
  dates: {
    date: string,
    hasClassification: boolean
  }[]
}

export const usePatientDatesAPI = (stationId?: number, patientId?: number) => {
  const [dates, setDates] = useState<PatientDateData[]>([])

  const load = useCallback(async () => {
    if (stationId === undefined || patientId === undefined) {
      setDates([])
      return
    }
    const response = await (await fetch(`${apiURL}/patient/dates/${patientId}/${stationId}`)).json()
    const dateData = response as DatesData
    setDates(dateData.dates.map((data) => ({
      date: parseDateString(data.date),
      hasClassification: data.hasClassification
    })))
  }, [patientId, stationId])

  useEffect(() => {
    load().then()
  }, [load])

  return {
    dates,
    reload: load
  }
}
