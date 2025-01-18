import { useCallback, useEffect, useState } from 'react'
import { apiURL } from '@/config'
import { formatDateBackend } from '@/util/date'

export const useGraphAPI = () => {
  const [data, setData] = useState<any[]>([])
  const [date, setDate] = useState<Date>(new Date())

  const fetchData = useCallback(async () => {
    try {
      const formattedDate = formatDateBackend(date)
      const response = await fetch(`${apiURL}/analysis/caregivers/${formattedDate}/${formattedDate}/`)
      const data = await response.json()
      setData(data)
    } catch (error) {
      console.error('Failed to fetch graph data:', error)
    }
  }, [date])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    date,
    setDate
  }
}
