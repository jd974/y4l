import bcrypt from "bcryptjs";
import { prisma } from "./lib/prisma.js";
import { env } from "./lib/env.js";

async function main() {
  const adminEmail = env.ADMIN_EMAIL;

  const adminPass = "Admin123!";
  const creatorPass = "Creator123!";

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      username: "admin",
      passwordHash: await bcrypt.hash(adminPass, 10),
      role: "ADMIN",
      streamKey: "admin-stream",
    },
  });

  const creator = await prisma.user.upsert({
    where: { email: "creator@yours4live.local" },
    update: {},
    create: {
      email: "creator@yours4live.local",
      username: "creator",
      passwordHash: await bcrypt.hash(creatorPass, 10),
      role: "CREATOR",
      streamKey: "creator-stream",
    },
  });

  console.log("Seeded:");
  console.log("Admin:", admin.email, "pass:", adminPass);
  console.log("Creator:", creator.email, "pass:", creatorPass);
}

main().then(() => prisma.$disconnect()).catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
