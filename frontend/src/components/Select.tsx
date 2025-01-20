import React from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { noop } from '@/util/noop'
import { Menu } from '@/components/Menu'

export type SelectItem<T> = {
  value: T,
  label: string
}

type SelectProps<T> = {
  selected?: T,
  onChange?: (value: T) => void,
  items: SelectItem<T>[],
  isDisabled?: boolean,
  containerClassName?: string,
  menuContainerClassName?: string,
  buttonClassName?: string,
  noneLabel?: string
}

export const Select = <T, >({
  items,
  selected,
  onChange = noop,
  buttonClassName,
  noneLabel,
  ...props
}: SelectProps<T>) => {
  const selectedItem = items.find((it) => it.value === selected)

  return (
    <Menu {...props} display={({
      isOpen,
      toggleOpen,
      isDisabled
    }) => (
      <button
        onClick={toggleOpen}
        disabled={isDisabled}
        className={`flex flex-row justify-between gap-x-2 min-w-[120px] ${isDisabled ? 'button-full-disabled' : 'button-full-primary'} ${buttonClassName}`}
      >
        {selectedItem?.label ?? noneLabel ?? 'Nichts Ausgewählt'}
        {isOpen ? <ChevronUp size={24}/> : <ChevronDown size={24}/>}
      </button>
    )}>
      {({ toggleOpen }) => items.map((item, index) => (
        <button
          key={index}
          onClick={() => {
            toggleOpen()
            onChange(item.value)
          }}
          className="button-padding bg-gray-200 card-hover whitespace-nowrap"
        >
          {item.label}
        </button>
      ))}
    </Menu>
  )
}
