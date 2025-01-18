import { useStationsAPI } from '@/api/stations'
import { Card } from '@/components/Card'
import { LinkTiles } from '@/components/LinkTiles'
import type { Station } from '@/data-models/station'
import { Header } from '@/layout/Header'
import { Page } from '@/layout/Page'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'

export const StationsPage: NextPage = () => {
  const { stations } = useStationsAPI()
  const router = useRouter()

  const getColor = (station: Station): string => {
    if (station.missing_classifications === 0) {
      return 'text-white bg-positive/80 hover:bg-positive'
    } else if (station.missing_classifications <= station.patientCount) {
      return 'text-black bg-warning/70 hover:bg-warning'
    } else {
      return 'text-white bg-negative/70 hover:bg-negative/80'
    }
  }

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
      <div className="flex flex-wrap gap-10 p-10 w-full">
        {stations.map(value => (
          <Card
            key={value.id}
            className={`flex flex-col justify-start gap-y-2 p-4 transition-colors duration-100 cursor-pointer ${getColor(value)}`}
            onClick={() => router.push(`/stations/${value.id}`)}
          >
            <span className="text-xl font-semibold">{value.name}</span>
            <div className="flex flex-row w-full justify-between gap-x-4 items-center">
              <span>Patienten:</span>
              <span className="font-semibold">{value.patientCount}</span>
            </div>
            <div className="flex flex-row w-full justify-between gap-x-4 items-center">
              <span>Fehlende Einstufungen:</span>
              <span className="font-semibold">{value.missing_classifications}</span>
            </div>
          </Card>
        ))}
      </div>

    </Page>
  )
}

export default StationsPage
