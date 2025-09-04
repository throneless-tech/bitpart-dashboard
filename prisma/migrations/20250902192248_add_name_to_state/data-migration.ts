import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.$transaction(async (tx) => {
    const thisState = await tx.state.upsert({
      where: {
        id: 1,
      },
      update: {
        name: "default"
      },
      create: {
        name: "default"
      }
    })
  })
}

main()
  .catch(async (e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => await prisma.$disconnect())