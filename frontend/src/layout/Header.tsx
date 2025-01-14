import type { PropsWithChildren, ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export const DefaultHeader = () => {
  return (
    <Link className="flex flex-row gap-x-2 items-center" href="/">
      <Image alt="logo" src="/favicon.png" width={64} height={64} className="min-w-[64px] min-h-[64px]"/>
      <span className="font-bold text-3xl">PPBV</span>
    </Link>
  )
}

export type HeaderProps = PropsWithChildren<{
  start?: ReactNode,
  end?: ReactNode,
  className?: string
}>

export const Header = ({
  children,
  start = (<DefaultHeader/>),
  end,
  className
}: HeaderProps) => {
  return (
    <div
      className={`flex flex-row justify-between items-center h-[96px] p-4 w-full bg-container z-50 shadow ${className}`}>
      {start}
      {children}
      {end}
    </div>
  )
}
