import { useRouter } from 'next/router'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { addDays, isSameDay, subDays } from 'date-fns'
import Link from 'next/link'
import { DefaultHeaderStart, Header } from '@/layout/Header'
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
import { usePatientDatesAPI } from '@/api/dates'

export const PatientClassification = () => {
  const router = useRouter()
  const id = router.query.id !== undefined ? parseInt(router.query.id as string) : undefined
  const patientId = router.query.patientId !== undefined ? parseInt(router.query.patientId as string) : undefined
  const dateString: string = (router.query.date as string | undefined) ?? ''
  const date = parseDateStringFrontend(dateString)

  const { dates, reload } = usePatientDatesAPI(id, patientId)

  const hasPreviousDay: boolean = dates.some(value => isSameDay(subDays(date, 1), value.date))
  const hasNextDay: boolean = dates.some(value => isSameDay(addDays(date, 1), value.date))
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
              <DefaultHeaderStart/>
              <div className="bg-gray-300 rounded-full min-w-1 min-h-12"/>
              <div className="flex flex-row gap-x-1 items-center font-semibold text-lg">
                <Link href={`/stations/${id}`}>{currentStation?.name}</Link>
                <strong>/</strong>
                <Link href={`/stations/${id}/${patientId}/${dateString}`}>
                  {currentPatient?.name}
                </Link>
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
              <button
                onClick={() => router.push(`/stations/${id}/${patientId}/${formatDateFrontendURL(subDays(date, 1))}`)}
                className={`flex flex-col items-center ${hasPreviousDay ? '' : 'text-gray-400'}`}
                disabled={!hasPreviousDay}
              >
                <Tooltip tooltip="Vorheriger Tag" position="bottom">
                  <ChevronLeft size={32}/>
                </Tooltip>
              </button>
              <DatePickerButton date={date} eventList={{
                events: dates.map(date => ({
                  date: date.date,
                  color: date.hasClassification ? 'green' : 'orange'
                }))
              }} onDateClick={(_, selectedDate) =>
                router.push(`/stations/${id}/${patientId}/${formatDateFrontendURL(selectedDate)}`)
              }/>
              <button
                onClick={() => router.push(`/stations/${id}/${patientId}/${formatDateFrontendURL(addDays(date, 1))}`)}
                className={`flex flex-col items-center ${hasNextDay ? '' : 'text-gray-400'}`}
                disabled={!hasNextDay}
              >
                <Tooltip tooltip="Nächster Tag" position="bottom">
                  <ChevronRight size={32}/>
                </Tooltip>
              </button>
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
      <div className="relative flex flex-col p-8 pt-0 w-full">
        <div className="flex flex-row gap-x-10 sticky top-0 py-8 bg-background z-[1]">
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
              <input
                type="checkbox"
                checked={classification.is_in_isolation}
                onChange={() => update({ isolationUpdate: !classification.is_in_isolation }).then(reload)}
              />
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
        <div className="flex flex-col gap-y-6">
          {classification.careServices.map((list, index) => (
            <ClassificationCard key={index} classification={list} onUpdate={(id, selected) => {
              update({
                questionUpdates: {
                  id,
                  selected
                }
              }).then(reload)
            }}/>
          ))}
        </div>
      </div>
    </Page>
  )
}

export default PatientClassification
