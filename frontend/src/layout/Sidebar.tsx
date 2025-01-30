import type { PropsWithChildren } from 'react'

export type SidebarProps = PropsWithChildren<{
  className?: string
}>

/**
 * @param children Content of the Sidebar
 * @param className Styling overwrite
 */
export const Sidebar = ({
  children,
  className
}: SidebarProps) => {
  return (
    <div className={`flex flex-col gap-y-2 bg-container ${className}`}>
      {children}
    </div>
  )
}
