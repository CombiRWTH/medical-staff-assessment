import type { PropsWithChildren } from 'react'

export type SidebarProps = PropsWithChildren<{
  className?: string
}>
export const Sidebar = ({ children, className }: SidebarProps) => {
  return (
    <div className={`flex flex-col gap-y-2 bg-container ${className}`}>
      {children}
    </div>
  )
}
