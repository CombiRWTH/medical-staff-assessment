import { useCallback, useEffect, useState } from 'react'
import { apiURL } from '@/config'

const getDateRange = (range: 'day' | 'week' | 'month') => {
  const endDate = new Date()
  const startDate = new Date()

  switch (range) {
    case 'day':
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(23, 59, 59, 999)
      break
    case 'week':
      // Last 7 days
      startDate.setDate(startDate.getDate() - 6)
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(23, 59, 59, 999)
      break
    case 'month':
      // Last 30 days
      startDate.setDate(startDate.getDate() - 29)
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(23, 59, 59, 999)
      break
  }

  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0]
  }
}

export const useGraphAPI = () => {
  const [data, setData] = useState<any[]>([])
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('day')

  const fetchData = useCallback(async () => {
    try {
      const { start, end } = getDateRange(timeRange)
      const response = await fetch(`${apiURL}/analysis/caregivers/${start}/${end}/`)
      const data = await response.json()
      setData(data)
    } catch (error) {
      console.error('Failed to fetch graph data:', error)
    }
  }, [timeRange])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    timeRange,
    setTimeRange
  }
}
