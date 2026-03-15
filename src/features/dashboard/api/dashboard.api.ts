import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/db'

export const getDashboardStats = createServerFn({
  method: 'GET',
}).handler(async () => {
  try {
    const [
      totalFabrics,
      fabricsWithColor,
      totalColors,
      totalColorLayouts,
      totalColorPositions,
      recentColorPositions,
    ] = await Promise.all([
      prisma.fabric.count(),
      prisma.fabric.count({ where: { hasColor: true } }),
      prisma.color.count(),
      prisma.colorLayout.count(),
      prisma.colorPosition.count(),
      prisma.colorPosition.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          wbNo: true,
          createdAt: true,
          fabric: {
            select: { id: true, name: true },
          },
        },
      }),
    ])

    return {
      totalFabrics,
      fabricsWithColor,
      fabricsWithoutColor: totalFabrics - fabricsWithColor,
      totalColors,
      totalColorLayouts,
      totalColorPositions,
      recentColorPositions,
    }
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error)
    throw new Error('Gagal mengambil data dashboard.')
  }
})
