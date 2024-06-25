// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function reset() {
  await prisma.$transaction([
    prisma.confirmationToken.deleteMany(),
    prisma.session.deleteMany(),
    prisma.step.deleteMany(),
    prisma.target.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

reset()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
