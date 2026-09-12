import { getSessionWithFreshPermissions } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";
import { createVehicleQuick, deleteVehicle } from "./actions";
import Link from "next/link";
import SuccessToast from "./SuccessToast";

export default async function VehiclesPage() {
  const session = await getSessionWithFreshPermissions();
  const perms = (session?.user as any)?.permissions as string[];
  const canEdit = hasPermission(perms, PERMISSIONS.VEHICLES_EDIT);

  const vehicles = await prisma.vehicle.findMany({ orderBy: { addedAt: "desc" } });

  return (
    <div>
      <SuccessToast message="Véhicule ajouté avec succès." />
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-jost text-xl tracking-[0.1em] uppercase">Flotte</h1>
        {!canEdit && (
          <span className="font-jost text-[0.6rem] tracking-[0.15em] uppercase text-gray2 border border-white/10 px-3 py-1">
            Lecture seule
          </span>
        )}
      </div>

      <div className="overflow-x-auto border border-white/10 mb-10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left font-jost text-[0.6rem] tracking-[0.15em] uppercase text-gray1">
              <th className="p-4">Nom</th>
              <th className="p-4">Catégorie</th>
              <th className="p-4">Sous-catégorie</th>
              <th className="p-4">Plaque</th>
              <th className="p-4">UUID</th>
              <th className="p-4">Tarif</th>
              <th className="p-4">Achat + Custom</th>
              {canEdit && <th className="p-4">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => {
              const total = (v.purchasePrice ?? 0) + (v.customPrice ?? 0);
              return (
                <tr key={v.id} className="border-b border-white/5">
                  <td className="p-4">{v.name}</td>
                  <td className="p-4 text-gray1">{v.categoryLabel}</td>
                  <td className="p-4 text-gray1">{v.subCategory || "—"}</td>
                  <td className="p-4 text-gray1">{v.licensePlate || "—"}</td>
                  <td className="p-4 text-gray1">{v.vehicleUuid || "—"}</td>
                  <td className="p-4 text-goldlight">{v.priceLabel}</td>
                  <td className="p-4 text-goldlight">
                    {v.purchasePrice != null ? `${total.toLocaleString("fr-FR")}$` : "—"}
                  </td>
                  {canEdit && (
                    <td className="p-4">
                      <div className="flex gap-4">
                        <Link href={`/admin/vehicles/${v.id}`} className="text-gray1 hover:text-gold transition">
                          Modifier
                        </Link>
                        <form action={deleteVehicle}>
                          <input type="hidden" name="id" value={v.id} />
                          <button className="text-gray1 hover:text-red-400 transition">Supprimer</button>
                        </form>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
            {vehicles.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray2">
                  Aucun véhicule pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {canEdit && (
        <div className="border border-white/10 bg-card p-6">
          <p className="font-jost text-sm tracking-[0.08em] uppercase mb-2">Ajouter un véhicule</p>
          <p className="text-xs text-gray2 mb-6">
            Le strict nécessaire pour le mettre en ligne. Libellé, référence et tarif affiché sont générés
            automatiquement — tu pourras les affiner (ainsi que la description) en cliquant sur "Modifier" une fois
            le véhicule ajouté.
          </p>
          <form action={createVehicleQuick} className="grid gap-4 sm:grid-cols-6 items-end">
            <Field label="Nom" name="name" placeholder="ex : Zentorno" required />
            <div className="flex flex-col gap-2">
              <label className="font-jost text-[0.6rem] tracking-[0.15em] uppercase text-gray2">Catégorie</label>
              <select name="category" className="bg-bg border border-white/10 px-4 py-3 text-sm">
                <option value="air">Aérien</option>
                <option value="land">Terrestre</option>
                <option value="sea">Maritime</option>
              </select>
            </div>
            <Field label="URL de l'image (principale)" name="imageUrl" required />
            <div className="flex flex-col gap-2">
              <label className="font-jost text-[0.6rem] tracking-[0.15em] uppercase text-gray2">Format photo</label>
              <select name="imageAspect" className="bg-bg border border-white/10 px-4 py-3 text-sm">
                <option value="video">16:9 (paysage)</option>
                <option value="square">1:1 (carré)</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-jost text-[0.6rem] tracking-[0.15em] uppercase text-gray2">
                Sous-catégorie (Terrestre)
              </label>
              <select name="subCategory" className="bg-bg border border-white/10 px-4 py-3 text-sm">
                <option value="">Aucune</option>
                <option value="Berline de Luxe">Berline de Luxe</option>
                <option value="SUV/4x4">SUV/4x4</option>
                <option value="Sportives">Sportives</option>
                <option value="Hypercars">Hypercars</option>
              </select>
            </div>
            <Field label="URL photo 2 (optionnel)" name="imageUrl2" />
            <Field label="URL photo 3 (optionnel)" name="imageUrl3" />
            <Field label="URL photo 4 (optionnel)" name="imageUrl4" />
            <div className="sm:col-span-6 border-t border-white/10 pt-4 mt-1">
              <p className="font-jost text-xs tracking-[0.15em] uppercase text-goldlight mb-3">
                Comptabilité &amp; gestion (facultatif)
              </p>
              <div className="grid gap-4 sm:grid-cols-6">
                <Field label="Prix 24h ($, vide = sur devis)" name="price" type="number" />
                <Field label="Tarif 3 jours ($)" name="price3d" type="number" />
                <Field label="Tarif 1 semaine ($)" name="price7d" type="number" />
                <Field label="Prix d'achat ($)" name="purchasePrice" type="number" />
                <Field label="Prix custom ($, facultatif)" name="customPrice" type="number" />
                <Field label="Plaque d'immatriculation" name="licensePlate" placeholder="ex : ABC-123" />
                <Field label="UUID (ID du véhicule)" name="vehicleUuid" placeholder="ex : veh_00123" />
              </div>
            </div>
            <div className="sm:col-span-6 flex gap-6 flex-wrap">
              <label className="flex items-center gap-2 text-sm text-gray1 font-jost tracking-[0.05em]">
                <input type="checkbox" name="badgeNew" className="w-4 h-4 accent-gold" />
                Nouveau
              </label>
              <label className="flex items-center gap-2 text-sm text-gray1 font-jost tracking-[0.05em]">
                <input type="checkbox" name="badgePromotion" className="w-4 h-4 accent-gold" />
                Promotion
              </label>
              <label className="flex items-center gap-2 text-sm text-gray1 font-jost tracking-[0.05em]">
                <input type="checkbox" name="badgeTrending" className="w-4 h-4 accent-gold" />
                Tendance
              </label>
            </div>
            <button className="sm:col-span-6 justify-self-start bg-gold text-bg py-3 px-8 font-jost text-[0.65rem] tracking-[0.2em] uppercase hover:bg-goldlight transition">
              Ajouter à la flotte
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  className = ""
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="font-jost text-[0.6rem] tracking-[0.15em] uppercase text-gray2">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="bg-bg border border-white/10 px-4 py-3 text-sm text-cream focus:border-gold transition"
      />
    </div>
  );
}
