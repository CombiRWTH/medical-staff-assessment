import { useEffect, useState } from 'react'
import { range } from '@/util/range'
import type {
  DailyClassificationCategory,
  DailyClassificationField,
  DailyClassificationOption
} from '@/data-models/classification'
import { Tooltip } from '@/components/Tooltip'

export type ClassificationOptionDisplayProps = {
  options: DailyClassificationOption[],
  isOpen: boolean,
  isInLastRow: boolean,
  onUpdate: (id: number, selected: boolean) => void
}

export const ClassificationOptionDisplay = ({
  options,
  isOpen,
  isInLastRow,
  onUpdate
}: ClassificationOptionDisplayProps) => {
  const filteredOptionList = options.filter(option => option.selected)
  const hasSelected = filteredOptionList.length !== 0
  const usedList = isOpen ? options : filteredOptionList
  return (
    <td
      className={`py-1 px-1 align-top border-r-2 last:border-r-0 border-black ${isInLastRow ? 'border-b-0' : 'border-b-2'} ${hasSelected ? 'bg-primary/10' : ''}`}>
      <div className="flex flex-col gap-y-1 items-start w-full">
        {usedList.length !== 0 ? (
          <>
            {usedList.map(option => (
              <label key={option.id} className="hover:bg-primary/40 flex flex-row items-start justify-start gap-x-2 rounded-md px-2 py-1 cursor-pointer w-full">
                <input
                  type="checkbox"
                  value={option.name}
                  checked={option.selected}
                  className="mt-[6px]"
                  onChange={() => {
                    onUpdate(option.id, !option.selected)
                  }}
                />
                <Tooltip
                  tooltip={option.description}
                  position="bottom"
                  tooltipClassName="max-w-[300px] flex flex-grow"
                  containerClassName="overflow-hidden"
                >
                  <span className="break-words">{option.short}</span>
                </Tooltip>
              </label>
            ))}

          </>
        ) : (
          <div className="flex flex-col w-full">
            <label key="empty" className="flex flex-row gap-x-2 w-full items-center">
              Nichts Ausgewählt
            </label>
          </div>
        )}
      </div>
    </td>
  )
}

export type ClassificationOptionRowProps = {
  category: DailyClassificationCategory,
  onlySelected: boolean,
  isLastRow: boolean,
  onUpdate: (id: number, selected: boolean) => void
}

export const ClassificationOptionRow = ({
  category,
  onlySelected,
  isLastRow,
  onUpdate
}: ClassificationOptionRowProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(!onlySelected)

  useEffect(() => {
    setIsOpen(!onlySelected)
  }, [onlySelected])

  return (
    <tr key={category.short}>
      <td
        className={`align-top font-semibold px-2 border-r-2 border-black ${!isLastRow ? 'border-b-2' : 'border-0'}`}>
        <div className="flex flex-row gap-x-2">
          {category.short}
          {isOpen ? (
            <button onClick={() => setIsOpen(false)}
                    className="text-primary hover:text-primary/90 w-full text-end">Weniger anzeigen</button>
          ) : (
            <button onClick={() => setIsOpen(true)} className="text-primary hover:text-primary/90 w-full text-end">Alle
              anzeigen</button>
          )}
        </div>
      </td>
      {category.severities.sort((a, b) => a.severity - b.severity).slice(1).map((severity, index) => {
        return (
          <ClassificationOptionDisplay
            key={index}
            options={severity.questions}
            isInLastRow={isLastRow}
            isOpen={isOpen}
            onUpdate={onUpdate}
          />
        )
      })}
    </tr>
  )
}

export type ClassificationFieldCardProps = {
  classification: DailyClassificationField,
  onUpdate: (id: number, selected: boolean) => void
}

export const ClassificationCard = ({
  classification,
  onUpdate
}: ClassificationFieldCardProps) => {
  const [onlySelected, setOnlySelected] = useState<boolean>(true)

  const categorySeverityCount = Math.max(...classification.categories.map(value => value.severities.length))
  return (
    <div className="py-3 px-6 rounded-xl bg-container w-full">
      <div className="flex flex-row gap-x-2 justify-between pb-3">
        <h3 className="text-xl font-bold">{classification.name}</h3>
        <button
          onClick={() => setOnlySelected(!onlySelected)}
          className="px-2 py-1 rounded-lg border-2 border-primary hover:border-primary/80"
        >
          {onlySelected ? 'Alle Anzeigen' : 'Nur zutreffende anzeigen'}
        </button>
      </div>
      <table className="table-fixed w-full border-separate border-2 border-black rounded-xl border-spacing-0">
        <thead>
        <tr>
          <th className="text-left bold border-b-2 border-r-2 border-black px-2">Bereich</th>
          {range(2, categorySeverityCount + 1).map(value => (
            <th key={value}
                className="text-left bold px-2 border-b-2 border-r-2 border-black last:border-r-0">{`${classification.short}${value}`}</th>
          ))}
        </tr>
        </thead>
        <tbody>
        {classification.categories.map((category, categoryIndex) => (
          <ClassificationOptionRow
            key={categoryIndex}
            category={category}
            onlySelected={onlySelected}
            isLastRow={categoryIndex === classification.categories.length - 1}
            onUpdate={onUpdate}
          />
        ))}
        </tbody>
      </table>
    </div>
  )
}
