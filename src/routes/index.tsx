import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  throw redirect({ to: '/dashboard' })
}
