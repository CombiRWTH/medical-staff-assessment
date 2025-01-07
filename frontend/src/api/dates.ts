import { useCallback, useEffect, useState } from 'react'
import { apiURL } from '@/config'
import { parseDateString } from '@/util/date'

type DatesData = {
  dates: string[]
}

export const usePatientDatesAPI = (stationId?: number, patientId?: number) => {
  const [dates, setDates] = useState<Date[]>([])

  const load = useCallback(async () => {
    if (stationId === undefined || patientId === undefined) {
      setDates([])
      return
    }
    const response = await (await fetch(`${apiURL}/patient/dates/${patientId}/${stationId}`)).json()
    const dateData = response as DatesData

    // TODO parse classification date
    setDates(dateData.dates.map((data) => parseDateString(data)))
  }, [patientId, stationId])

  useEffect(() => {
    load().then()
  }, [load])

  return {
    dates,
    reload: load
  }
}
