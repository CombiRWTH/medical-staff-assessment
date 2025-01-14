import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { Page } from '@/layout/Page'
import { Header } from '@/layout/Header'
import { LinkTiles } from '@/components/LinkTiles'
import { useStationsAPI } from '@/api/stations'
import { Card } from '@/components/Card'

export const StationsPage: NextPage = () => {
  const { stations } = useStationsAPI()
  const router = useRouter()

  return (
    <Page
      header={(
        <Header className="!justify-start gap-x-8">
          <div className="bg-gray-200 w-1 h-10 rounded"/>
          <LinkTiles links={[{
            name: 'Stationen',
            url: '/stations'
          }, {
            name: 'Analyse',
            url: '/analysis'
          }]}/>
        </Header>
      )}
    >
      <div className="flex flex-wrap gap-10 p-10 content-start w-full">
        {stations.map(value => (
          <Card
            key={value.id}
            className="flex flex-col justify-center items-center gap-y-2 p-4 hover:bg-primary/50 hover:text-white transition-colors duration-100 cursor-pointer"
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
