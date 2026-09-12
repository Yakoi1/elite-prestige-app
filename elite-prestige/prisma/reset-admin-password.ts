import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const newPassword = process.env.ADMIN_PASSWORD || "ChangeMoi123!";
  const passwordHash = await bcrypt.hash(newPassword, 10);

  const user = await prisma.user.update({
    where: { username: "admin" },
    data: { passwordHash, mustChangePassword: true }
  });

  console.log("Mot de passe du compte admin réinitialisé avec succès.");
  console.log("Identifiant :", user.username);
  console.log("Nouveau mot de passe :", newPassword);
}

main()
  .catch((e) => {
    console.error("Erreur :", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
