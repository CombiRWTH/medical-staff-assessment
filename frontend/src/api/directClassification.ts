import { useCallback } from 'react'
import { apiURL } from '@/config'
import { getCookie } from '@/util/getCookie'

/**
 * Hook to add a direct classification
 */
export const useClassificationAPI = () => {
  const addClassification = useCallback(async (stationId: number, patientId: number, date: string, category1: number, category2: number) => {
    try {
      const response = await fetch(`${apiURL}/calculate_direct/${stationId}/${patientId}/${date}/${category1}/${category2}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken') ?? '',
        },
        credentials: 'include'
      })
      console.debug(response)
      return true
    } catch (error) {
      console.error('Failed to add classification:', error)
      return false
    }
  }, [])

  return { addClassification }
}
