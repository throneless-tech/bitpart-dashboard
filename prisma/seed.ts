const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
import bcrypt from "bcryptjs"

async function main() {
  const alice = await prisma.user.create({
    data: {
      password: await bcrypt.hash('a-unique-invite-code', 10),
      bots: {
        create: [
          {
            botType: 'broadcast',
            botName: 'My Broadcast Bot',
            phone: '555-123-4567',
            countryCode: '1',
            name: 'Broadcast List Name',
          },
          {
            botType: 'helpdesk',
            botName: 'My Helpdesk Bot',
            phone: '555-123-4568',
            countryCode: '1',
            name: 'Helpdesk Name',
          },
        ],
      },
    },
  })

  const bob = await prisma.user.create({
    data: {
      password: await bcrypt.hash('another-unique-code', 10),
    },
  })
  
  const alicesAccount = await prisma.account.create({
    data: {
      userId: alice.id,
      type: 'credentials',
      provider: 'credentials',
      providerAccountId: alice.id
    }
  })

  const bobsAccount = await prisma.account.create({
    data: {
      userId: bob.id,
      type: 'credentials',
      provider: 'credentials',
      providerAccountId: bob.id
    }
  })
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
