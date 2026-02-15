import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'

import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

import { Loader2, LogIn } from 'lucide-react'
import { PasswordInput } from '@/components/password-input'

export const SignInForm = ({
  className,
}: React.HTMLAttributes<HTMLFormElement>) => {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const formSchema = z.object({
    username: z.string().min(1, 'Masukkin username kamu.'),
    password: z.string().min(6, {
      message: 'Password minimal harus 6 karakter.',
    }),
  })

  type FormData = z.infer<typeof formSchema>

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const handleSubmit = () => {
    setIsLoading(true)

    toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
      loading: 'Signing in...',
      success: () => {
        setIsLoading(false)
        navigate({ to: '/dashboard', replace: true })
        return 'Welcome back!'
      },
      error: 'Error',
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn('grid gap-3', className)}
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Masukkin username kamu..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder="Masukkin password kamu..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end -mt-1">
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground hover:opacity-75"
          >
            Lupa password?
          </Link>
        </div>

        <Separator className="my-2" />

        <Button type="submit" disabled={isLoading} className="mt-2">
          {isLoading ? <Loader2 className="animate-spin" /> : <LogIn />}
          Login
        </Button>
      </form>
    </Form>
  )
}
