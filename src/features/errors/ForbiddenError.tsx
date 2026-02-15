import { Link, useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { MoveLeft } from 'lucide-react'

const ForbiddenError = () => {
  const router = useRouter()

  return (
    <div className="h-svh font-mono">
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        <h1 className="text-[7rem] leading-tight font-bold">403</h1>
        <span className="font-medium">Oops! Forbidden!</span>
        <p className="text-muted-foreground text-center">
          Kamu enggak punya akses buat ngeliat resource halaman ini.
        </p>
        <div className="mt-6 flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.history.go(-1)}
            className="cursor-pointer"
          >
            Go Back
          </Button>

          <Button asChild>
            <Link to="/">
              <MoveLeft />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export { ForbiddenError }
