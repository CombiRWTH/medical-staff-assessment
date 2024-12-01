import { useEffect, useState } from 'react'
import { range } from '@/util/range'
import type { DailyClassificationField, DailyClassificationOption } from '@/data-models/classification'

export type ClassificationOptionDisplayProps = {
  options: DailyClassificationOption[],
  onlySelected: boolean,
  isLastCell: boolean,
  onUpdate: (id: number, selected: boolean) => void
}

export const ClassificationOptionDisplay = ({
  options,
  onlySelected,
  isLastCell,
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
      className={`px-2 py-1 align-top border-r-2 last:border-r-0 border-black ${!isLastCell ? 'border-b-2' : 'border-0'} ${hasSelected ? 'bg-primary/10' : ''}`}>
      <div className="flex flex-col gap-y-1 items-start w-full">
        {usedList.length !== 0 ? (
          <>
            {usedList.map(option => (
              <label key={option.id} className="flex flex-row items-start gap-x-2 w-full">
                <input
                  type="checkbox"
                  value={option.name}
                  checked={option.selected}
                  className="mt-[6px]"
                  onChange={() => {
                    onUpdate(option.id, !option.selected)
                  }}
                />
                <span className="break-words overflow-hidden">{option.description}</span>
              </label>
            ))}
            <span onClick={() => setIsOpen(false)}>Weniger anzeigen</span>
          </>
        ) : (
          <label key="empty" className="flex flex-row gap-x-2 w-full items-center">
            <span onClick={() => setIsOpen(true)}>Nichts ausgewählt</span>
          </label>
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
        {classification.categories.map((category, index) => (
          <tr key={category.name}>
            <td
              className={`align-top font-semibold px-2 border-r-2 last:border-r-0 border-black ${index !== classification.categories.length - 1 ? 'border-b-2' : 'border-0'}`}>
              {category.name}
            </td>
            {category.severities.sort((a, b) => a.severity - b.severity).slice(1).map((severity, index) => {
              return (
                <ClassificationOptionDisplay
                  key={index}
                  options={severity.questions}
                  isLastCell={index === classification.categories.length - 1}
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
