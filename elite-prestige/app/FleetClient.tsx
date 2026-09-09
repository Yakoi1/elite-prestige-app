"use client";

import { useMemo, useState } from "react";

type Vehicle = {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  subCategory: string | null;
  model: string;
  imageUrl: string;
  imageUrl2: string | null;
  imageUrl3: string | null;
  imageUrl4: string | null;
  imageAspect: string;
  price: number | null;
  price3d: number | null;
  price7d: number | null;
  priceLabel: string;
  durationLabel: string;
  description: string | null;
  addedAt: string;
  badgePromotion: boolean;
  badgeNew: boolean;
  badgeTrending: boolean;
};

/* ================= THÈMES ================= */

type Theme = {
  label: string;
  tagline: string;
  accent: string;
  accentSoft: string;
  icon: (props: { className?: string }) => JSX.Element;
};

const THEME_ORDER = ["air", "land", "sea"];

const THEMES: Record<string, Theme> = {
  air: {
    label: "Aérien",
    tagline: "Prenez de l'altitude au-dessus de Los Santos",
    accent: "#a9c9ec",
    accentSoft: "rgba(169,201,236,0.14)",
    icon: ({ className }) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className={className}>
        <path d="M2 14l20-6-4 6 4 6-20-6zM9 9v10" strokeLinejoin="round" />
      </svg>
    )
  },
  land: {
    label: "Terrestre",
    tagline: "La route vous appartient",
    accent: "#dba468",
    accentSoft: "rgba(219,164,104,0.14)",
    icon: ({ className }) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className={className}>
        <path d="M3 15l2-5a2 2 0 0 1 2-1.3h10a2 2 0 0 1 2 1.3l2 5v3H3z" strokeLinejoin="round" />
        <circle cx="7" cy="18" r="1.5" />
        <circle cx="17" cy="18" r="1.5" />
      </svg>
    )
  },
  sea: {
    label: "Maritime",
    tagline: "Prenez le large, en toute discrétion",
    accent: "#6cc2b8",
    accentSoft: "rgba(108,194,184,0.14)",
    icon: ({ className }) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className={className}>
        <path d="M12 3v13M8 6h8M4 12c1.5 3 4 5 8 5s6.5-2 8-5M2 19c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
};

function themeFor(category: string): Theme {
  return (
    THEMES[category] || {
      label: category,
      tagline: "",
      accent: "#c9a24c",
      accentSoft: "rgba(201,162,76,0.14)",
      icon: () => <></>
    }
  );
}

/* ================= COMPOSANT PRINCIPAL ================= */

export default function FleetClient({ vehicles }: { vehicles: Vehicle[] }) {
  const [category, setCategory] = useState("all");
  const [landSubCategory, setLandSubCategory] = useState("all");
  const [sort, setSort] = useState("newest");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [badgeFilters, setBadgeFilters] = useState<string[]>([]);
  const [active, setActive] = useState<Vehicle | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  function openVehicle(v: Vehicle) {
    setGalleryIndex(0);
    setActive(v);
  }

  function toggleBadgeFilter(key: string) {
    setBadgeFilters((s) => (s.includes(key) ? s.filter((k) => k !== key) : [...s, key]));
  }

  const filtered = useMemo(() => {
    let list = vehicles.filter((v) => {
      if (category !== "all" && v.category !== category) return false;
      if (landSubCategory !== "all" && v.category === "land" && v.subCategory !== landSubCategory) return false;
      if (priceMin !== "" && (v.price === null || v.price < Number(priceMin))) return false;
      if (priceMax !== "" && (v.price === null || v.price > Number(priceMax))) return false;
      if (badgeFilters.length > 0) {
        const matches =
          (badgeFilters.includes("new") && v.badgeNew) ||
          (badgeFilters.includes("promotion") && v.badgePromotion) ||
          (badgeFilters.includes("trending") && v.badgeTrending);
        if (!matches) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "price-asc") return (a.price ?? Infinity) - (b.price ?? Infinity);
      if (sort === "price-desc") return (b.price ?? -Infinity) - (a.price ?? -Infinity);
      if (sort === "name-asc") return a.name.localeCompare(b.name);
      return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
    });
    return list;
  }, [vehicles, category, landSubCategory, sort, priceMin, priceMax, badgeFilters]);

  const sections = useMemo(() => {
    const cats = category === "all" ? THEME_ORDER : [category];
    return cats
      .map((catKey) => ({ catKey, items: filtered.filter((v) => v.category === catKey) }))
      .filter((s) => s.items.length > 0);
  }, [filtered, category]);

  const filterTabs = [
    { key: "all", label: "Tous" },
    { key: "air", label: "Aérien" },
    { key: "land", label: "Terrestre" },
    { key: "sea", label: "Maritime" }
  ];

  const badgeTabs = [
    { key: "new", label: "Nouveau" },
    { key: "promotion", label: "Promotion" },
    { key: "trending", label: "Tendance" }
  ];

  const landSubCategoryTabs = [
    { key: "all", label: "Toutes" },
    { key: "Berline de Luxe", label: "Berline de Luxe" },
    { key: "SUV/4x4", label: "SUV/4x4" },
    { key: "Sportives", label: "Sportives" },
    { key: "Hypercars", label: "Hypercars" }
  ];

  return (
    <>
      {/* ================= BARRE DE CONTRÔLE ================= */}
      <div className="border border-white/10 bg-card px-7 py-6 mb-14 flex flex-wrap gap-8 items-end justify-between">
        <div className="flex flex-col gap-2.5">
          <label className="font-jost text-xs tracking-[0.2em] uppercase text-gray2">Catégorie</label>
          <div className="flex gap-2 flex-wrap">
            {filterTabs.map((f) => {
              const isActive = category === f.key;
              const theme = f.key === "all" ? null : themeFor(f.key);
              const Icon = theme?.icon;
              return (
                <button
                  key={f.key}
                  onClick={() => {
                    setCategory(f.key);
                    setLandSubCategory("all");
                  }}
                  style={isActive && theme ? { backgroundColor: theme.accent, borderColor: theme.accent, color: "#041D36" } : undefined}
                  className={`flex items-center gap-2 px-5 py-2.5 border text-xs font-jost tracking-[0.15em] uppercase transition ${
                    isActive && !theme ? "bg-gold border-gold text-bg" : !isActive ? "border-white/10 text-gray1 hover:border-gold" : ""
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {category === "land" && (
          <div className="flex flex-col gap-2.5">
            <label className="font-jost text-xs tracking-[0.2em] uppercase text-gray2">Type de véhicule</label>
            <div className="flex gap-2 flex-wrap">
              {landSubCategoryTabs.map((s) => {
                const isActive = landSubCategory === s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => setLandSubCategory(s.key)}
                    className={`px-4 py-2 border text-xs font-jost tracking-[0.1em] uppercase transition ${
                      isActive ? "bg-gold border-gold text-bg" : "border-white/10 text-gray1 hover:border-gold"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          <label className="font-jost text-xs tracking-[0.2em] uppercase text-gray2">Trier par</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-bg border border-white/10 px-4 py-2.5 text-sm min-w-[170px]"
          >
            <option value="newest">Nouveautés</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
            <option value="name-asc">Nom (A → Z)</option>
          </select>
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col gap-2.5">
            <label className="font-jost text-xs tracking-[0.2em] uppercase text-gray2">Budget min</label>
            <input
              type="number"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              placeholder="0$"
              className="bg-bg border border-white/10 px-4 py-2.5 text-sm w-32"
            />
          </div>
          <div className="flex flex-col gap-2.5">
            <label className="font-jost text-xs tracking-[0.2em] uppercase text-gray2">Budget max</label>
            <input
              type="number"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              placeholder="Illimité"
              className="bg-bg border border-white/10 px-4 py-2.5 text-sm w-32"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <label className="font-jost text-xs tracking-[0.2em] uppercase text-gray2">Mettre en avant</label>
          <div className="flex gap-2 flex-wrap">
            {badgeTabs.map((b) => {
              const isActive = badgeFilters.includes(b.key);
              return (
                <button
                  key={b.key}
                  onClick={() => toggleBadgeFilter(b.key)}
                  className={`px-4 py-2 border text-xs font-jost tracking-[0.1em] uppercase transition ${
                    isActive ? "bg-gold border-gold text-bg" : "border-white/10 text-gray1 hover:border-gold"
                  }`}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        </div>

        <p className="font-jost text-xs tracking-[0.12em] text-gray2 w-full">
          {filtered.length} véhicule{filtered.length > 1 ? "s" : ""} affiché{filtered.length > 1 ? "s" : ""}
        </p>
      </div>

      {/* ================= SECTIONS ================= */}
      <div className="flex flex-col gap-24">
        {sections.map(({ catKey, items }) => {
          const theme = themeFor(catKey);
          const Icon = theme.icon;
          return (
            <div key={catKey}>
              {/* En-tête éditorial */}
              <div className="flex items-end justify-between gap-6 mb-8 pb-6" style={{ borderBottom: `1px solid ${theme.accent}35` }}>
                <div className="flex items-center gap-5">
                  <span
                    className="w-14 h-14 flex items-center justify-center border shrink-0"
                    style={{ borderColor: theme.accent, color: theme.accent }}
                  >
                    <Icon className="w-6 h-6" />
                  </span>
                  <div>
                    <h3 className="font-jost text-3xl md:text-4xl tracking-[0.03em] uppercase leading-none" style={{ color: theme.accent }}>
                      {theme.label}
                    </h3>
                    <p className="font-serif-brand italic text-gray1 text-base mt-1.5">{theme.tagline}</p>
                  </div>
                </div>
                <p className="font-jost text-xs tracking-[0.15em] uppercase text-gray2 shrink-0 hidden sm:block">
                  {items.length} véhicule{items.length > 1 ? "s" : ""}
                </p>
              </div>

              {catKey === "air" && <AirLayout items={items} theme={theme} onSelect={openVehicle} />}
              {catKey === "land" && <LandLayout items={items} theme={theme} onSelect={openVehicle} />}
              {catKey === "sea" && <SeaLayout items={items} theme={theme} onSelect={openVehicle} />}
              {!["air", "land", "sea"].includes(catKey) && <LandLayout items={items} theme={theme} onSelect={openVehicle} />}
            </div>
          );
        })}

        {sections.length === 0 && (
          <div className="py-20 text-center text-gray2 font-jost text-xs tracking-[0.15em] uppercase bg-card border border-white/10">
            Aucun véhicule ne correspond à ces critères.
          </div>
        )}
      </div>

      {/* ================= MODALE DÉTAIL ================= */}
      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/85 backdrop-blur"
          onClick={(e) => e.target === e.currentTarget && setActive(null)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[92vh] overflow-auto border bg-[#082238] md:grid md:grid-cols-[1.3fr_1fr]"
            style={{ borderColor: `${themeFor(active.category).accent}55` }}
          >
            <button
              onClick={() => setActive(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 border border-white/10 bg-black/50 text-gray1 hover:text-goldlight hover:border-gold transition"
            >
              ×
            </button>

            {/* Galerie photos */}
            {(() => {
              const photos = [active.imageUrl, active.imageUrl2, active.imageUrl3, active.imageUrl4].filter(
                (p): p is string => !!p
              );
              const current = photos[galleryIndex] || photos[0];
              return (
                <div>
                  <div
                    className={`relative overflow-hidden w-full bg-black/40 ${
                      active.imageAspect === "square" ? "aspect-square" : "aspect-video md:h-full md:aspect-auto"
                    }`}
                  >
                    <div
                      className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 rounded-full pointer-events-none opacity-60 blur-2xl z-10"
                      style={{ backgroundColor: themeFor(active.category).accent }}
                    />
                    <img
                      src={current}
                      alt={active.name}
                      className="w-full h-full object-cover"
                      onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                    />
                  </div>
                  {photos.length > 1 && (
                    <div className="flex gap-2 p-3 bg-black/30">
                      {photos.map((p, i) => (
                        <button
                          key={i}
                          onClick={() => setGalleryIndex(i)}
                          className={`w-16 h-12 shrink-0 overflow-hidden border transition ${
                            i === galleryIndex ? "border-gold" : "border-white/10 opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img src={p} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="p-8 md:p-10 md:overflow-y-auto">
              <p
                className="flex items-center gap-2 font-jost text-xs tracking-[0.22em] uppercase"
                style={{ color: themeFor(active.category).accent }}
              >
                {(() => {
                  const Icon = themeFor(active.category).icon;
                  return <Icon className="w-3.5 h-3.5" />;
                })()}
                {active.categoryLabel}
                {active.subCategory && <span className="text-gray2">· {active.subCategory}</span>}
              </p>
              <h2 className="font-jost text-2xl md:text-3xl tracking-[0.05em] uppercase mt-2">{active.name}</h2>
              <div className="w-12 h-px my-5" style={{ backgroundColor: themeFor(active.category).accent }} />
              <p className="text-gray1 text-sm leading-relaxed">
                {active.description ||
                  "Ce modèle fait partie de la sélection ELITE PRESTIGE. Les modalités de location sont confirmées selon la disponibilité et la durée souhaitée."}
              </p>
              <div className="mt-5 p-3 border border-white/10 text-gray2 font-jost text-xs tracking-[0.12em]">
                MODEL · {active.model}
              </div>
              {(active.price != null || active.price3d != null || active.price7d != null) ? (
                <div className="mt-5 border border-white/10 divide-y divide-white/10">
                  {active.price != null && (
                    <div className="flex justify-between px-4 py-3 text-sm">
                      <span className="text-gray1">24 heures</span>
                      <span className="text-goldlight">{active.price.toLocaleString("fr-FR")}$</span>
                    </div>
                  )}
                  {active.price3d != null && (
                    <div className="flex justify-between px-4 py-3 text-sm">
                      <span className="text-gray1">3 jours</span>
                      <span className="text-goldlight">{active.price3d.toLocaleString("fr-FR")}$</span>
                    </div>
                  )}
                  {active.price7d != null && (
                    <div className="flex justify-between px-4 py-3 text-sm">
                      <span className="text-gray1">1 semaine</span>
                      <span className="text-goldlight">{active.price7d.toLocaleString("fr-FR")}$</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="mt-4 text-goldlight font-jost text-base">Tarif : {active.priceLabel}</p>
              )}
              <button
                onClick={() => setActive(null)}
                className="mt-7 w-full border border-white/10 py-3.5 font-jost text-xs tracking-[0.18em] uppercase hover:border-gold hover:text-goldlight transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ================= MISES EN PAGE PAR CATÉGORIE ================= */

// AÉRIEN — un modèle vedette en grand, les autres en liste élancée à droite
function AirLayout({ items, theme, onSelect }: { items: Vehicle[]; theme: Theme; onSelect: (v: Vehicle) => void }) {
  const [featured, ...rest] = items;
  if (!featured) return null;

  return (
    <div className="flex flex-col gap-3">
      <PanoramicCard item={featured} theme={theme} onSelect={onSelect} />
      {rest.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 auto-rows-fr">
          {rest.map((v) => (
            <DenseCard key={v.id} item={v} theme={theme} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

// TERRESTRE — grille dense, façon showroom
function LandLayout({ items, theme, onSelect }: { items: Vehicle[]; theme: Theme; onSelect: (v: Vehicle) => void }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 auto-rows-fr">
      {items.map((v) => (
        <DenseCard key={v.id} item={v} theme={theme} onSelect={onSelect} />
      ))}
    </div>
  );
}

// MARITIME — grands bandeaux panoramiques empilés
function SeaLayout({ items, theme, onSelect }: { items: Vehicle[]; theme: Theme; onSelect: (v: Vehicle) => void }) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((v) => (
        <PanoramicCard key={v.id} item={v} theme={theme} onSelect={onSelect} />
      ))}
    </div>
  );
}

/* ================= CARTES ================= */

function VehicleBadges({ item, theme }: { item: Vehicle; theme: Theme }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {item.badgeNew && (
        <span className="px-2.5 py-1.5 bg-gold text-bg font-jost text-[0.55rem] tracking-[0.1em] uppercase">Nouveau</span>
      )}
      {item.badgePromotion && (
        <span className="px-2.5 py-1.5 bg-red-500/90 text-white font-jost text-[0.55rem] tracking-[0.1em] uppercase">
          Promotion
        </span>
      )}
      {item.badgeTrending && (
        <span
          className="px-2.5 py-1.5 border bg-black/40 font-jost text-[0.55rem] tracking-[0.1em] uppercase"
          style={{ borderColor: theme.accent, color: theme.accent }}
        >
          Tendance
        </span>
      )}
    </div>
  );
}

function DenseCard({ item, theme, onSelect }: { item: Vehicle; theme: Theme; onSelect: (v: Vehicle) => void }) {
  const isSquare = item.imageAspect === "square";
  return (
    <article
      className={`relative bg-card overflow-hidden group rounded-lg ${isSquare ? "aspect-square" : "aspect-video col-span-2"}`}
    >
      <div
        className="absolute -top-6 -right-6 w-28 h-28 rounded-full pointer-events-none opacity-70 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ backgroundColor: theme.accent }}
      />
      <div
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 rounded-full pointer-events-none opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-90"
        style={{ backgroundColor: theme.accent }}
      />
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(150deg, #123b61 0%, #082238 45%, #020f1c 100%)` }}
      >
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover opacity-95 transition-transform duration-500 group-hover:scale-110"
          onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
        />
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: "inset 0 0 60px 15px rgba(2,15,28,0.55)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/15 to-transparent" />
      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        <div className="flex justify-end">
          <VehicleBadges item={item} theme={theme} />
        </div>
        <div>
          <div className="w-8 h-px mb-2.5" style={{ backgroundColor: theme.accent }} />
          {item.subCategory && (
            <p className="font-jost text-[0.55rem] tracking-[0.1em] uppercase text-gray2 mb-0.5">{item.subCategory}</p>
          )}
          <h4 className="font-jost text-sm tracking-[0.03em] truncate">{item.name}</h4>
          <p className="text-gray1 text-xs mt-1.5">
            <span style={{ color: theme.accent }}>{item.priceLabel}</span>
          </p>
          <button
            onClick={() => onSelect(item)}
            className="mt-3 font-jost text-[0.6rem] tracking-[0.12em] uppercase text-gray1 hover:text-cream transition"
          >
            Voir →
          </button>
        </div>
      </div>
    </article>
  );
}

function PanoramicCard({ item, theme, onSelect }: { item: Vehicle; theme: Theme; onSelect: (v: Vehicle) => void }) {
  const isSquare = item.imageAspect === "square";
  return (
    <article
      className={`relative bg-card overflow-hidden group rounded-lg ${
        isSquare ? "aspect-square max-w-xl mx-auto" : "aspect-video md:aspect-[21/9]"
      }`}
    >
      <div
        className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none opacity-70 blur-3xl transition-opacity duration-500 group-hover:opacity-100 z-10"
        style={{ backgroundColor: theme.accent }}
      />
      <div
        className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-2/3 h-20 rounded-full pointer-events-none opacity-60 blur-3xl transition-opacity duration-500 group-hover:opacity-90 z-10"
        style={{ backgroundColor: theme.accent }}
      />
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(120deg, #082238 0%, #020f1c 60%)` }}
      >
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover opacity-95 transition-transform duration-700 group-hover:scale-105"
          onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
        />
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: "inset 0 0 100px 20px rgba(2,15,28,0.55)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/45 to-black/10" />
      <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-center max-w-md">
        <div className="flex gap-2 mb-4">
          <VehicleBadges item={item} theme={theme} />
        </div>
        <div className="w-12 h-px mb-4" style={{ backgroundColor: theme.accent }} />
        <h4 className="font-jost text-2xl md:text-3xl tracking-[0.05em]">{item.name}</h4>
        <p className="text-gray2 font-jost text-xs tracking-[0.12em] mt-1.5">MODEL · {item.model}</p>
        <p className="text-gray1 text-sm mt-2.5">
          Tarif : <span className="text-goldlight">{item.priceLabel}</span>
        </p>
        <button
          onClick={() => onSelect(item)}
          className="mt-5 flex items-center gap-2 font-jost text-xs tracking-[0.16em] uppercase text-cream transition w-fit"
          onMouseEnter={(e) => (e.currentTarget.style.color = theme.accent)}
          onMouseLeave={(e) => (e.currentTarget.style.color = "")}
        >
          Voir le véhicule <span className="w-6 h-px" style={{ backgroundColor: theme.accent }} />
        </button>
      </div>
    </article>
  );
}
