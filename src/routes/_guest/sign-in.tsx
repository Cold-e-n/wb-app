import { createFileRoute } from '@tanstack/react-router'
import { SignIn } from '@/features/auth/sign-in'

export const Route = createFileRoute('/_guest/sign-in')({
  head: () => ({
    meta: [
      {
        title: `Sign In | ${import.meta.env.VITE_APP_NAME}`,
      },
    ],
  }),
  component: SignIn,
})
