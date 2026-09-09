import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";
import {
  createPackage,
  updatePackage,
  deletePackage,
  updatePackageStepOrder,
  createCategory,
  updateCategory,
  deleteCategory,
  createChoice,
  updateChoice,
  deleteChoice,
  updatePresentationImage,
  updateTextBackgroundImage,
  createGalleryImage,
  deleteGalleryImage
} from "./actions";

export default async function YachtAdminPage() {
  const session = await auth();
  const perms = (session?.user as any)?.permissions as string[];
  if (!hasPermission(perms, PERMISSIONS.YACHT_VIEW)) redirect("/admin");
  const canEdit = hasPermission(perms, PERMISSIONS.YACHT_EDIT);

  const [packages, categories, settings, gallery] = await Promise.all([
    prisma.yachtPackage.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.yachtOptionCategory.findMany({
      include: { choices: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" }
    }),
    prisma.yachtSettings.findUnique({ where: { id: "yacht" } }),
    prisma.yachtGalleryImage.findMany({ orderBy: { sortOrder: "asc" } })
  ]);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-10">
        <h1 className="font-jost text-2xl tracking-[0.1em] uppercase">Configurateur Yacht</h1>
        {!canEdit && (
          <span className="font-jost text-sm tracking-[0.1em] uppercase text-gray2 border border-white/10 px-3 py-1.5">
            Lecture seule
          </span>
        )}
      </div>

      {/* ================= PHOTO DE PRÉSENTATION ================= */}
      <SectionBlock
        title="1. Photo de présentation"
        help="Ces images apparaissent sur la bannière de la page d'accueil et en haut de la page Yacht. Si tu en mets deux, elles alternent automatiquement en fondu enchaîné toutes les 5 secondes."
      >
        <div className="flex gap-4 mb-4 flex-wrap">
          {settings?.presentationImageUrl && (
            <div className="w-full max-w-sm aspect-video border border-white/10 overflow-hidden">
              <img src={settings.presentationImageUrl} alt="Photo de présentation 1" className="w-full h-full object-cover" />
            </div>
          )}
          {settings?.presentationImageUrl2 && (
            <div className="w-full max-w-sm aspect-video border border-white/10 overflow-hidden">
              <img src={settings.presentationImageUrl2} alt="Photo de présentation 2" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
        {canEdit ? (
          <form action={updatePresentationImage} className="flex flex-col gap-4">
            <Field
              label="URL de la photo 1 (1920x1080 recommandé)"
              name="presentationImageUrl"
              defaultValue={settings?.presentationImageUrl ?? ""}
            />
            <Field
              label="URL de la photo 2 (optionnel — active la transition automatique)"
              name="presentationImageUrl2"
              defaultValue={settings?.presentationImageUrl2 ?? ""}
            />
            <div>
              <SaveButton />
            </div>
          </form>
        ) : (
          <div className="text-sm text-gray2">
            <p>{settings?.presentationImageUrl || "Aucune photo 1 définie."}</p>
            <p>{settings?.presentationImageUrl2 || "Aucune photo 2 définie."}</p>
          </div>
        )}
      </SectionBlock>

      {/* ================= PHOTO DE FOND — ÉCRITURE ================= */}
      <SectionBlock
        title="2. Photo de fond — Écriture"
        help="La photo sur laquelle le Nom et le Sous Nom s'affichent en direct pendant que le client tape. Choisis le format qui correspond à ta photo, puis règle la position de chaque texte plus bas, dans les options de type texte."
      >
        {settings?.textBackgroundImageUrl && (
          <div
            className={`w-full mb-4 border border-white/10 overflow-hidden ${
              settings.textBackgroundAspect === "square" ? "max-w-sm aspect-square" : "max-w-sm aspect-video"
            }`}
          >
            <img src={settings.textBackgroundImageUrl} alt="Photo de fond Écriture" className="w-full h-full object-cover" />
          </div>
        )}
        {canEdit ? (
          <form action={updateTextBackgroundImage} className="flex gap-4 items-end flex-wrap">
            <Field
              label="URL de l'image"
              name="textBackgroundImageUrl"
              defaultValue={settings?.textBackgroundImageUrl ?? ""}
              className="flex-1 min-w-[300px]"
            />
            <div className="flex flex-col gap-2">
              <label className="font-jost text-xs tracking-[0.1em] uppercase text-gray1">Format de l'image</label>
              <select
                name="textBackgroundAspect"
                defaultValue={settings?.textBackgroundAspect ?? "video"}
                className="bg-bg border border-white/10 px-3 py-3 text-sm"
              >
                <option value="video">16:9 (paysage)</option>
                <option value="square">1:1 (carré)</option>
              </select>
            </div>
            <SaveButton />
          </form>
        ) : (
          <p className="text-sm text-gray2">{settings?.textBackgroundImageUrl || "Aucune image définie."}</p>
        )}
      </SectionBlock>

      {/* ================= GALERIE ================= */}
      <SectionBlock
        title="3. Galerie"
        help="Ces images s'affichent dans la galerie de la page Yacht, et en première étape du configurateur (format 1920x1080 recommandé)."
      >
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          {gallery.map((img) => (
            <div key={img.id} className="border border-white/10 bg-card overflow-hidden">
              <div className="aspect-video">
                <img src={img.imageUrl} alt={img.caption ?? ""} className="w-full h-full object-cover" />
              </div>
              <div className="p-3 flex items-center justify-between gap-2">
                <span className="text-sm text-gray1 truncate">{img.caption || "Sans légende"}</span>
                {canEdit && (
                  <form action={deleteGalleryImage}>
                    <input type="hidden" name="id" value={img.id} />
                    <DeleteLink label="Supprimer" />
                  </form>
                )}
              </div>
            </div>
          ))}
          {gallery.length === 0 && <p className="text-sm text-gray2">Aucune image dans la galerie pour l'instant.</p>}
        </div>

        {canEdit && (
          <form action={createGalleryImage} className="border border-white/10 bg-card p-5 grid gap-4 sm:grid-cols-3 items-end">
            <Field label="URL de l'image" name="imageUrl" required />
            <Field label="Légende (optionnel)" name="caption" placeholder="ex : Vue du pont supérieur" />
            <AddButton label="Ajouter à la galerie" />
          </form>
        )}
      </SectionBlock>

      {/* ================= FORFAITS ================= */}
      <SectionBlock
        title="4. Forfaits"
        help="Les formules de base proposées sur la page Forfait, avec leur prix et leur photo. L'ordre d'affichage détermine aussi où cette page apparaît par rapport aux autres options (comparé à leur propre ordre d'affichage, ci-dessous)."
      >
        {canEdit && (
          <form action={updatePackageStepOrder} className="border border-white/10 bg-card p-5 mb-6 flex items-end gap-4 flex-wrap">
            <Field
              label="Position de la page Forfait dans le configurateur"
              name="packageStepOrder"
              type="number"
              defaultValue={settings?.packageStepOrder ?? -1}
              className="min-w-[220px]"
            />
            <p className="text-sm text-gray2 max-w-sm">
              Un nombre plus petit = plus tôt dans le configurateur. Par défaut (-1), la page Forfait est la toute
              première. Mets par exemple 15 pour qu'elle passe après une option ayant un ordre d'affichage de 10.
            </p>
            <SaveButton />
          </form>
        )}

        <div className="flex flex-col gap-4 mb-6">
          {packages.map((pkg) => (
            <div key={pkg.id} className="border border-white/10 bg-card p-5">
              {canEdit ? (
                <form action={updatePackage} className="grid gap-4 sm:grid-cols-5 items-end">
                  <input type="hidden" name="id" value={pkg.id} />
                  <Field label="Nom du forfait" name="label" defaultValue={pkg.label} />
                  <Field label="Prix ($)" name="price" type="number" defaultValue={pkg.price} />
                  <Field label="URL de l'image" name="imageUrl" defaultValue={pkg.imageUrl} />
                  <Field label="Ordre d'affichage" name="sortOrder" type="number" defaultValue={pkg.sortOrder} />
                  <SaveButton />
                </form>
              ) : (
                <p className="text-base">
                  {pkg.label} — <span className="text-goldlight">{pkg.price.toLocaleString("fr-FR")}$</span>
                </p>
              )}
              {canEdit && (
                <form action={deletePackage} className="mt-3">
                  <input type="hidden" name="id" value={pkg.id} />
                  <DeleteLink label="Supprimer ce forfait" />
                </form>
              )}
            </div>
          ))}
        </div>

        {canEdit && (
          <form action={createPackage} className="border border-white/10 bg-card p-5 grid gap-4 sm:grid-cols-4 items-end">
            <Field label="Nom du forfait" name="label" placeholder="Prix troisième" required />
            <Field label="Prix ($)" name="price" type="number" required />
            <Field label="URL de l'image de base" name="imageUrl" required />
            <AddButton label="Ajouter un forfait" />
          </form>
        )}
      </SectionBlock>

      {/* ================= OPTIONS DU CONFIGURATEUR ================= */}
      <SectionBlock
        title="5. Options du configurateur"
        help="Chaque option ci-dessous devient sa propre page dans le configurateur (sauf les options de type texte, regroupées ensemble sur la page Écriture). Elles sont affichées ici dans l'ordre où elles apparaîtront sur le site."
      >
        <div className="flex flex-col gap-8 mb-8">
          {categories.map((cat, index) => (
            <div key={cat.id} className="border border-gold/20 bg-card">
              {/* En-tête de l'option */}
              <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/10 bg-white/[0.02]">
                <p className="font-jost text-sm tracking-[0.1em] uppercase text-goldlight">
                  Option {index + 1} — {cat.label}
                </p>
                <span className="font-jost text-xs tracking-[0.1em] uppercase text-gray2">
                  {cat.type === "choice" ? (cat.multiple ? "Choix multiple" : "Choix unique") : "Texte libre"}
                </span>
              </div>

              <div className="p-5 flex flex-col gap-6">
                {/* --- Informations générales --- */}
                {canEdit ? (
                  <form action={updateCategory} className="flex flex-col gap-4">
                    <input type="hidden" name="id" value={cat.id} />
                    <p className="font-jost text-xs tracking-[0.15em] uppercase text-gray2">Informations générales</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Libellé" name="label" defaultValue={cat.label} />
                      <Field
                        label={cat.multiple ? "Prix (ignoré en mode multiple)" : "Prix ($) si différent du 1er choix"}
                        name="price"
                        type="number"
                        defaultValue={cat.price}
                      />
                    </div>
                    <Field
                      label="Ordre d'affichage (détermine où cette page apparaît dans le configurateur)"
                      name="sortOrder"
                      type="number"
                      defaultValue={cat.sortOrder}
                    />
                    <Field
                      label="Titre / explication (affiché au-dessus de l'option, sur le site)"
                      name="description"
                      defaultValue={cat.description ?? ""}
                      placeholder="ex : Choisissez la teinte de la coque de votre Mega Yacht"
                    />

                    {cat.type === "choice" && (
                      <>
                        <p className="font-jost text-xs tracking-[0.15em] uppercase text-gray2 pt-2 border-t border-white/10">
                          Apparence
                        </p>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-2">
                            <label className="font-jost text-xs tracking-[0.1em] uppercase text-gray1">
                              Format des images
                            </label>
                            <select
                              name="imageAspect"
                              defaultValue={cat.imageAspect}
                              className="bg-bg border border-white/10 px-3 py-3 text-sm"
                            >
                              <option value="video">16:9 (paysage)</option>
                              <option value="square">1:1 (carré) — ex : drapeaux</option>
                            </select>
                          </div>
                          <label className="flex items-center gap-3 text-sm text-gray1 font-jost tracking-[0.05em] pt-7">
                            <input type="checkbox" name="multiple" defaultChecked={cat.multiple} className="w-4 h-4 accent-gold" />
                            Sélection multiple (cumulable, prix par choix)
                          </label>
                        </div>
                      </>
                    )}

                    {cat.type === "text" && (
                      <>
                        <p className="font-jost text-xs tracking-[0.15em] uppercase text-gray2 pt-2 border-t border-white/10">
                          Affichage du texte sur la photo (page Écriture)
                        </p>
                        <div className="grid sm:grid-cols-3 gap-4">
                          <Field label="Position horizontale (%)" name="textPositionX" type="number" defaultValue={cat.textPositionX} />
                          <Field label="Position verticale (%)" name="textPositionY" type="number" defaultValue={cat.textPositionY} />
                          <Field label="Taille du texte (px)" name="textFontSize" type="number" defaultValue={cat.textFontSize} />
                          <Field
                            label="Police (nom CSS)"
                            name="textFontFamily"
                            defaultValue={cat.textFontFamily ?? ""}
                            placeholder="ex : Segoe Print, Montserrat"
                          />
                          <div className="flex flex-col gap-2">
                            <label className="font-jost text-xs tracking-[0.1em] uppercase text-gray1">Couleur du texte</label>
                            <input
                              type="color"
                              name="textColor"
                              defaultValue={cat.textColor}
                              className="bg-bg border border-white/10 h-[46px] w-full cursor-pointer"
                            />
                          </div>
                          <label className="flex items-center gap-3 text-sm text-gray1 font-jost tracking-[0.05em] pt-7">
                            <input type="checkbox" name="textItalic" defaultChecked={cat.textItalic} className="w-4 h-4 accent-gold" />
                            Italique
                          </label>
                        </div>
                      </>
                    )}

                    <div>
                      <SaveButton />
                    </div>
                  </form>
                ) : (
                  <div>
                    <p className="text-base">
                      {cat.label}
                      {cat.multiple ? (
                        <span className="text-gray2"> — prix par choix</span>
                      ) : (
                        <> — <span className="text-goldlight">{cat.price.toLocaleString("fr-FR")}$</span></>
                      )}
                    </p>
                    {cat.description && <p className="text-sm text-gray2 mt-1">{cat.description}</p>}
                  </div>
                )}

                {/* --- Choix (pour les options de type "choice") --- */}
                {cat.type === "choice" && (
                  <div className="pt-4 border-t border-white/10">
                    <p className="font-jost text-xs tracking-[0.15em] uppercase text-gray2 mb-3">
                      Choix proposés au client
                    </p>
                    <p className="text-sm text-gray2 mb-4">
                      {cat.multiple
                        ? "Sélection multiple : le client peut cocher plusieurs choix, chacun ajoute son propre prix."
                        : "Le premier choix ci-dessous sert de valeur par défaut sur le site (inclus, sans supplément) — les suivants ajoutent le prix défini plus haut."}
                    </p>

                    <div className="flex flex-col gap-3 mb-4">
                      {cat.choices.map((choice) => (
                        <div key={choice.id} className="border border-white/10 p-4">
                          {canEdit ? (
                            <form action={updateChoice} className="grid gap-4 sm:grid-cols-4 items-end">
                              <input type="hidden" name="id" value={choice.id} />
                              <Field label="Nom du choix" name="label" defaultValue={choice.label} />
                              <Field label="URL de l'image" name="imageUrl" defaultValue={choice.imageUrl ?? ""} className="sm:col-span-2" />
                              {cat.multiple && (
                                <Field label="Prix propre ($)" name="price" type="number" defaultValue={choice.price ?? ""} />
                              )}
                              <div>
                                <SaveButton />
                              </div>
                            </form>
                          ) : (
                            <p className="text-sm">
                              {choice.label}
                              {cat.multiple && choice.price != null && (
                                <span className="text-goldlight"> — {choice.price.toLocaleString("fr-FR")}$</span>
                              )}
                            </p>
                          )}
                          {canEdit && (
                            <form action={deleteChoice} className="mt-2">
                              <input type="hidden" name="id" value={choice.id} />
                              <DeleteLink label="Supprimer ce choix" />
                            </form>
                          )}
                        </div>
                      ))}
                      {cat.choices.length === 0 && (
                        <p className="text-sm text-gray2">Aucun choix ajouté pour l'instant.</p>
                      )}
                    </div>

                    {canEdit && (
                      <form action={createChoice} className="flex gap-4 items-end flex-wrap">
                        <input type="hidden" name="categoryId" value={cat.id} />
                        <Field label="Nom du choix" name="label" placeholder="ex : Rouge, Hélicoptère..." required />
                        <Field label="URL de l'image" name="imageUrl" required />
                        {cat.multiple && <Field label="Prix propre ($)" name="price" type="number" placeholder="ex : 40000" />}
                        <AddButton label="Ajouter ce choix" />
                      </form>
                    )}
                  </div>
                )}

                {canEdit && (
                  <form action={deleteCategory} className="pt-2">
                    <input type="hidden" name="id" value={cat.id} />
                    <DeleteLink label="Supprimer toute cette option" />
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>

        {canEdit && (
          <div className="border border-white/10 bg-card p-5">
            <p className="font-jost text-sm tracking-[0.1em] uppercase mb-4">Ajouter une nouvelle option</p>
            <form action={createCategory} className="flex flex-col gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Libellé de l'option" name="label" placeholder="ex : Intérieur, Éclairage..." required />
                <Field label="Prix ($)" name="price" type="number" required placeholder="0 si sélection multiple" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-jost text-xs tracking-[0.1em] uppercase text-gray1">Type</label>
                  <select name="type" className="bg-bg border border-white/10 px-3 py-3 text-sm">
                    <option value="choice">Choix (images)</option>
                    <option value="text">Texte libre</option>
                  </select>
                </div>
                <label className="flex items-center gap-3 text-sm text-gray1 font-jost tracking-[0.05em] pt-7">
                  <input type="checkbox" name="multiple" className="w-4 h-4 accent-gold" />
                  Sélection multiple (pour les options de type Choix)
                </label>
              </div>
              <Field
                label="Titre / explication (affiché au-dessus de l'option)"
                name="description"
                placeholder="ex : Choisissez la teinte de la coque de votre Mega Yacht"
              />
              <Field
                label="Ordre d'affichage (détermine où cette page apparaît dans le configurateur)"
                name="sortOrder"
                type="number"
                placeholder="ex : 10"
              />
              <div>
                <AddButton label="Ajouter cette option" />
              </div>
              <p className="text-sm text-gray2">
                Une fois créée, ouvre à nouveau cette option ci-dessus pour régler son format d'image (16:9 ou
                carré) ou, si elle est de type texte, sa position et sa police sur la photo.
              </p>
            </form>
          </div>
        )}
      </SectionBlock>
    </div>
  );
}

/* ---------------- Composants d'aide ---------------- */

function SectionBlock({
  title,
  help,
  children
}: {
  title: string;
  help: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-16">
      <p className="font-jost text-lg tracking-[0.06em] uppercase mb-2">{title}</p>
      <p className="text-sm text-gray1 mb-5 max-w-2xl leading-relaxed">{help}</p>
      {children}
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  defaultValue,
  placeholder,
  className = ""
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="font-jost text-xs tracking-[0.1em] uppercase text-gray1">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="bg-bg border border-white/10 px-3 py-3 text-sm text-cream focus:border-gold transition"
      />
    </div>
  );
}

function SaveButton() {
  return (
    <button className="bg-gold text-bg px-5 py-3 font-jost text-xs tracking-[0.15em] uppercase hover:bg-goldlight transition">
      Enregistrer
    </button>
  );
}

function AddButton({ label }: { label: string }) {
  return (
    <button className="bg-gold text-bg px-5 py-3 font-jost text-xs tracking-[0.15em] uppercase hover:bg-goldlight transition h-fit">
      {label}
    </button>
  );
}

function DeleteLink({ label }: { label: string }) {
  return (
    <button className="text-sm text-gray2 hover:text-red-400 transition">
      {label}
    </button>
  );
}
