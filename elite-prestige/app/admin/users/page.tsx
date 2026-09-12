import { getSessionWithFreshPermissions } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";
import { createUser, updateUserRole, resetUserPassword, deleteUser } from "./actions";

export default async function UsersPage() {
  const session = await getSessionWithFreshPermissions();
  const perms = (session?.user as any)?.permissions as string[];
  if (!hasPermission(perms, PERMISSIONS.USERS_MANAGE)) redirect("/admin");

  const [users, roles] = await Promise.all([
    prisma.user.findMany({ include: { role: true }, orderBy: { createdAt: "asc" } }),
    prisma.role.findMany({ orderBy: { name: "asc" } })
  ]);

  return (
    <div>
      <h1 className="font-jost text-xl tracking-[0.1em] uppercase mb-8">Comptes collaborateurs</h1>

      <div className="overflow-x-auto border border-white/10 mb-10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left font-jost text-[0.6rem] tracking-[0.15em] uppercase text-gray1">
              <th className="p-4">Identifiant</th>
              <th className="p-4">Rôle</th>
              <th className="p-4">Réinitialiser le mot de passe</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-white/5 align-top">
                <td className="p-4">
                  {u.username}
                  {u.mustChangePassword && (
                    <span className="block text-[0.6rem] text-gray2 mt-1">mot de passe temporaire</span>
                  )}
                </td>
                <td className="p-4">
                  <form action={updateUserRole} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={u.id} />
                    <select
                      name="roleId"
                      defaultValue={u.roleId}
                      className="bg-bg border border-white/10 px-3 py-2 text-sm"
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                    <button className="text-gray1 hover:text-gold transition text-xs">Mettre à jour</button>
                  </form>
                </td>
                <td className="p-4">
                  <form action={resetUserPassword} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={u.id} />
                    <input
                      name="newPassword"
                      type="text"
                      placeholder="Nouveau mot de passe temporaire"
                      className="bg-bg border border-white/10 px-3 py-2 text-sm"
                      required
                    />
                    <button className="text-gray1 hover:text-gold transition text-xs">Réinitialiser</button>
                  </form>
                </td>
                <td className="p-4">
                  <form action={deleteUser}>
                    <input type="hidden" name="id" value={u.id} />
                    <button className="text-gray1 hover:text-red-400 transition text-xs">Supprimer</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border border-white/10 bg-card p-6">
        <p className="font-jost text-sm tracking-[0.08em] uppercase mb-6">Créer un compte</p>
        <form action={createUser} className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label className="font-jost text-[0.6rem] tracking-[0.15em] uppercase text-gray2">Identifiant</label>
            <input
              name="username"
              required
              className="bg-bg border border-white/10 px-4 py-3 text-sm focus:border-gold transition"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-jost text-[0.6rem] tracking-[0.15em] uppercase text-gray2">
              Mot de passe temporaire
            </label>
            <input
              name="password"
              type="text"
              required
              minLength={6}
              className="bg-bg border border-white/10 px-4 py-3 text-sm focus:border-gold transition"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-jost text-[0.6rem] tracking-[0.15em] uppercase text-gray2">Rôle</label>
            <select name="roleId" required className="bg-bg border border-white/10 px-4 py-3 text-sm">
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <button className="sm:col-span-3 justify-self-start bg-gold text-bg py-3 px-8 font-jost text-[0.65rem] tracking-[0.2em] uppercase hover:bg-goldlight transition">
            Créer le compte
          </button>
        </form>
        <p className="text-xs text-gray2 mt-4">
          Le collaborateur devra changer ce mot de passe dès sa première connexion, depuis son profil.
        </p>
      </div>
    </div>
  );
}
