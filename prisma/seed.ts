import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

const userData: Prisma.UserCreateInput[] = [
  {
    password: 'AGoodStrongPassword',
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
  {
    password: 'AnotherStrongPassword'
  }
]

export async function main() {
  for (const u of userData) {
    await prisma.user.create({ data: u })
  }
}

main()