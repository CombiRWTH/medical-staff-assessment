import { useCallback, useEffect, useState } from 'react'
import type { Station } from '@/data-models/station'
import { apiURL } from '@/config'

/**
 * Hook for loading all Stations
 */
export const useStationsAPI = () => {
  const [stations, setStations] = useState<Station[]>([])

  const loadStations = useCallback(async () => {
    try {
      const response = await (await fetch(`${apiURL}/stations`)).json()
      setStations(response as Station[])
    } catch (e) {
      setStations([])
    }
  }, [])

  useEffect(() => {
    loadStations().then()
  }, [loadStations])

  return {
    stations,
    reload: loadStations
  }
}
