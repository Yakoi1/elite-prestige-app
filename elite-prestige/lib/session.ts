import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Comme auth(), mais relit le rôle et les permissions directement en base
 * à chaque appel, au lieu de se fier au JWT figé au moment de la connexion.
 * Utile pour que les changements de rôle prennent effet immédiatement,
 * sans que l'utilisateur ait besoin de se déconnecter/reconnecter.
 */
export async function getSessionWithFreshPermissions() {
  const session = await auth();
  if (!session?.user) return session;

  const userId = (session.user as any).id as string | undefined;
  if (!userId) return session;

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true }
  });
  if (!dbUser) return session;

  return {
    ...session,
    user: {
      ...session.user,
      role: dbUser.role.name,
      permissions: dbUser.role.permissions,
      mustChangePassword: dbUser.mustChangePassword
    }
  };
}
