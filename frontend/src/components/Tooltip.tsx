import type { PropsWithChildren, ReactNode } from 'react'
import React, { useState } from 'react'

export type TooltipProps = PropsWithChildren<{
  tooltip: string | ReactNode,
  className?: string,
  position?: 'top' | 'bottom' | 'left' | 'right'
}>

export const Tooltip = ({
  tooltip,
  children,
  className = '',
  position = 'top'
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false)

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  }

  const triangleSize = '2'
  const triangleClasses = {
    top: `top-full left-1/2 -translate-x-1/2 border-t-gray-800 border-t-${triangleSize} border-l-transparent border-l-${triangleSize} border-r-transparent border-r-${triangleSize}`,
    bottom: `bottom-full left-1/2 -translate-x-1/2 border-b-gray-800 border-b-${triangleSize} border-l-transparent border-l-${triangleSize} border-r-transparent border-r-${triangleSize}`,
    left: `left-full top-1/2 -translate-y-1/2 border-l-gray-800 border-l-${triangleSize} border-t-transparent border-t-${triangleSize} border-b-transparent border-b-${triangleSize}`,
    right: `right-full top-1/2 -translate-y-1/2 border-r-gray-800 border-r-${triangleSize} border-t-transparent border-t-${triangleSize} border-b-transparent border-b-${triangleSize}`
  }

  return (
    <div
      className="relative inline-block w-full"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-50 bg-gray-800 text-white text-xs px-3 py-2 rounded shadow-lg whitespace-nowrap
            ${positionClasses[position]} ${className}`}
        >
          {tooltip}
          <div className={`absolute w-0 h-0 z-10 ${triangleClasses[position]}`}/>
        </div>
      )}
    </div>
  )
}
