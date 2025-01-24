import { formatDateFrontendURL } from '@/util/date'
import type { PatientLastClassification } from '@/data-models/patient'

export type LastClassifiedBadgeProps = {
  classification?: PatientLastClassification
}

/**
 * A Badge showing when a patient was last classified
 * @param date The date of the last classification, if undefined assume no classification exists
 */
export const LastClassifiedBadge = ({
  classification
}: LastClassifiedBadgeProps) => {
  const hasClassification = !!classification
  const baseStyle = 'flex flex-row gap-x-2 rounded-xl w-32 text-center px-3 py-2 items-center'
  if (!hasClassification) {
    return (
      <div className={`${baseStyle} bg-orange-400/30`}>
        Noch nie
      </div>
    )
  }
  const today = Date.now()
  const isToday = today - classification.date.getTime() < 24 * 60 * 60 * 1000
  const isYesterday = today - classification.date.getTime() < 24 * 60 * 60 * 1000 * 2 && !isToday
  const classificationBadge = (
    <div className="bg-white rounded-full px-2 py-1 font-bold">{`A${classification?.category1}/S${classification?.category2}`}</div>)

  if (isYesterday || isToday) {
    return (
      <div className={`${baseStyle} ${isToday ? 'bg-green-500/30' : 'bg-amber-400/30'}`}>
        {isToday ? 'Heute' : 'Gestern'}
        {classificationBadge}
      </div>
    )
  }
  return (
    <div className={`${baseStyle} bg-orange-400/30`}>
      {formatDateFrontendURL(classification.date)}
      {classificationBadge}
    </div>
  )
}
