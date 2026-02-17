import * as React from 'react'
import { cn } from '@/lib/utils'

import { SidebarTrigger } from '../ui/sidebar'
import { Separator } from '../ui/separator'
import { ThemeSwitcher } from '../theme-switcher'

type AppHeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
}

export const AppHeader = ({ className, fixed, ...props }: AppHeaderProps) => {
  const [offset, setOffset] = React.useState(0)

  React.useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop)
    }

    document.addEventListener('scroll', onScroll, { passive: true })

    return () => document.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'z-50 h-16 transition-shadow duration-300 border-b',
        fixed && 'header-fixed peer/header sticky top-0 w-[inherit]',
        offset > 10 && fixed ? 'shadow' : 'shadow-none',
        'no-print',
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          'relative flex h-full items-center gap-3 p-4 sm:gap-4 transition-all duration-300',
          offset > 10 &&
            fixed &&
            'after:bg-background/20 after:absolute after:inset-0 after:-z-10 after:backdrop-blur-lg',
        )}
      >
        <SidebarTrigger
          variant="outline"
          className={cn('cursor-pointer max-md:scale-125')}
        />
        <Separator orientation="vertical" className="h-6" />

        <div className="ms-auto flex items-center space-x-1">
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  )
}
