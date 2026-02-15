import { PropsWithChildren } from 'react'
import { Package } from 'lucide-react'

export const AuthLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="container grid h-svh max-w-none items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:w-[480px] sm:p-8">
        <div className="mb-4 flex items-center justify-center">
          <Package className="me-2" />
          <h1 className="text-xl text-medium">
            {import.meta.env.VITE_APP_NAME}
          </h1>
        </div>
        {children}
      </div>
    </div>
  )
}
