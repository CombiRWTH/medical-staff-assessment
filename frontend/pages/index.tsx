import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import LoadingSpinner from '@/components/LoadingSpinner'

export const HomePage: NextPage = () => {
  const router = useRouter()

  useEffect(() => {
    router.push('/stations').then()
  }, [router])

  return (
    <div className="flex flex-col justify-center items-center h-screen w-screen">
      <LoadingSpinner size="large"/>
    </div>
  )
}

export default HomePage
