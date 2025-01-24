import type { PropsWithChildren, ReactNode } from 'react'

export type PageProps = PropsWithChildren<{
  header?: ReactNode,
  sideBar?: ReactNode,
  className?: string
}>

/**
 * A component for a page layout with header, sidebar and content
 * @param header The header of the page
 * @param sideBar The sidebar of the page
 * @param children The content of the page
 * @param className A classname to overwrite the default styling
 * @constructor
 */
export const Page = ({
  header,
  sideBar,
  children,
  className,
}: PageProps) => {
  return (
    <div className="flex flex-col w-screen h-screen justify-start items-start">
      {header}
      <div className="flex flex-row w-full flex-1 overflow-hidden">
        {sideBar}
        <main
          className={`flex flex-col w-full overflow-x-auto overflow-y-scroll items-center justify-start ${className}`}>
          {children}
        </main>
      </div>
    </div>
  )
}
