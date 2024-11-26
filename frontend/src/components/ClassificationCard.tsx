import { useState } from 'react'
import { range } from '@/util/range'
import type { DailyClassificationOption } from '@/data-models/classification'
import { subsetByAttribute } from '@/util/subsetByAttribute'

export type ClassificationFieldCardProps = {
  options: DailyClassificationOption[]
}

export const ClassificationCard = ({ options }: ClassificationFieldCardProps) => {
  const [onlySelected, setOnlySelected] = useState<boolean>(true)

  const fieldName = options[0].field__name
  const fieldShort = options[0].field__short
  const categorySeverityCount = new Set(options.map(value => value.severity)).size
  const categories = subsetByAttribute(options, value => value.category__name)
  return (
    <div className="py-3 px-6 rounded-xl bg-container w-full">
      <div className="flex flex-row gap-x-2 justify-between pb-3">
        <h3 className="text-xl font-bold">{fieldName}</h3>
        <button
          onClick={() => setOnlySelected(!onlySelected)}
          className="px-2 py-1 rounded-lg border-2 border-primary hover:border-primary/80"
        >
          {onlySelected ? 'Alle Anzeigen' : 'Nur zutreffende anzeigen'}
        </button>
      </div>
      <table className="w-full border-separate border-2 border-black rounded-xl border-spacing-0">
        <thead>
        <tr>
          <th className="text-left bold border-b-2 border-r-2 border-black px-2">Bereich</th>
          {range(1, categorySeverityCount + 1).map(value => (
            <th key={value}
                className="text-left bold px-2 border-b-2 border-r-2 border-black last:border-r-0">{`${fieldShort}${value}`}</th>
          ))}
        </tr>
        </thead>
        <tbody>
        {categories.map((categoryList, index) => (
          <tr key={categoryList[0].category__name}>
            <td
              className={`align-top font-semibold px-2 border-r-2 last:border-r-0 border-black ${index !== categories.length - 1 ? 'border-b-2' : 'border-0'}`}>{categoryList[0].category__name}</td>
            {subsetByAttribute(categoryList, value => value.severity).map(optionList => {
              const filteredOptionList = optionList.filter(option => option.selected)
              const hasSelected = filteredOptionList.length !== 0
              const usedList = onlySelected ? filteredOptionList : optionList
              return (
                <td key={optionList[0].severity}
                    className={`px-2 py-1 align-top border-r-2 last:border-r-0 border-black ${index !== categories.length - 1 ? 'border-b-2' : 'border-0'} ${hasSelected ? 'bg-primary/10' : ''}`}>
                  <div className="flex flex-col gap-y-1 items-start w-full">
                    {usedList.length !== 0 ? usedList.map(option => (
                      <label key={option.id} className="flex flex-row items-start gap-x-2">
                        <input type="checkbox" value={option.name} checked={option.selected} className="mt-[6px]"/>
                        {option.description}
                      </label>
                    )) : (
                      <label key="empty" className="flex flex-row gap-x-2 w-full items-center">
                        <span>Nichts ausgewählt</span>
                      </label>
                    )}
                  </div>
                </td>
              )
            })}
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  )
}
