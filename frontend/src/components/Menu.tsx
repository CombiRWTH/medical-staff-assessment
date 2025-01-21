import type { ReactNode } from 'react'
import { useRef, useState } from 'react'
import { useOutsideClick } from '@/util/hooks/useOutsideClick'

type PropBag = {
  isOpen: boolean,
  toggleOpen: () => void,
  isDisabled: boolean
}

type MenuProps = {
  children: (bag: PropBag) => ReactNode,
  display: (bag: PropBag) => ReactNode,
  isDisabled?: boolean,
  containerClassName?: string,
  menuContainerClassName?: string
}

/**
 * A menu component that is opened via a button
 * @param children The menu items to displays
 * @param display The button to display
 * @param containerClassName  The style overwrite of the container holding all parts including the button
 * @param menuContainerClassName The style overwrite of the menu container
 * @param isDisabled Whether the component should be disabled
 * @constructor
 */
export const Menu = ({
  children,
  display,
  containerClassName,
  menuContainerClassName,
  isDisabled = false
}: MenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useOutsideClick([ref], () => setIsOpen(false))

  const bag: PropBag = {
    isOpen,
    toggleOpen: () => setIsOpen(!isOpen),
    isDisabled
  }

  return (
    <div ref={ref} className={`relative ${containerClassName}`}>
      {display(bag)}
      {isOpen && (
        <div
          className={`absolute shadow-lg z-10 top-full left-1/2 -translate-x-1/2 mt-2 ${menuContainerClassName} flex flex-col gap-y-2 p-2 rounded-md bg-container`}>
          {children(bag)}
        </div>
      )}
    </div>
  )
}
