import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export const getProvider = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
      },
    },
  })

  return { queryClient }
}

export const RootProvider = ({
  children,
  queryClient,
}: {
  children: React.ReactNode
  queryClient: QueryClient
}) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
