import { useCallback, useEffect, useState } from 'react'
import type { Patient } from '@/data-models/patient'
import { apiURL } from '@/config'
import { parseDateString } from '@/util/date'

export const usePatientsAPI = (stationId?: number) => {
  const [patients, setPatients] = useState<Patient[]>([])

  const loadPatients = useCallback(async () => {
    if (stationId === undefined) {
      setPatients([])
      return
    }
    const response: never[] = await (await fetch(`${apiURL}/stations/${stationId}`)).json()
    const patients: Patient[] = []
    response.forEach(value => {
      patients.push({
        id: value['id'],
        name: value['name'],
        currentBed: value['currentBed'] ?? undefined,
        currentRoom: value['currentRoom'] ?? undefined,
        lastClassification: value['lastClassification'] !== null ? ({
          date: parseDateString(value['lastClassification']['date']),
          category1: value['lastClassification']['a_index'],
          category2: value['lastClassification']['s_index'],
          minutes: value['lastClassification']['minutes'],
        }) : undefined,
        missingClassificationsLastWeek: ((value['missing_classifications_last_week'] ?? []) as string[]).map(parseDateString),
      })
    })
    setPatients(patients)
  }, [stationId])

  useEffect(() => {
    loadPatients().then()
  }, [loadPatients])

  return {
    patients,
    reload: loadPatients
  }
}
