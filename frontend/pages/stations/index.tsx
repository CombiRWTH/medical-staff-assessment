import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { ArrowRight } from 'lucide-react'
import { Page } from '@/layout/Page'
import { Header } from '@/layout/Header'
import { Sidebar } from '@/layout/Sidebar'
import { LinkTiles } from '@/components/LinkTiles'
import { useStationsAPI } from '@/api/stations'
import { Card } from '@/components/Card'

export const StationsPage: NextPage = () => {
  const { stations } = useStationsAPI()
  const router = useRouter()

  return (
    <Page
      header={(<Header/>)}
      sideBar={(
        <Sidebar>
          <LinkTiles links={[{
            name: 'Stationen',
            url: '/stations'
          }, {
            name: 'Analyse',
            url: '/analysis'
          }]}/>
        </Sidebar>
      )}
    >
     <div className="flex flex-wrap gap-10 p-10 content-start w-full">
      {stations.map(value => (
        <Card
          key={value.id}
          className="flex flex-col justify-center items-center gap-y-2 p-4 hover:bg-purple-600 hover:text-white transition-colors duration-300 cursor-pointer"
          onClick={() => router.push(`/stations/${value.id}`)}
        >
          <span className="text-xl font-semibold">{value.name}</span>
          <div className="flex flex-row w-full justify-between gap-x-2 items-center">
            <span>Patientenanzahl:</span>
            <span className="font-semibold">{value.patientCount}</span>
          </div>
        </Card>
      ))}
    </div>

    </Page>
  )
}

export default StationsPage
