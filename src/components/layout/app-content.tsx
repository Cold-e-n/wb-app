import { cn } from '@/lib/utils'

type AppContentProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
  fluid?: boolean
}

export const AppContent = ({
  fixed,
  fluid,
  className,
  children,
  ...props
}: AppContentProps) => {
  return (
    <main
      data-layout={fixed ? 'fixed' : 'auto'}
      className={cn(
        'px-4 py-6 print:p-0',
        fixed && 'flex grow flex-col overflow-hidden',
        !fluid &&
          '@7xl/content:mx-auto @7xl/content:w-full @7xl/content:max-w-7xl',
        className,
      )}
      {...props}
    >
      {children}
    </main>
  )
}
