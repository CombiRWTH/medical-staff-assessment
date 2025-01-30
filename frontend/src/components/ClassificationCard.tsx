import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Info } from 'lucide-react'
import { range } from '@/util/array'
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
  onUpdate: (id: number, selected: boolean) => void,
  onEmptyClick: () => void
}

export const ClassificationOptionDisplay = ({
  options,
  isOpen,
  isInLastRow,
  onUpdate,
  onEmptyClick,
}: ClassificationOptionDisplayProps) => {
  const filteredOptionList = options.filter(option => option.selected)
  const hasSelected = filteredOptionList.length !== 0
  const usedList = isOpen ? options : filteredOptionList
  const isEmpty = usedList.length === 0

  return (
    <td
      onClick={isEmpty ? onEmptyClick : undefined}
      className={`py-1 px-1 align-top border-r-2 last:border-r-0 border-black ${isInLastRow ? 'border-b-0' : 'border-b-2'} ${hasSelected ? 'bg-primary/10' : ''} ${isEmpty ? 'cursor-pointer' : ''}`}
    >
      <div className="flex flex-col gap-y-1 items-start w-full">
        {!isEmpty ? (
          <>
            {usedList.map(option => (
              <label key={option.id}
                     className="hover:bg-primary/40 flex flex-row items-start justify-between gap-x-2 rounded-md px-2 py-1 cursor-pointer w-full">
                <input
                  type="checkbox"
                  value={option.name}
                  checked={option.selected}
                  className="mt-1.5 shrink-0"
                  onChange={() => {
                    onUpdate(option.id, !option.selected)
                  }}
                />
                <span className="w-full overflow-hidden break-words">{option.short}</span>
                <Tooltip
                  tooltip={option.description}
                  position="bottom"
                  tooltipClassName="w-max max-w-[300px] flex flex-row flex-grow !whitespace-normal"
                  containerClassName="!w-auto mt-0.5"
                >
                  <Info size={20} className="mt-0.5 text-gray-500"/>
                </Tooltip>
              </label>
            ))}

          </>
        ) : (
          <div className="px-2 py-1 flex flex-col w-full justify-center h-full">
            <label key="empty" className="w-full text-gray-400 cursor-pointer">
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
        onClick={() => setIsOpen(!isOpen)}
        className={`py-1 cursor-pointer align-top font-semibold px-2 border-r-2 border-black ${!isLastRow ? 'border-b-2' : 'border-0'}`}>
        <div className="flex flex-row gap-x-2 justify-between items-center">
          {category.short}
          <div className="p-1 button-text-primary bg-gray-200 hover:bg-gray-300 rounded-md">
            {isOpen ? <ChevronUp/> : <ChevronDown/>}
          </div>
        </div>
      </td>
      {category.severities.sort((a, b) => a.severity - b.severity).map((severity, index) => {
        return (
          <ClassificationOptionDisplay
            key={index}
            options={severity.questions}
            isInLastRow={isLastRow}
            isOpen={isOpen}
            onUpdate={onUpdate}
            onEmptyClick={() => setIsOpen(!isOpen)}
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
          {onlySelected ? 'Ausklappen' : 'Nur zutreffende anzeigen'}
        </button>
      </div>
      <table className="table-fixed w-full border-separate border-2 border-black rounded-xl border-spacing-0">
        <thead>
        <tr>
          <th className="text-left bold border-b-2 border-r-2 border-black px-2">Bereich</th>
          {range(2, categorySeverityCount + 2).map(value => (
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
