import type { PropsWithChildren } from 'react'

export type CardProps = PropsWithChildren<{
  onClick?: () => void,
  className?: string
}>

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
