import { useCallback, useEffect, useState } from 'react'
import type { Station } from '@/data-models/station'
import { apiURL } from '@/config'

export const useStationsAPI = () => {
  const [stations, setStations] = useState<Station[]>([])

  const loadStations = useCallback(async () => {
    const response = await (await fetch(`${apiURL}/stations`)).json()
    setStations(response as Station[])
  }, [])

  useEffect(() => {
    loadStations().then()
  }, [loadStations])

  return {
    stations,
    reload: loadStations
  }
}
