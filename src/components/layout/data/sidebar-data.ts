import {
  AlignHorizontalJustifyCenter,
  Blocks,
  ClipboardList,
  LayoutGrid,
  Palette,
  Scroll,
} from 'lucide-react'

export type SidebarDataType = {
  title: string
  href: string
  icon?: React.ElementType
}

export type SidebarGroupType = {
  title: string
  items: SidebarDataType[]
}

export const sidebarData: SidebarGroupType[] = [
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
        title: 'Benang Warna',
        href: '/color',
        icon: Palette,
      },
      {
        title: 'Kain',
        href: '/fabrics',
        icon: Scroll,
      },
      {
        title: 'Layout Benang Warna',
        href: '/color-layouts',
        icon: AlignHorizontalJustifyCenter,
      },
    ],
  },
  {
    title: 'Production',
    items: [
      {
        title: 'Posisi Benang Warna',
        href: '/color-positions',
        icon: Blocks,
      },
    ],
  },
  {
    title: 'Reports',
    items: [
      {
        title: 'Laporan Harian',
        href: '/daily-report',
        icon: ClipboardList,
      },
    ],
  },
]
