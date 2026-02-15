import { StrictMode } from 'react'
import { TanStackDevtools } from '@tanstack/react-devtools'
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import type { QueryClient } from '@tanstack/react-query'

import appCss from '../styles/default.css?url'

import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '../providers/theme-provider'
import { NotFoundError } from '@/features/errors/NotFoundError'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        {
          charSet: 'utf-8',
        },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
        {
          title: import.meta.env.APP_NAME,
        },
      ],
      links: [
        {
          rel: 'stylesheet',
          href: appCss,
        },
      ],
    }),

    shellComponent: RootComponent,
    notFoundComponent: NotFoundError,
  },
)

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="scroll-smooth"
      suppressHydrationWarning
      data-theme="system"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var storageKey = 'vite-ui-theme';
                var defaultTheme = 'system';
                try {
                  var theme = localStorage.getItem(storageKey) || defaultTheme;
                  var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

                  var root = document.documentElement;
                  root.classList.remove('light', 'dark');

                  if (theme === 'system') {
                    root.classList.add(systemTheme);
                  } else {
                    root.classList.add(theme);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <script
          crossOrigin="anonymous"
          src="https://tweakcn.com/live-preview.min.js"
        />
        <HeadContent />
      </head>
      <body>
        <StrictMode>
          <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            {children}
            <TanStackDevtools
              config={{
                position: 'bottom-right',
              }}
              plugins={[
                {
                  name: 'Tanstack Router',
                  render: <TanStackRouterDevtoolsPanel />,
                },
                {
                  name: 'React Query',
                  render: <ReactQueryDevtoolsPanel />,
                },
              ]}
            />
          </ThemeProvider>
        </StrictMode>

        <Scripts />
        <Toaster position="bottom-right" closeButton />
      </body>
    </html>
  )
}
