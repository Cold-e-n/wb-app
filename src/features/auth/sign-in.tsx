import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { SignInForm } from './components/sign-in-form'

export const SignIn = () => {
  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-lg tracking-tight">Sign In</CardTitle>
        <CardDescription>
          Masukkin username sama password kamu buat sign in.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <SignInForm />
      </CardContent>
    </Card>
  )
}
