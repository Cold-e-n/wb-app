import * as React from 'react'
import { cn } from '@/lib/utils'
import { useTheme, Theme } from '@/providers/theme-provider'

import { Button } from './ui/button'
import { Sun, Moon, Monitor } from 'lucide-react'

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme()
  const themes: Theme[] = ['system', 'light', 'dark']

  const getNextTheme = (currentTheme: Theme): Theme => {
    const currentIndex = themes.indexOf(currentTheme)
    const nextIndex = (currentIndex + 1) % themes.length
    return themes[nextIndex]
  }

  const handleToggle = () => {
    setTheme(getNextTheme(theme))
  }

  const CurrentIcon = React.useMemo(() => {
    if (theme === 'light') {
      return Sun
    } else if (theme === 'dark') {
      return Moon
    } else {
      return Monitor
    }
  }, [theme])

  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <Button variant="ghost" size="icon" disabled />
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className={cn('cursor-pointer h-8 w-8 rounded-full')}
    >
      <CurrentIcon
        className={cn(
          'h-[1.2rem] w-[1.2rem] transition-all duration-150 ease-in-out rotate-0 scale-100',
        )}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
