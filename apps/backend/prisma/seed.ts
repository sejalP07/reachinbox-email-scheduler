import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const user = await prisma.user.upsert({
    where: {
      email: "demo@reachinbox.local",
    },
    update: {},
    create: {
      googleId: "development-user",
      name: "Demo User",
      email: "demo@reachinbox.local",
    },
  });

  const sender = await prisma.sender.upsert({
    where: {
      userId_email: {
        userId: user.id,
        email: "sender@ethereal.email",
      },
    },
    update: {},
    create: {
      userId: user.id,
      email: "sender@ethereal.email",
      name: "ReachInbox Demo",
    },
  });

  console.log("\n✅ Development user created");
  console.log("USER_ID:", user.id);
  console.log("SENDER_ID:", sender.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });