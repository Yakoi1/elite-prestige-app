import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";
import { updateSiteTheme, resetSiteTheme } from "./actions";

const DEFAULTS = {
  bg: "#02121F",
  card: "#0a2a4a",
  gold: "#c9a24c",
  goldlight: "#e7d19a",
  cream: "#f3eee5",
  gray1: "#949399",
  gray2: "#5f5f65"
};

const FIELDS: { key: keyof typeof DEFAULTS; label: string; help: string }[] = [
  { key: "bg", label: "Fond principal", help: "La couleur de fond de tout le site (public et admin)." },
  { key: "card", label: "Fond des blocs / cartes", help: "Panneaux, cartes véhicules, encadrés, fenêtres." },
  { key: "gold", label: "Couleur d'accent (boutons)", help: "Boutons principaux, liens actifs, bordures d'accent." },
  { key: "goldlight", label: "Accent clair (survols)", help: "Version plus claire utilisée au survol et sur certains titres." },
  { key: "cream", label: "Texte principal / titres", help: "La couleur du texte le plus visible : titres, noms, corps de texte clair." },
  { key: "gray1", label: "Texte secondaire", help: "Descriptions, sous-titres, labels de champs." },
  { key: "gray2", label: "Texte discret", help: "Légendes, mentions discrètes, texte peu important." }
];

export default async function ThemePage() {
  const session = await auth();
  const perms = (session?.user as any)?.permissions as string[];
  if (!hasPermission(perms, PERMISSIONS.THEME_VIEW)) redirect("/admin");
  const canEdit = hasPermission(perms, PERMISSIONS.THEME_EDIT);

  const stored = await prisma.siteTheme.findUnique({ where: { id: "site" } });
  const theme = { ...DEFAULTS, ...stored };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-jost text-2xl tracking-[0.1em] uppercase">Couleurs du site</h1>
        {!canEdit && (
          <span className="font-jost text-sm tracking-[0.1em] uppercase text-gray2 border border-white/10 px-3 py-1.5">
            Lecture seule
          </span>
        )}
      </div>
      <p className="text-sm text-gray1 mb-10 max-w-xl leading-relaxed">
        Ces couleurs s'appliquent instantanément à tout le site — page d'accueil, flotte, Yacht, et cet espace
        d'administration lui-même. Aucune reconstruction n'est nécessaire.
      </p>

      <form action={canEdit ? updateSiteTheme : undefined} className="flex flex-col gap-6 mb-8">
        {FIELDS.map((f) => (
          <div key={f.key} className="border border-white/10 bg-card p-5 flex items-center gap-5 flex-wrap">
            <input
              type="color"
              name={f.key}
              defaultValue={theme[f.key]}
              disabled={!canEdit}
              className="w-16 h-16 bg-bg border border-white/10 cursor-pointer shrink-0 disabled:cursor-not-allowed"
            />
            <div className="flex-1 min-w-[200px]">
              <p className="font-jost text-sm tracking-[0.05em]">{f.label}</p>
              <p className="text-sm text-gray2 mt-1">{f.help}</p>
            </div>
            <p className="font-jost text-xs tracking-[0.1em] text-gray2 uppercase shrink-0">{theme[f.key]}</p>
          </div>
        ))}

        {canEdit && (
          <button className="self-start bg-gold text-bg py-3.5 px-10 font-jost text-xs tracking-[0.2em] uppercase hover:bg-goldlight transition">
            Enregistrer les couleurs
          </button>
        )}
      </form>

      {canEdit && (
        <form action={resetSiteTheme}>
          <button className="text-sm text-gray2 hover:text-red-400 transition">
            Réinitialiser aux couleurs par défaut (fond bleu nuit, accent doré)
          </button>
        </form>
      )}
    </div>
  );
}
