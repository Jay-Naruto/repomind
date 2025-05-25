import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const cutoff = new Date(Date.now() - 1000 * 60 * 60); 

  await prisma.sourceCodeEmbedding.deleteMany({
    where: {
      project: {
        createdAt: { lt: cutoff },
      },
    },
  });

  await prisma.project.deleteMany({
    where: {
      createdAt: { lt: cutoff },
    },
  });

  console.log("✅ Cleaned up old projects and embeddings.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
