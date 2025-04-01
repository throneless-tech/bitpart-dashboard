const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
import bcrypt from "bcryptjs"

async function main() {
  const alice = await prisma.user.create({
    data: {
      username: 'alice.blue',
      password: await bcrypt.hash('AVeryGoodStrongPassword', 10),
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
      username: 'bob.red',
      password: await bcrypt.hash('AnotherGoodStrongPassword', 10),
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

  const inviteCodes = await prisma.inviteCode.createMany({
    data: [
      { code: 'a-unique-invite-code' },
      { code: 'another-unique-code' },
    ],
    skipDuplicates: true,
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
