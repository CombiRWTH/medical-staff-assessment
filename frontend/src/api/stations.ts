import { useCallback, useEffect, useState } from 'react'
import type { Station } from '@/data-models/station'

// TODO use something like react query
export const useStationsAPI = () => {
  const [stations, setStations] = useState<Station[]>([])

  const loadStations = useCallback(async () => {
    setStations(Array.from({ length: 10 }, (_, i) => i + 1).map<Station>(value => ({
      id: `${value}`,
      name: `Station ${value + 1}`,
      patientCount: value
    })))
  }, [])

  useEffect(() => {
    loadStations().then()
  }, [loadStations])

  return {
    stations,
    reload: loadStations
  }
}
