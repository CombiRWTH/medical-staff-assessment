import type { PropsWithChildren, ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'

/**
 * The default start component of a header for this application showing the logo and the name
 */
export const DefaultHeaderStart = () => {
  return (
    <Link className="flex flex-row gap-x-2 items-center" href="/">
      <Image alt="logo" src="/favicon.png" width={64} height={64} className="min-w-[64px] min-h-[64px]"/>
      <span className="font-bold text-3xl">PPBV</span>
    </Link>
  )
}

export type HeaderProps = PropsWithChildren<{
  /**
   * The node to start the header with
   */
  start?: ReactNode,
  /**
   * The node to place at the end of the header
   */
  end?: ReactNode,
  /**
   * Overwrite for styling
   */
  className?: string
}>

/**
 * The header component
 * @param children The node in the middle of the header
 * @param start The node to start the header with
 * @param end The node to place at the end of the header
 * @param className Overwrite for styling
 */
export const Header = ({
  children,
  start = (<DefaultHeaderStart/>),
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
