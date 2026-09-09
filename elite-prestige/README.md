# ELITE PRESTIGE — Site + back-office

Application Next.js : site public (catalogue, filtres, tri, réservation)
+ espace collaborateur avec comptes, rôles et permissions.

## En local

1. `npm install`
2. Copier `.env.example` en `.env` et renseigner `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_PASSWORD`
3. `npx prisma migrate dev --name init`
4. `npm run db:seed` (crée les rôles Admin / Manager / Collaborateur + le compte `admin`)
5. `npm run dev` puis ouvrir http://localhost:3000 et http://localhost:3000/login

## Rôles par défaut

- **Admin** : tous les droits (véhicules, comptes, rôles, réservations)
- **Manager** : gère les véhicules et voit les réservations
- **Collaborateur** : consultation uniquement

L'Admin peut créer d'autres rôles depuis `/admin/roles` en cochant librement
les permissions à donner.

## Déploiement (Vercel + GitHub)

Voir les instructions détaillées données dans la conversation.
