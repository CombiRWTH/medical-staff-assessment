import { useEffect, useState } from 'react'
import { Info } from 'lucide-react'
import { range } from '@/util/range'
import type { DailyClassificationField, DailyClassificationOption } from '@/data-models/classification'
import { Tooltip } from '@/components/Tooltip'

export type ClassificationOptionDisplayProps = {
  options: DailyClassificationOption[],
  onlySelected: boolean,
  isLastCellInCol: boolean,
  onUpdate: (id: number, selected: boolean) => void
}

export const ClassificationOptionDisplay = ({
  options,
  onlySelected,
  isLastCellInCol,
  onUpdate
}: ClassificationOptionDisplayProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(!onlySelected)

  useEffect(() => {
    setIsOpen(!onlySelected)
  }, [onlySelected])

  const filteredOptionList = options.filter(option => option.selected)
  const hasSelected = filteredOptionList.length !== 0
  const usedList = isOpen ? options : filteredOptionList
  return (
    <td
      className={`px-2 py-1 align-top border-r-2 last:border-r-0 border-black ${isLastCellInCol ? 'border-b-0' : 'border-b-2'} ${hasSelected ? 'bg-primary/10' : ''}`}>
      <div className="flex flex-col gap-y-1 items-start w-full">
        {usedList.length !== 0 ? (
          <>
            {usedList.map(option => (
              <label key={option.id} className="flex flex-row items-start w-full">
                <input
                  type="checkbox"
                  value={option.name}
                  checked={option.selected}
                  className="mt-0.5 mr-2 shrink-0"
                  onChange={() => {
                    onUpdate(option.id, !option.selected)
                  }}
                />
                <div className="flex justify-between items-start w-full min-w-0">
                  <span className="break-words pr-2">{option.short}</span>
                  <Tooltip tooltip={option.description} position="bottom" className="max-w-[300px] !whitespace-normal">
                    <div className="inline-flex mt-0.5 shrink-0">
                      <Info className="h-3 w-3 text-gray-400" />
                    </div>
                  </Tooltip>
                </div>
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
        {isOpen ? (
          <button onClick={() => setIsOpen(false)} className="text-primary hover:text-primary/90 w-full text-end">Weniger anzeigen</button>
        ) : (
          <button onClick={() => setIsOpen(true)} className="text-primary hover:text-primary/90 w-full text-end">Alle anzeigen</button>
        )}
      </div>
    </td>
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
          <tr key={category.short}>
            <td
              className={`align-top font-semibold px-2 border-r-2 last:border-r-0 border-black ${categoryIndex !== classification.categories.length - 1 ? 'border-b-2' : 'border-0'}`}>
              {category.short}
            </td>
            {category.severities.sort((a, b) => a.severity - b.severity).slice(1).map((severity, index) => {
              return (
                <ClassificationOptionDisplay
                  key={index}
                  options={severity.questions}
                  isLastCellInCol={categoryIndex === classification.categories.length - 1}
                  onlySelected={onlySelected}
                  onUpdate={onUpdate}
                />
              )
            })}
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  )
}
