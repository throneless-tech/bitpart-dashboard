import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.$transaction(async (tx) => {
    const bots = await tx.bot.findMany()
    for (const bot of bots) {
      await tx.bot.update({
        where: { id: bot.id },
        data: {
          instance: "default",
        },
      })
    }
  })
}

main()
  .catch(async (e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => await prisma.$disconnect())