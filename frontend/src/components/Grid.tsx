import type { HTMLAttributes } from 'react'
import { tailwindCombine } from '@/util/tailwind'

export type GridProps = HTMLAttributes<HTMLDivElement> & {
  rowCount?: number,
  colCount?: number
}

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
