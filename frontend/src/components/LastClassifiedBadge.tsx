import { parseDateString } from '@/util/parseDateString'
import { formatDate } from '@/util/formatDate'

export type LastClassifiedBadgeProps = {
  dateString?: string
}

/**
 * A Badge showing when a patient was last classified
 */
export const LastClassifiedBadge = ({
  dateString
}: LastClassifiedBadgeProps) => {
  const hasClassification = !!dateString
  const baseStyle = 'rounded-xl w-32 text-center px-2 py-1 border-2'
  if (!hasClassification) {
    return (
      <div className={`${baseStyle} border-orange-400`}>
        Noch nie
      </div>
    )
  }
  const lastDate = parseDateString(dateString)
  const today = Date.now()
  const isToday = today - lastDate.getTime() < 24 * 60 * 60 * 1000
  const isYesterday = today - lastDate.getTime() < 24 * 60 * 60 * 1000 * 2 && !isToday
  if (isYesterday || isToday) {
    console.log(isYesterday || isToday)
    return (
      <div
        className={`${baseStyle} ${isToday ? 'border-green-500' : 'border-amber-400'}`}>
        {isToday ? 'Heute' : 'Gestern'}
      </div>
    )
  }
  console.log('hi')
  return (
    <div className={`${baseStyle} border-orange-400`}>
      {formatDate(lastDate)}
    </div>
  )
}
