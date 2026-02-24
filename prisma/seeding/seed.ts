import { prisma } from '../src/db'

const main = async () => {
  console.log('Seeding started...')
  const data = [
    '20/2 RED',
    '20/2 BLACK',
    '20/2 GREEN',
    '20/2 YELLOW',
    '50/6 RED',
    '60/2 BLACK',
    '60/2 GREEN',
    '60/6 GREEN',
    '60/4 RED',
    '20/4 RED',
    '20/4 GREEN',
    '16.4/2 ROYAL BLUE',
    '16/2 GREEN',
    '16/2 AC GREEN',
    '16/2 AC BLACK',
    '16/2 GREY',
    '30/2 GREEN',
    '30/2 TR GREEN',
    '30/2 BLACK',
    '30/2 GREEN',
    '30/2 TR RED',
    '20/3 GREEN',
    '20/3 RED',
    '20/3 ROYAL BLUE',
    '20/2 GREY',
    '20/2 TURQOISE BLUE',
    '60/6 RED',
    '20/2 AC BROWN',
    '30/2 AC BROWN',
  ]

  const createSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\//g, '-')
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const colors = [...data].sort().map((name) => ({
    name,
    slug: createSlug(name),
  }))

  console.log('Inserting colors:', colors)

  const result = await prisma.color.createMany({
    data: colors,
    skipDuplicates: true,
  })

  console.log('Seeding finished successfully!', result)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Seeding error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
