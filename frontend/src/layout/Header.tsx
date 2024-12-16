import type { PropsWithChildren, ReactNode } from 'react'

export const DefaultHeader = () => {
  return (
    <div className="flex flex-row gap-x-2 items-center">
      <div className="rounded-full min-w-[64px] min-h-[64px] bg-primary"/>
      <span className="font-bold text-3xl">PPBV</span>
    </div>
  )
}

export type HeaderProps = PropsWithChildren<{
  start?: ReactNode,
  end?: ReactNode
}>

export const Header = ({
  children,
  start = (<DefaultHeader/>),
  end
}: HeaderProps) => {
  return (
    <div className="flex flex-row justify-between items-center h-[96px] p-4 w-full bg-container z-10 shadow">
      {start}
      {children}
      {end}
    </div>
  )
}
