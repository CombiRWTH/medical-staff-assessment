import { useCallback, useEffect, useState } from 'react'
import { apiURL } from '@/config'

export const useGraphAPI = () => {
  const [data, setData] = useState<any[]>([])

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const startDate = new Date()
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + 7)

  const fetchData = useCallback(async () => {
    try {
      const start = formatDate(startDate)
      const end = formatDate(endDate)
      const response = await fetch(`${apiURL}/analysis/caregivers/${start}/${end}/`)
      const data = await response.json()
      setData(data)
    } catch (error) {
      console.error('Failed to fetch graph data:', error)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data }
}
