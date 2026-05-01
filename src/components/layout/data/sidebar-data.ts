import {
  AlignHorizontalJustifyCenter,
  Blocks,
  Cog,
  LayoutGrid,
  Palette,
  Scroll,
  Volleyball,
} from 'lucide-react'

export type SidebarDataType = {
  title: string
  href: string
  icon?: React.ElementType
}

export type SidebarGroupType = {
  title: string
  items: Array<SidebarDataType>
}

export const sidebarData: Array<SidebarGroupType> = [
  {
    title: 'Overview',
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
      },
    ],
  },
  {
    title: 'General',
    items: [
      {
        title: 'Benang',
        href: '/yarns',
        icon: Volleyball,
      },
      {
        title: 'Kain',
        href: '/fabrics',
        icon: Scroll,
      },
      {
        title: 'Mesin Weaving',
        href: '/weaving-machines',
        icon: Cog,
      },
    ],
  },
  {
    title: 'Warping/Beaming',
    items: [
      {
        title: 'Benang Warna',
        href: '/color',
        icon: Palette,
      },
      {
        title: 'Layout Benang Warna',
        href: '/color-layouts',
        icon: AlignHorizontalJustifyCenter,
      },
      {
        title: 'Posisi Benang Warna',
        href: '/color-positions',
        icon: Blocks,
      },
    ],
  },
]
