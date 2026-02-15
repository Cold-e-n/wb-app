import { Outlet } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

import { SidebarInset, SidebarProvider } from '../ui/sidebar'

import { AppHeader } from './app-header'
import { AppSidebar } from './app-sidebar'
import { AppContent } from './app-content'

export const AuthenticatedLayout = ({
  defaultOpen,
}: {
  defaultOpen: boolean
}) => {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />

      <SidebarInset
        className={cn(
          // Set content container, so we can use container queries
          '@container/content',

          // If layout is fixed, set the height
          // to 100svh to prevent overflow
          'has-data-[layout=fixed]:h-svh',

          // If layout is fixed and sidebar is inset,
          // set the height to 100svh - spacing (total margins) to prevent overflow
          'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]',
        )}
      >
        <AppHeader fixed />
        <AppContent>
          <Outlet />
        </AppContent>
      </SidebarInset>
    </SidebarProvider>
  )
}
