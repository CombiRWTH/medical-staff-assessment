import Link from 'next/link'
import { useRouter } from 'next/router'

export type LinkTileType = {
  url: string,
  name: string
}

export type LinkTilesProps = {
  links: LinkTileType[]
}

export const LinkTiles = ({ links }: LinkTilesProps) => {
  const router = useRouter()

  return (
    <div className="flex flex-col">
      {links.map((link, index) => (
        <Link key={index} href={link.url}
              className={`px-4 py-2 w-full hover:bg-primary/50 ${router.pathname === link.url ? 'bg-primary/30' : ''}`}>
          {link.name}
        </Link>
      ))}
    </div>
  )
}
