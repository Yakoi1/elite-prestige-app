import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PERMISSIONS } from "../lib/permissions";

const prisma = new PrismaClient();

async function main() {
  // Le rôle Admin est resynchronisé à chaque seed pour toujours avoir
  // l'intégralité des permissions, y compris celles ajoutées plus tard
  // (ex: yacht.view / yacht.edit). Les autres rôles ne sont créés
  // qu'une seule fois : leurs permissions restent ensuite modifiables
  // uniquement depuis /admin/roles, sans être écrasées par le seed.
  const adminRole = await prisma.role.upsert({
    where: { name: "Admin" },
    update: { permissions: Object.values(PERMISSIONS) },
    create: {
      name: "Admin",
      isSystem: true,
      permissions: Object.values(PERMISSIONS)
    }
  });

  await prisma.role.upsert({
    where: { name: "Manager" },
    update: {},
    create: {
      name: "Manager",
      permissions: [
        PERMISSIONS.VEHICLES_VIEW,
        PERMISSIONS.VEHICLES_EDIT,
        PERMISSIONS.YACHT_VIEW,
        PERMISSIONS.YACHT_EDIT,
        PERMISSIONS.RESERVATIONS_VIEW,
        PERMISSIONS.INVOICES_VIEW,
        PERMISSIONS.INVOICES_CREATE,
        PERMISSIONS.DASHBOARD_VIEW
      ]
    }
  });

  await prisma.role.upsert({
    where: { name: "Collaborateur" },
    update: {},
    create: {
      name: "Collaborateur",
      permissions: [
        PERMISSIONS.VEHICLES_VIEW,
        PERMISSIONS.YACHT_VIEW,
        PERMISSIONS.RESERVATIONS_VIEW,
        PERMISSIONS.INVOICES_VIEW,
        PERMISSIONS.INVOICES_CREATE
      ]
    }
  });

  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMoi123!";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash,
      roleId: adminRole.id,
      mustChangePassword: true
    }
  });

  const vehicleCount = await prisma.vehicle.count();
  if (vehicleCount === 0) {
    await prisma.vehicle.createMany({
      data: [
        { name: "Volatus", category: "air", categoryLabel: "Aérien", model: "VOLATUS", imageUrl: "https://cdn.fivemetstore.com/carros/volatus.png", price: 25000, priceLabel: "25 000$ / 24h", durationLabel: "24h" },
        { name: "Swift Deluxe", category: "air", categoryLabel: "Aérien", model: "SWIFT2", imageUrl: "https://cdn.fivemetstore.com/carros/swift2.png", price: 20000, priceLabel: "20 000$ / 24h", durationLabel: "24h" },
        { name: "Shamal", category: "air", categoryLabel: "Aérien", model: "SHAMAL", imageUrl: "https://cdn.fivemetstore.com/carros/shamal.png", price: 25000, priceLabel: "25 000$ / 24h", durationLabel: "24h" },
        { name: "Vestra", category: "air", categoryLabel: "Aérien", model: "VESTRA", imageUrl: "https://cdn.fivemetstore.com/carros/vestra.png", price: 15000, priceLabel: "15 000$ / 24h", durationLabel: "24h" },
        { name: "Thrax", category: "land", categoryLabel: "Terrestre", model: "THRAX", imageUrl: "https://cdn.fivemetstore.com/carros/thrax.png", price: 50000, priceLabel: "50 000$ / 24h", durationLabel: "24h" },
        { name: "Entity MT", category: "land", categoryLabel: "Terrestre", model: "ENTITY3", imageUrl: "https://cdn.fivemetstore.com/carros/entity3.png", price: 35000, priceLabel: "35 000$ / 24h", durationLabel: "24h" },
        { name: "Virtue", category: "land", categoryLabel: "Terrestre", model: "VIRTUE", imageUrl: "https://cdn.fivemetstore.com/carros/virtue.png", price: 20000, priceLabel: "20 000$ / 24h", durationLabel: "24h" }
      ]
    });
  }

  // Configurateur Yacht : on pose la structure de départ (forfaits + catégories
  // d'options avec leurs prix), mais SANS choix précis dans "Couleur" / "Drapeau" —
  // ces images sont propres à l'entreprise et s'ajoutent depuis /admin/yacht.
  const packageCount = await prisma.yachtPackage.count();
  if (packageCount === 0) {
    await prisma.yachtPackage.createMany({
      data: [
        { label: "Prix basique", price: 100000, imageUrl: "", sortOrder: 0 },
        { label: "Prix second", price: 150000, imageUrl: "", sortOrder: 1 }
      ]
    });
  }

  const categoryCount = await prisma.yachtOptionCategory.count();
  if (categoryCount === 0) {
    await prisma.yachtOptionCategory.createMany({
      data: [
        { key: "couleur", label: "Couleur", description: "Choisissez la teinte de la coque de votre Yacht.", type: "choice", multiple: false, price: 20000, sortOrder: 0 },
        { key: "drapeau", label: "Drapeau", description: "Le pavillon affiché à l'arrière du Yacht.", type: "choice", multiple: false, price: 15000, imageAspect: "square", sortOrder: 1 },
        { key: "texte", label: "Texte", description: "Le texte qui sera inscrit sur la coque.", type: "text", multiple: false, price: 10000, sortOrder: 2 },
        { key: "sous-texte", label: "Sous Texte", description: "Une mention secondaire affichée sous le texte principal.", type: "text", multiple: false, price: 10000, sortOrder: 3 },
        { key: "lumieres", label: "Lumières", description: "L'ambiance lumineuse du Yacht.", type: "choice", multiple: false, price: 12000, sortOrder: 4 },
        { key: "options", label: "Options", description: "Ajoutez les équipements de votre choix (cumulables).", type: "choice", multiple: true, price: 0, sortOrder: 5 }
      ]
    });
  }

  console.log("Seed terminé.");
  console.log("Identifiant admin : admin");
  console.log("Mot de passe admin :", adminPassword);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
