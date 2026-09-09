import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";
import { redirect, notFound } from "next/navigation";
import { updateVehicle } from "../actions";

export default async function EditVehiclePage({ params }: { params: { id: string } }) {
  const session = await auth();
  const perms = (session?.user as any)?.permissions as string[];
  if (!hasPermission(perms, PERMISSIONS.VEHICLES_EDIT)) redirect("/admin/vehicles");

  const vehicle = await prisma.vehicle.findUnique({ where: { id: params.id } });
  if (!vehicle) notFound();

  const updateWithId = updateVehicle.bind(null, vehicle.id);

  return (
    <div>
      <h1 className="font-jost text-xl tracking-[0.1em] uppercase mb-8">Modifier — {vehicle.name}</h1>

      <form action={updateWithId} className="grid gap-4 sm:grid-cols-2 border border-white/10 bg-card p-6">
        <Field label="Nom" name="name" defaultValue={vehicle.name} required />
        <div className="flex flex-col gap-2">
          <label className="font-jost text-[0.6rem] tracking-[0.15em] uppercase text-gray2">Catégorie</label>
          <select name="category" defaultValue={vehicle.category} className="bg-bg border border-white/10 px-4 py-3 text-sm">
            <option value="air">Aérien</option>
            <option value="land">Terrestre</option>
            <option value="sea">Maritime</option>
          </select>
        </div>
        <Field label="Libellé catégorie (affiché)" name="categoryLabel" defaultValue={vehicle.categoryLabel} required />
        <div className="flex flex-col gap-2">
          <label className="font-jost text-[0.6rem] tracking-[0.15em] uppercase text-gray2">
            Sous-catégorie (Terrestre)
          </label>
          <select
            name="subCategory"
            defaultValue={vehicle.subCategory ?? ""}
            className="bg-bg border border-white/10 px-4 py-3 text-sm"
          >
            <option value="">Aucune</option>
            <option value="Berline de Luxe">Berline de Luxe</option>
            <option value="SUV/4x4">SUV/4x4</option>
            <option value="Sportives">Sportives</option>
            <option value="Hypercars">Hypercars</option>
          </select>
        </div>
        <Field label="Modèle (référence interne)" name="model" defaultValue={vehicle.model} required />
        <Field label="URL de l'image (principale)" name="imageUrl" defaultValue={vehicle.imageUrl} required className="sm:col-span-2" />
        <Field label="URL photo 2 (optionnel)" name="imageUrl2" defaultValue={vehicle.imageUrl2 ?? ""} />
        <Field label="URL photo 3 (optionnel)" name="imageUrl3" defaultValue={vehicle.imageUrl3 ?? ""} />
        <Field label="URL photo 4 (optionnel)" name="imageUrl4" defaultValue={vehicle.imageUrl4 ?? ""} />
        <div className="flex flex-col gap-2">
          <label className="font-jost text-[0.6rem] tracking-[0.15em] uppercase text-gray2">Format photo</label>
          <select name="imageAspect" defaultValue={vehicle.imageAspect} className="bg-bg border border-white/10 px-4 py-3 text-sm">
            <option value="video">16:9 (paysage)</option>
            <option value="square">1:1 (carré)</option>
          </select>
        </div>
        <Field label="Tarif affiché" name="priceLabel" defaultValue={vehicle.priceLabel} required />
        <Field label="Durée de location" name="durationLabel" defaultValue={vehicle.durationLabel} />
        <div className="flex flex-col gap-2 sm:col-span-2">
          <label className="font-jost text-[0.6rem] tracking-[0.15em] uppercase text-gray2">Description</label>
          <textarea
            name="description"
            defaultValue={vehicle.description ?? ""}
            className="bg-bg border border-white/10 px-4 py-3 text-sm min-h-[90px]"
          />
        </div>

        <div className="sm:col-span-2 border-t border-white/10 pt-5 mt-1">
          <div className="flex items-center justify-between mb-4">
            <p className="font-jost text-xs tracking-[0.15em] uppercase text-goldlight">Comptabilité &amp; gestion</p>
            {vehicle.purchasePrice != null && (
              <p className="font-jost text-xs tracking-[0.1em] text-gray1">
                Total achat + custom :{" "}
                <span className="text-goldlight">
                  {((vehicle.purchasePrice ?? 0) + (vehicle.customPrice ?? 0)).toLocaleString("fr-FR")}$
                </span>
              </p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Prix 24h ($, vide = sur devis)" name="price" type="number" defaultValue={vehicle.price ?? ""} />
            <Field label="Tarif 3 jours ($)" name="price3d" type="number" defaultValue={vehicle.price3d ?? ""} />
            <Field label="Tarif 1 semaine ($)" name="price7d" type="number" defaultValue={vehicle.price7d ?? ""} />
            <Field label="Prix d'achat ($)" name="purchasePrice" type="number" defaultValue={vehicle.purchasePrice ?? ""} />
            <Field
              label="Prix custom ($, facultatif)"
              name="customPrice"
              type="number"
              defaultValue={vehicle.customPrice ?? ""}
            />
            <Field label="Plaque d'immatriculation" name="licensePlate" defaultValue={vehicle.licensePlate ?? ""} />
            <Field label="UUID (ID du véhicule)" name="vehicleUuid" defaultValue={vehicle.vehicleUuid ?? ""} />
          </div>
        </div>

        <div className="sm:col-span-2 flex gap-6 flex-wrap">
          <label className="flex items-center gap-2 text-sm text-gray1 font-jost tracking-[0.05em]">
            <input type="checkbox" name="badgeNew" defaultChecked={vehicle.badgeNew} className="w-4 h-4 accent-gold" />
            Nouveau
          </label>
          <label className="flex items-center gap-2 text-sm text-gray1 font-jost tracking-[0.05em]">
            <input type="checkbox" name="badgePromotion" defaultChecked={vehicle.badgePromotion} className="w-4 h-4 accent-gold" />
            Promotion
          </label>
          <label className="flex items-center gap-2 text-sm text-gray1 font-jost tracking-[0.05em]">
            <input type="checkbox" name="badgeTrending" defaultChecked={vehicle.badgeTrending} className="w-4 h-4 accent-gold" />
            Tendance
          </label>
        </div>
        <button className="sm:col-span-2 justify-self-start bg-gold text-bg py-3 px-8 font-jost text-[0.65rem] tracking-[0.2em] uppercase hover:bg-goldlight transition">
          Enregistrer les modifications
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  defaultValue,
  className = ""
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="font-jost text-[0.6rem] tracking-[0.15em] uppercase text-gray2">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="bg-bg border border-white/10 px-4 py-3 text-sm text-cream focus:border-gold transition"
      />
    </div>
  );
}
