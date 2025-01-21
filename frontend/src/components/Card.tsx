import type { PropsWithChildren } from 'react'

export type CardProps = PropsWithChildren<{
  onClick?: () => void,
  className?: string
}>

/**
 * Layout component for a card
 * @param children The content to display
 * @param onClick The callback on click events
 * @param className The style overwrite
 */
export const Card = ({
  children,
  onClick,
  className = ''
}: CardProps) => {
  return (
    <div className={`rounded-xl py-4 px-6 bg-container ${className} ${onClick !== undefined ? 'cursor-pointer' : ''}`}
         onClick={onClick}>
      {children}
    </div>
  )
}
