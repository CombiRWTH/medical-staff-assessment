import type { HTMLAttributes } from 'react'
import { tailwindCombine } from '@/util/tailwind'

export type GridProps = HTMLAttributes<HTMLDivElement> & {
  rowCount?: number,
  colCount?: number
}

/**
 * @param children The content
 * @param className Overwrite of the Styling
 * @param rowCount The number of rows
 * @param colCount The number of columns
 * @param restProps Overwrites for HTMLDivElement Props
 * @constructor
 */
export const Grid = ({
  children,
  className,
  rowCount,
  colCount,
  ...restProps
}: GridProps) => {
  return (
    <div
      {...restProps}
      className={tailwindCombine(`grid gap-2 w-full`,
        className
      )}
      style={{
        gridTemplateColumns: colCount !== undefined ? `repeat(${colCount}, minmax(0, 1fr))` : '',
        gridTemplateRows: rowCount !== undefined ? `repeat(${rowCount}, minmax(0, 1fr))` : '',
      }}
    >
      {children}
    </div>
  )
}
