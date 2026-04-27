import { Link } from '@tanstack/react-router'
import { ArrowRight, Inbox } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import { useDashboardStats } from '../hooks/use-dashboard'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export const RecentPositions = () => {
  const { data } = useDashboardStats()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Posisi Warna Terbaru</CardTitle>
        <CardDescription>
          5 posisi warna yang terakhir ditambahkan
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.recentColorPositions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
            <Inbox className="h-8 w-8" />
            <p className="text-sm">Belum ada data posisi warna</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.recentColorPositions.map((pos, idx) => (
              <div key={pos.id}>
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 space-y-0.5">
                    <Link
                      to="/color-positions/$colorPositionId"
                      params={{ colorPositionId: pos.id }}
                      className="block truncate text-sm font-medium hover:underline"
                    >
                      {pos.fabric.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      WB: {pos.wbNo}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDistanceToNow(
                      new Date(pos.createdAt as unknown as string),
                      {
                        addSuffix: true,
                        locale: id,
                      },
                    )}
                  </span>
                </div>
                {idx < data.recentColorPositions.length - 1 && (
                  <Separator className="mt-3" />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t">
          <Link
            to="/color-positions"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Lihat semua posisi warna <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
