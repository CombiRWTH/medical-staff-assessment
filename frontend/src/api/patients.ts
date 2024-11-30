import { useCallback, useEffect, useState } from 'react'
import type { Patient } from '@/data-models/patient'
import { apiURL } from '@/config'

export const usePatientsAPI = (stationId?: number) => {
  const [patients, setPatients] = useState<Patient[]>([])

  const loadPatients = useCallback(async () => {
    if (stationId === undefined) {
      setPatients([])
      return
    }
    const response = await (await fetch(`${apiURL}/stations/${stationId}`)).json()
    // TODO parse classification date
    setPatients(response as Patient[])
  }, [stationId])

  useEffect(() => {
    loadPatients().then()
  }, [loadPatients])

  return {
    patients,
    reload: loadPatients
  }
}
