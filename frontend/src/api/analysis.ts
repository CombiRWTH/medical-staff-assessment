import { useCallback, useEffect, useState } from 'react'
import type { StationDaily, StationMonthly } from '@/util/export2'
import { apiURL } from '@/config'

export const useAnalysisAPI = (frequency: 'daily' | 'monthly') => {
  const [dataDaily, setDataDaily] = useState<StationDaily[]>([])
  const [dataMonthly, setDataMonthly] = useState<StationMonthly[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAnalysisData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${apiURL}/stations/analysis?frequency=${frequency}`)
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`)
      }
      const data = await response.json()
      if (frequency === 'daily') {
        setDataDaily(data as StationDaily[])
      } else if (frequency === 'monthly') {
        setDataMonthly(data as StationMonthly[])
      }
    } catch (e) {
      setError((e as Error).message)
      if (frequency === 'daily') {
        setDataDaily([])
      } else if (frequency === 'monthly') {
        setDataMonthly([])
      }
    } finally {
      setLoading(false)
    }
  }, [frequency])

  useEffect(() => {
    loadAnalysisData()
  }, [loadAnalysisData])

  return {
    data: frequency === 'daily' ? dataDaily : dataMonthly,
    loading,
    error,
    reload: loadAnalysisData,
  }
}
