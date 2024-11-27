import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export const HomePage: NextPage = () => {
  const router = useRouter()

  useEffect(() => {
    router.push('/stations').then()
  }, [router])

  return (
    <div className="bg-primary h-[200px] w-screen">
      Forwarding
    </div>
  )
}

export default HomePage
