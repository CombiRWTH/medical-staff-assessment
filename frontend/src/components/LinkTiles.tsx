import Link from 'next/link'
import { useRouter } from 'next/router'

export type LinkTileType = {
  url: string,
  name: string
}

export type LinkTilesProps = {
  links: LinkTileType[]
}

/**
 * A chain of links in the form of breadcrumbs e.g. /path/subpath/subsubpath
 * @param links Links of the breadcrumb
 */
export const LinkTiles = ({ links }: LinkTilesProps) => {
  const router = useRouter()

  return (
    <div className="flex flex-row gap-x-4">
      {links.map((link, index) => (
        <Link key={index} href={link.url}
              className={`text-xl font-semibold w-full hover:text-primary ${router.pathname === link.url ? 'text-primary/80 underline underline-primary/80 underline-offset-2 decoration-2' : ''}`}>
          {link.name}
        </Link>
      ))}
    </div>
  )
}
