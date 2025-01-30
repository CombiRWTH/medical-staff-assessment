import { formatDateVisual } from '@/util/date'
import type { DailyClassificationResult } from '@/data-models/classification'

export type LastClassifiedBadgeProps = {
  classification?: DailyClassificationResult,
  date?: Date
}

/**
 * A Badge showing when a patient was last classified
 */
export const LastClassifiedBadge = ({
  classification,
  date,
}: LastClassifiedBadgeProps) => {
  const hasClassification = !!classification && !!date
  const baseStyle = 'flex flex-row gap-x-2 rounded-xl h-[48px] max-w-[210px] px-3 py-2 items-center justify-between font-medium'
  const classificationBadge = (
    <div className="bg-white rounded-full px-2 py-1 font-bold">
      {`A${classification?.category1 ?? '-'}/S${classification?.category2 ?? '-'}`}
    </div>
  )

  if (!hasClassification) {
    return (
      <div className={`${baseStyle} bg-orange-400/30`}>
        Noch nie
        {classificationBadge}
      </div>
    )
  }
  const today = Date.now()
  const isToday = today - date.getTime() < 24 * 60 * 60 * 1000
  const isYesterday = today - date.getTime() < 24 * 60 * 60 * 1000 * 2 && !isToday

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
      {formatDateVisual(date)}
      {classificationBadge}
    </div>
  )
}
