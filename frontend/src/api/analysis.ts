import { useCallback, useEffect, useState } from 'react'
import type { StationDaily, StationMonthly } from '@/util/export'
import { apiURL } from '@/config'

export type AnalysisFrequency = 'daily' | 'monthly' | 'quarterly'

/**
 * Hook for loading analysis data
 * @param frequency - load daily or monthly data for the stations
 */
export const useAnalysisAPI = (frequency: AnalysisFrequency) => {
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
      if (Array.isArray(data) && data.length === 0) {
        return
      }
      if (frequency === 'daily') {
        setDataDaily(data as StationDaily[])
      } else if (frequency === 'monthly' || frequency === 'quarterly') {
        setDataMonthly(data as StationMonthly[])
      }
    } catch (e) {
      setError((e as Error).message)
      if (frequency === 'daily') {
        setDataDaily([])
      } else if (frequency === 'monthly' || frequency === 'quarterly') {
        setDataMonthly([])
      }
    } finally {
      setLoading(false)
    }
  }, [frequency])

  useEffect(() => {
    loadAnalysisData()
  }, [loadAnalysisData, frequency])

  return {
    data: frequency === 'daily' ? dataDaily : dataMonthly,
    loading,
    error,
    reload: loadAnalysisData,
  }
}
