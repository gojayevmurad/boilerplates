import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
// change the number of rounds to your needs
const bcryptHashRounds = 12;

async function seed() {
  await prisma.user.createMany({
    data: [
      {
        email: 'seed1@gmail.com',
        name: 'seed1',
        password: await bcrypt.hash('seed1', bcryptHashRounds),
        birthDate: new Date('1990-01-01'),
        surname: 'seed1',
        isBlocked: true,
      },
      {
        email: 'seed2@gmail.com',
        name: 'seed2',
        password: await bcrypt.hash('seed2', bcryptHashRounds),
        birthDate: new Date('1990-01-01'),
        surname: 'seed2',
        isVerified: true,
      },
      {
        email: 'seed3@gmail.com',
        name: 'seed3',
        password: await bcrypt.hash('seed3', bcryptHashRounds),
        birthDate: new Date('1990-01-01'),
        surname: 'seed3',
      },
      {
        email: 'seed4@gmail.com',
        name: 'seed4',
        password: await bcrypt.hash('seed4', bcryptHashRounds),
        birthDate: new Date('1990-01-01'),
        surname: 'seed4',
      },
      {
        email: 'seed5@gmail.com',
        name: 'seed5',
        password: await bcrypt.hash('seed5', bcryptHashRounds),
        birthDate: new Date('1990-01-01'),
        surname: 'seed5',
      },
    ],
  });
}

seed()
  .then(() => {
    console.log('Successfully');
  })
  .catch((err) => {
    console.log(err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
