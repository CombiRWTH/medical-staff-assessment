import { useCallback, useEffect, useState } from 'react'
import type { StationDaily, StationMonthly } from '@/util/export'
import { apiURL } from '@/config'

export type AnalysisFrequency = 'daily' | 'monthly'

export const useAnalysisAPI = (frequency: AnalysisFrequency) => {
  const [dataDaily, setDataDaily] = useState<StationDaily[]>([
    {
      id: 1,
      name: 'Station A',
      minutes: 4241
    },
    {
      id: 2,
      name: 'Station B',
      minutes: 3524
    },
  ])
  const [dataMonthly, setDataMonthly] = useState<StationMonthly[]>([
    {
      id: 1,
      name: 'Station A',
      data: [
        {
          day: 1,
          minutes: 4241
        },
        {
          day: 2,
          minutes: 3917
        },
        {
          day: 3,
          minutes: 4386
        }
      ]
    },
    {
      id: 2,
      name: 'Station B',
      data: [
        {
          day: 1,
          minutes: 7241
        },
        {
          day: 2,
          minutes: 6517
        },
        {
          day: 3,
          minutes: 6781
        }
      ]
    },
  ])
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
  }, [loadAnalysisData, frequency])

  return {
    data: frequency === 'daily' ? dataDaily : dataMonthly,
    loading,
    error,
    reload: loadAnalysisData,
  }
}
