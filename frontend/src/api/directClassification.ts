import { useCallback } from 'react'
import { apiURL } from '@/config'

export const useClassificationAPI = () => {
  const addClassification = useCallback(async (stationId: number, patientId: number, date: string, category1: number, category2: number) => {
    try {
      const response = await fetch(`${apiURL}/calculate_direct/${stationId}/${patientId}/${date}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category1,
          category2,
        }),
      })
      return await response.json()
    } catch (error) {
      console.error('Failed to add classification:', error)
    }
  }, [])

  return { addClassification }
}
