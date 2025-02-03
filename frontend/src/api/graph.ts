import { useCallback, useEffect, useState } from 'react'
import { apiURL } from '@/config'
import { formatDateBackend } from '@/util/date'
import type { AnalysisFrequency } from '@/api/analysis'

/**
 * Hook to load the analysis data for caregivers
 */
export const useGraphAPI = (viewMode: AnalysisFrequency) => {
  const [data, setData] = useState<any[]>([])
  const [date, setDate] = useState<Date>(new Date())

  const fetchData = useCallback(async () => {
    try {
      const formattedDate = formatDateBackend(date)
      const startDate = new Date(date)

      switch (viewMode) {
        case 'daily':
          break
        case 'monthly':
          // Go back one month from the current date
          startDate.setMonth(date.getMonth() - 1)
          break
        case 'quarterly':
          // Go back three months from the current date
          startDate.setMonth(date.getMonth() - 3)
          break
      }

      const formattedStartDate = formatDateBackend(startDate)

      const response = await fetch(`${apiURL}/analysis/caregivers/${formattedStartDate}/${formattedDate}/`)
      const data = await response.json()
      setData(data)
    } catch (error) {
      console.error('Failed to fetch graph data:', error)
    }
  }, [date, viewMode])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    date,
    setDate
  }
}
