import { formatDateFrontendURL } from '@/util/date'

export type LastClassifiedBadgeProps = {
  date?: Date
}

/**
 * A Badge showing when a patient was last classified
 */
export const LastClassifiedBadge = ({
  date
}: LastClassifiedBadgeProps) => {
  const hasClassification = !!date
  const baseStyle = 'rounded-xl w-32 text-center px-2 py-1 border-2'
  if (!hasClassification) {
    return (
      <div className={`${baseStyle} border-orange-400`}>
        Noch nie
      </div>
    )
  }
  const today = Date.now()
  const isToday = today - date.getTime() < 24 * 60 * 60 * 1000
  const isYesterday = today - date.getTime() < 24 * 60 * 60 * 1000 * 2 && !isToday
  if (isYesterday || isToday) {
    return (
      <div
        className={`${baseStyle} ${isToday ? 'border-green-500' : 'border-amber-400'}`}>
        {isToday ? 'Heute' : 'Gestern'}
      </div>
    )
  }
  return (
    <div className={`${baseStyle} border-orange-400`}>
      {formatDateFrontendURL(date)}
    </div>
  )
}
