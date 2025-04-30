const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
import bcrypt from "bcryptjs"

async function main() {
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
