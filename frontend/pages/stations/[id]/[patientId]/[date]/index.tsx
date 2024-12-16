import { useRouter } from 'next/router'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { addDays, subDays } from 'date-fns'
import Link from 'next/link'
import { DefaultHeader, Header } from '@/layout/Header'
import { Page } from '@/layout/Page'
import { useStationsAPI } from '@/api/stations'
import { usePatientsAPI } from '@/api/patients'
import { noop } from '@/util/noop'
import { ClassificationCard } from '@/components/ClassificationCard'
import { usePatientClassification } from '@/api/classification'
import { Tooltip } from '@/components/Tooltip'
import {
  formatDateBackend,
  formatDateFrontendURL,
  formatDateVisual,
  parseDateString,
  parseDateStringFrontend
} from '@/util/date'
import { DatePickerButton } from '@/components/DatePicker/DatePickerButton'

export const PatientClassification = () => {
  const router = useRouter()
  const id = router.query.id !== undefined ? parseInt(router.query.id as string) : undefined
  const patientId = router.query.patientId !== undefined ? parseInt(router.query.patientId as string) : undefined
  const dateString: string = (router.query.date as string | undefined) ?? ''
  const date = parseDateStringFrontend(dateString)

  const { stations } = useStationsAPI()
  const currentStation = stations.find(value => value.id === id)
  const { patients } = usePatientsAPI(currentStation?.id)
  const currentPatient = patients.find(value => value.id === patientId)
  const {
    classification,
    update
  } = usePatientClassification(id, patientId, formatDateBackend(date))

  const nextUnclassifiedPatient = useMemo(() => {
    // Start searching from the current patient's index
    const currentIndex = patients.findIndex(p => p.id === currentPatient?.id)
    const patientsLength = patients.length

    for (let i = 1; i < patientsLength; i++) {
      const nextIndex = (currentIndex + i) % patientsLength
      const nextPatient = patients[nextIndex]

      // Patients WITHOUT a lastClassification
      if (!nextPatient.lastClassification) {
        return nextPatient
      }
    }

    // If all patients are classified, return undefined
    return undefined
  }, [patients, currentPatient])

  const allPatientsClassified = useMemo(() =>
    patients.every(patient => !!patient.lastClassification),
  [patients]
  )

  useEffect(noop, [router.query.date]) // reload once the date can be parsed

  return (
    <Page
      header={(
        <Header
          start={(
            <div className="flex flex-row items-center gap-x-4 flex-shrink-0 flex-1">
              <DefaultHeader/>
              <div className="bg-gray-300 rounded-full min-w-1 min-h-12"/>
              <div className="flex flex-row gap-x-1 items-center font-semibold text-lg">
                <Link href={`/stations/${id}`}>{currentStation?.name}</Link>
                <strong>/</strong>
                <Link href={`/stations/${id}/${patientId}/${dateString}`}>{currentPatient?.name}</Link>
              </div>
            </div>
          )}
          end={(
            <div className="flex flex-row items-center w-full flex-1 justify-end">
              <div className="flex flex-row gap-x-4 items-center flex-shrink-0 justify-end">
                {nextUnclassifiedPatient ? (
                  <a href={`/stations/${id}/${nextUnclassifiedPatient.id}/${formatDateFrontendURL(date)}`}>
                    <button className="flex flex-row gap-x-2 items-center">
                      Nächsten Patienten<ArrowRight size={20}/>
                    </button>
                  </a>
                ) : (
                  <Tooltip
                    position="left"
                    tooltip={
                      allPatientsClassified
                        ? 'Alle Patienten sind klassifiziert'
                        : 'Kein unklassifizierter Patient gefunden'
                    }
                  >
                    <button
                      disabled={true}
                      className="flex flex-row gap-x-2 items-center opacity-50 cursor-not-allowed text-primary hover:text-primary/90"
                    >
                      Nächsten Patienten<ArrowRight size={20}/>
                    </button>
                  </Tooltip>
                )}
              </div>
            </div>
          )}
        >
          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-row gap-x-2 items-center flex-1 justify-center">
              <Link href={`/stations/${id}/${patientId}/${formatDateFrontendURL(subDays(date, 1))}`}
                    className="flex flex-col items-center">
                <Tooltip tooltip="Gestern" position="bottom">
                  <ChevronLeft size={32}/>
                </Tooltip>
              </Link>
              <DatePickerButton date={date} eventList={{}} onDateClick={(_, selectedDate) => {
                router.push(`/stations/${id}/${patientId}/${formatDateFrontendURL(selectedDate)}`)
              }}/>
              <Link
                href={`/stations/${id}/${patientId}/${formatDateFrontendURL(addDays(date, 1))}`}
                className="flex flex-col items-center"
              >
                <Tooltip tooltip="Morgen" position="bottom">
                  <ChevronRight size={32}/>
                </Tooltip>
              </Link>
            </div>
            <Link
              className="text-primary hover:text-primary/90 text-sm"
              href={`/stations/${id}/${patientId}/${formatDateFrontendURL()}`}
            >
              Zu Heute
            </Link>
          </div>
        </Header>
      )}
    >
      <div className="relative flex flex-col p-8 gap-y-6 w-full">
        <div className="flex flex-row gap-x-10 sticky top-2 bg-gray-100 rounded-2xl z-[1]">
          <div className="flex flex-col gap-y-2 bg-container px-4 py-2 rounded-2xl flex-1">
            <h2 className="font-bold text-xl">Tagesdaten</h2>
            <div className="flex flex-row gap-x-1 justify-between">
              <span>Tag der Aufnahme</span>
              <span>{classification.admission_date ? formatDateVisual(parseDateString(classification.admission_date)) : '-'}</span>
            </div>
            <div className="flex flex-row gap-x-1 justify-between">
              <span>Tag der Entlassung</span>
              <span>{classification.discharge_date ? formatDateVisual(parseDateString(classification.discharge_date)) : '-'}</span>
            </div>
            <div className="flex flex-row gap-x-1 justify-between">
              <span>In Isolation</span>
              <span>{classification.is_in_isolation ? 'Ja' : 'Nein'}</span>
            </div>
          </div>
          <div className="bg-primary/30 rounded-2xl px-4 py-2 flex flex-col justify-between flex-1">
            <h2 className="font-bold text-xl">Ergebnis:</h2>
            <div className="flex flex-row items-center gap-x-2 justify-between">
              Kategorie:
              <strong className="bg-white rounded-full px-2 py-1">
                { /* TODO fix hardcoding of A and S  */}
                A{classification?.result?.category1 ?? '-'}/S{classification?.result?.category2 ?? ''}
              </strong>
            </div>
            <div className="flex flex-row items-center gap-x-2 justify-between">
              Minutenzahl:
              <strong className="bg-white rounded-full px-2 py-1">
                {classification?.result?.minutes ?? 0}min
              </strong>
            </div>
          </div>
        </div>

        {classification.careServices.map((list, index) => (
          <ClassificationCard key={index} classification={list} onUpdate={update}/>
        ))}
      </div>
    </Page>
  )
}

export default PatientClassification
