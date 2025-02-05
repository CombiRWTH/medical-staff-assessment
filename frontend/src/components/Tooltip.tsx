import type { PropsWithChildren, ReactNode } from 'react'
import React, { useState } from 'react'

type Position = 'top' | 'bottom' | 'left' | 'right'

export type TooltipProps = PropsWithChildren<{
  tooltip: string | ReactNode,
  tooltipClassName?: string,
  containerClassName?: string,
  position?: Position
}>

/**
 * A tool tip component that shows a tooltip when hovered over
 * @param tooltip The tooltip text
 * @param children The content on which the tooltip is displayed
 * @param tooltipClassName Style Overwrite of the tooltip
 * @param containerClassName Style Overwrite of the container holding both tooltip and content
 * @param position The direction in which the tooltip is displayed
 * @constructor
 */
export const Tooltip = ({
  tooltip,
  children,
  tooltipClassName = '',
  containerClassName = '',
  position = 'top'
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false)

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  }

  const triangleSize = 6
  const triangleClasses = {
    top: `top-full left-1/2 -translate-x-1/2 border-t-gray-800 border-l-transparent border-r-transparent`,
    bottom: `bottom-full left-1/2 -translate-x-1/2 border-b-gray-800 border-l-transparent border-r-transparent`,
    left: `left-full top-1/2 -translate-y-1/2 border-l-gray-800 border-t-transparent border-b-transparent`,
    right: `right-full top-1/2 -translate-y-1/2 border-r-gray-800 border-t-transparent border-b-transparent`
  }

  const triangleStyle: Record<Position, React.CSSProperties> = {
    top: { borderWidth: `${triangleSize}px ${triangleSize}px 0 ${triangleSize}px` },
    bottom: { borderWidth: `0 ${triangleSize}px ${triangleSize}px ${triangleSize}px` },
    left: { borderWidth: `${triangleSize}px 0 ${triangleSize}px ${triangleSize}px` },
    right: { borderWidth: `${triangleSize}px ${triangleSize}px ${triangleSize}px 0` }
  }

  return (
    <div
      className={`relative inline-block w-full ${containerClassName}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-50 bg-gray-800 text-white text-xs px-3 py-2 rounded shadow-lg whitespace-nowrap
            ${positionClasses[position]} ${tooltipClassName} animate-fade-in`}
        >
          {tooltip}
          <div className={`absolute w-0 h-0 z-10 ${triangleClasses[position]} ${isVisible ? '' : 'hidden'}`}
               style={triangleStyle[position]}/>
        </div>
      )
      }
    </div>
  )
}
