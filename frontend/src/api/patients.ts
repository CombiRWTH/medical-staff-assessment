import { useCallback, useEffect, useState } from 'react'
import type { Patient } from '@/data-models/patient'

// TODO use something like react query
export const usePatientsAPI = (_?: string) => {
  const [patients, setPatients] = useState<Patient[]>([])

  const loadPatients = useCallback(async () => {
    setPatients(Array.from({ length: 10 }, (_, i) => i + 1).map<Patient>(value => ({
      id: `${value}`,
      name: `Patient ${value + 1}`,
      hasClassification: value < 5,
    })))
  }, [])

  useEffect(() => {
    loadPatients().then()
  }, [loadPatients])

  return {
    patients,
    reload: loadPatients
  }
}
