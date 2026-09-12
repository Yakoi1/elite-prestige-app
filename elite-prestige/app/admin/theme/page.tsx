import { getSessionWithFreshPermissions } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";
import { updateSiteTheme, resetSiteTheme, updateThemeEffect } from "./actions";

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

const PRESETS: { name: string; description: string; values: typeof DEFAULTS }[] = [
  {
    name: "Bleu Nuit",
    description: "Le thème d'origine — élégant, discret, intemporel.",
    values: { bg: "#02121F", card: "#0a2a4a", gold: "#c9a24c", goldlight: "#e7d19a", cream: "#f3eee5", gray1: "#949399", gray2: "#5f5f65" }
  },
  {
    name: "Noir Onyx",
    description: "Un noir profond et minimal, pour un rendu très haut de gamme.",
    values: { bg: "#0a0a0c", card: "#1a1a1e", gold: "#c9a24c", goldlight: "#e7d19a", cream: "#f3eee5", gray1: "#9a9a9e", gray2: "#616166" }
  },
  {
    name: "Bordeaux Royal",
    description: "Un rouge sombre feutré, plus chaleureux et affirmé.",
    values: { bg: "#1a0508", card: "#2e0f14", gold: "#d4af6a", goldlight: "#f0d9a8", cream: "#f5ece2", gray1: "#a08e8e", gray2: "#6b5858" }
  },
  {
    name: "Vert Émeraude",
    description: "Un vert profond, associé au luxe et à la discrétion.",
    values: { bg: "#041a14", card: "#0d2f24", gold: "#c9a24c", goldlight: "#e7d19a", cream: "#f0f5f0", gray1: "#8fa89a", gray2: "#5a6f64" }
  },
  {
    name: "Charbon Platine",
    description: "Un gris anthracite avec un accent argenté, plus moderne.",
    values: { bg: "#14161a", card: "#24272d", gold: "#b8b8b0", goldlight: "#e0e0d8", cream: "#f5f5f0", gray1: "#9a9a95", gray2: "#64645f" }
  }
];

const EFFECTS: { key: string; name: string; description: string }[] = [
  { key: "none", name: "Aucun", description: "Rendu sobre, sans effet superposé." },
  { key: "ambient-glow", name: "Lueur dorée ambiante", description: "Un halo doux et lumineux en haut de chaque page." },
  { key: "grain", name: "Grain cinématique", description: "Un léger grain façon pellicule, pour une ambiance premium." },
  { key: "vignette", name: "Vignette profonde", description: "Bords assombris, regard centré sur le contenu." },
  { key: "particles", name: "Particules dorées", description: "De fines particules dorées flottent doucement à l'écran." }
];

export default async function ThemePage() {
  const session = await getSessionWithFreshPermissions();
  const perms = (session?.user as any)?.permissions as string[];
  if (!hasPermission(perms, PERMISSIONS.THEME_VIEW)) redirect("/admin");
  const canEdit = hasPermission(perms, PERMISSIONS.THEME_EDIT);

  const stored = await prisma.siteTheme.findUnique({ where: { id: "site" } });
  const theme = { ...DEFAULTS, effect: "none", ...stored };

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

      {/* Thèmes prédéfinis */}
      <section className="mb-12">
        <p className="font-jost text-lg tracking-[0.06em] uppercase mb-2">Thèmes prédéfinis</p>
        <p className="text-sm text-gray1 mb-5">
          Applique une palette complète en un clic. Tu pourras toujours affiner chaque couleur juste en dessous.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {PRESETS.map((preset) => (
            <form key={preset.name} action={canEdit ? updateSiteTheme : undefined}>
              {Object.entries(preset.values).map(([key, value]) => (
                <input key={key} type="hidden" name={key} value={value} />
              ))}
              <button
                type="submit"
                disabled={!canEdit}
                className="w-full text-left border border-white/10 bg-card p-4 flex items-center gap-4 hover:border-gold/50 transition disabled:cursor-not-allowed disabled:hover:border-white/10"
              >
                <span className="flex shrink-0" style={{ border: "1px solid rgba(255,255,255,0.15)" }}>
                  {[preset.values.bg, preset.values.card, preset.values.gold, preset.values.cream].map((c, i) => (
                    <span key={i} className="w-4 h-10" style={{ backgroundColor: c }} />
                  ))}
                </span>
                <span>
                  <span className="block font-jost text-sm tracking-[0.05em]">{preset.name}</span>
                  <span className="block text-xs text-gray2 mt-1">{preset.description}</span>
                </span>
              </button>
            </form>
          ))}
        </div>
      </section>

      {/* Effets visuels */}
      <section className="mb-12">
        <p className="font-jost text-lg tracking-[0.06em] uppercase mb-2">Effets visuels</p>
        <p className="text-sm text-gray1 mb-5">Un effet d'ambiance discret, appliqué à tout le site.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {EFFECTS.map((fx) => {
            const isActive = theme.effect === fx.key;
            return (
              <form key={fx.key} action={canEdit ? updateThemeEffect : undefined}>
                <input type="hidden" name="effect" value={fx.key} />
                <button
                  type="submit"
                  disabled={!canEdit}
                  className={`w-full text-left border p-4 transition disabled:cursor-not-allowed ${
                    isActive ? "border-gold bg-gold/10" : "border-white/10 bg-card hover:border-gold/50"
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <span className="font-jost text-sm tracking-[0.05em]">{fx.name}</span>
                    {isActive && <span className="text-[0.6rem] text-goldlight uppercase tracking-[0.1em]">Actif</span>}
                  </span>
                  <span className="block text-xs text-gray2 mt-1">{fx.description}</span>
                </button>
              </form>
            );
          })}
        </div>
      </section>

      <p className="font-jost text-lg tracking-[0.06em] uppercase mb-2">Réglages avancés</p>
      <p className="text-sm text-gray1 mb-5">Ajuste chaque couleur individuellement si besoin.</p>

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
