"use client";

import { useMemo, useState } from "react";

type Choice = { id: string; label: string; imageUrl: string | null; price: number | null };
type Category = {
  id: string;
  key: string;
  label: string;
  description: string | null;
  type: string; // "choice" | "text"
  multiple: boolean;
  price: number;
  sortOrder: number;
  imageAspect: string; // "video" | "square"
  textPositionX: number;
  textPositionY: number;
  textFontFamily: string | null;
  textItalic: boolean;
  textFontSize: number;
  textColor: string;
  choices: Choice[];
};
type YachtPackage = { id: string; label: string; price: number; imageUrl: string };
type GalleryImage = { id: string; imageUrl: string; caption: string | null };

type Step =
  | { kind: "package" }
  | { kind: "category"; category: Category }
  | { kind: "text-group"; categories: Category[] }
  | { kind: "recap" };

function stepTitle(step: Step): string {
  if (step.kind === "package") return "Forfait";
  if (step.kind === "category") return step.category.label;
  if (step.kind === "text-group") return "Texte";
  return "Récapitulatif";
}

export default function YachtConfigurator({
  packages,
  categories,
  gallery = [],
  trigger = "banner",
  presentationImageUrl,
  textBackgroundImageUrl,
  textBackgroundAspect = "video",
  packageStepOrder = -1
}: {
  packages: YachtPackage[];
  categories: Category[];
  gallery?: GalleryImage[];
  trigger?: "banner" | "button";
  presentationImageUrl?: string | null;
  textBackgroundImageUrl?: string | null;
  textBackgroundAspect?: string;
  packageStepOrder?: number;
}) {
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [packageId, setPackageId] = useState(packages[0]?.id ?? "");

  // Sélection simple : le 1er choix de chaque option à choix unique est inclus par défaut.
  const [singleChoice, setSingleChoice] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const cat of categories) {
      if (cat.type === "choice" && !cat.multiple && cat.choices.length > 0) initial[cat.id] = cat.choices[0].id;
    }
    return initial;
  });
  // Sélection multiple : aucun extra inclus par défaut, chacun ajoute son propre prix.
  const [multiChoice, setMultiChoice] = useState<Record<string, string[]>>({});
  const [textValues, setTextValues] = useState<Record<string, string>>({});

  const steps: Step[] = useMemo(() => {
    const list: Step[] = [];
    const textCategories = categories.filter((c) => c.type === "text");
    let textGroupAdded = false;
    let packageInserted = false;

    const insertPackageIfDue = (currentOrder: number) => {
      if (!packageInserted && packageStepOrder <= currentOrder) {
        list.push({ kind: "package" });
        packageInserted = true;
      }
    };

    for (const cat of categories) {
      insertPackageIfDue(cat.sortOrder);
      if (cat.type === "text") {
        if (!textGroupAdded && textCategories.length > 0) {
          list.push({ kind: "text-group", categories: textCategories });
          textGroupAdded = true;
        }
        continue;
      }
      list.push({ kind: "category", category: cat });
    }
    if (!packageInserted) list.push({ kind: "package" });
    list.push({ kind: "recap" });
    return list;
  }, [categories, packageStepOrder]);

  const selectedPackage = packages.find((p) => p.id === packageId) ?? packages[0];

  const isDefaultSingle = (cat: Category, choiceId: string | undefined) =>
    !choiceId || cat.choices[0]?.id === choiceId;

  const total = useMemo(() => {
    let sum = selectedPackage?.price ?? 0;
    for (const cat of categories) {
      if (cat.type === "choice" && cat.multiple) {
        for (const choiceId of multiChoice[cat.id] || []) {
          const choice = cat.choices.find((c) => c.id === choiceId);
          sum += choice?.price ?? 0;
        }
      } else if (cat.type === "choice") {
        if (!isDefaultSingle(cat, singleChoice[cat.id])) sum += cat.price;
      } else if (cat.type === "text") {
        if (textValues[cat.id]?.trim()) sum += cat.price;
      }
    }
    return sum;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPackage, categories, singleChoice, multiChoice, textValues]);

  const primaryChoiceCategory = categories.find((c) => c.type === "choice" && !c.multiple);
  const primaryChoice = primaryChoiceCategory?.choices.find((c) => c.id === singleChoice[primaryChoiceCategory.id]);
  const baseImage = primaryChoice?.imageUrl || selectedPackage?.imageUrl;
  const bannerImage = presentationImageUrl || baseImage;

  function openAt(index: number) {
    setStepIndex(index);
    setOpen(true);
  }

  function goNext() {
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  }
  function goPrev() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  function toggleMulti(categoryId: string, choiceId: string) {
    setMultiChoice((s) => {
      const current = s[categoryId] || [];
      const next = current.includes(choiceId)
        ? current.filter((id) => id !== choiceId)
        : [...current, choiceId];
      return { ...s, [categoryId]: next };
    });
  }

  function submitConfiguration() {
    const lines: string[] = [`Forfait : ${selectedPackage?.label}`];
    for (const cat of categories) {
      if (cat.type === "choice" && cat.multiple) {
        const selected = (multiChoice[cat.id] || [])
          .map((id) => cat.choices.find((c) => c.id === id)?.label)
          .filter(Boolean);
        if (selected.length > 0) lines.push(`${cat.label} : ${selected.join(", ")}`);
      } else if (cat.type === "choice") {
        const choice = cat.choices.find((c) => c.id === singleChoice[cat.id]);
        if (choice) lines.push(`${cat.label} : ${choice.label}`);
      } else if (cat.type === "text" && textValues[cat.id]?.trim()) {
        lines.push(`${cat.label} : ${textValues[cat.id]}`);
      }
    }
    alert(
      `Configuration enregistrée :\n\n${lines.join("\n")}\n\nTotal : ${total.toLocaleString(
        "fr-FR"
      )}$\n\nEnvoie ce récapitulatif via le formulaire de réservation ou le Discord pour confirmer.`
    );
  }

  if (packages.length === 0) return null;

  const current = steps[stepIndex];

  const modalAspectClass = "md:aspect-video";
  const modalMaxWidthClass = "max-w-[1800px]";

  return (
    <>
      {trigger === "banner" ? (
        <button
          onClick={() => openAt(0)}
          className="w-full relative h-[220px] md:h-[280px] border border-gold/30 bg-card overflow-hidden group text-left"
        >
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#123b61] via-[#082238] to-[#020f1c]">
            {bannerImage && (
              <img
                src={bannerImage}
                alt="Mega Yacht ELITE PRESTIGE"
                className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
              />
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/30 to-transparent" />
          <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-center max-w-md">
            <p className="font-jost text-[0.65rem] tracking-[0.28em] uppercase text-gold mb-3">Configurateur</p>
            <h3 className="font-jost text-2xl md:text-3xl tracking-[0.06em] uppercase mb-3">Mega Yacht sur mesure</h3>
            <p className="text-gray1 text-sm mb-5">
              Couleur, nom, drapeau... personnalisez votre Mega Yacht selon vos goûts.
            </p>
            <span className="inline-flex items-center gap-2 font-jost text-[0.62rem] tracking-[0.18em] uppercase text-goldlight w-fit">
              À partir de {Math.min(...packages.map((p) => p.price)).toLocaleString("fr-FR")}$
              <span className="w-6 h-px bg-gold" />
              Personnaliser
            </span>
          </div>
        </button>
      ) : (
        <button
          onClick={() => openAt(0)}
          className="bg-gold text-bg py-4 px-10 font-jost text-[0.65rem] tracking-[0.2em] uppercase hover:bg-goldlight transition"
        >
          Lancer le configurateur
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/88 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            className={`relative w-full ${modalMaxWidthClass} max-h-[94vh] ${modalAspectClass} border border-gold/30 bg-[#071f36] flex flex-col overflow-hidden transition-[max-width] duration-300`}
            style={{ boxShadow: "0 0 0 1px rgba(201,162,76,0.06), 0 40px 100px -20px rgba(0,0,0,0.9), 0 0 140px -40px rgba(201,162,76,0.25)" }}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-6 right-6 z-10 w-10 h-10 border border-white/10 bg-black/50 text-gray1 hover:text-goldlight hover:border-gold transition"
            >
              ×
            </button>

            {/* En-tête d'étapes */}
            <div className="px-8 md:px-12 pt-8 md:pt-10 shrink-0">
              <div className="flex items-center gap-1.5 mb-4">
                {steps.map((_, i) => (
                  <span
                    key={i}
                    className="h-[3px] flex-1 min-w-[14px] transition-all duration-300"
                    style={{ backgroundColor: i <= stepIndex ? "#c9a24c" : "rgba(255,255,255,0.08)" }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between">
                <p className="font-jost text-[0.65rem] tracking-[0.2em] uppercase text-gray2">
                  Étape {stepIndex + 1} / {steps.length}
                </p>
                <p className="font-jost text-[0.65rem] tracking-[0.2em] uppercase text-goldlight">
                  {stepTitle(current)}
                </p>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-8 md:px-12 py-8 md:py-10">
              {current.kind === "package" && (
                <div>
                  <p className="font-jost text-xs tracking-[0.22em] uppercase text-gold mb-1.5">Bienvenue</p>
                  <h2 className="font-jost text-2xl md:text-3xl tracking-[0.04em] uppercase mb-3">Choisissez votre forfait</h2>
                  <p className="text-sm text-gray2 mb-9 max-w-md leading-relaxed">
                    Le point de départ de votre Mega Yacht ELITE PRESTIGE. Vous pourrez ensuite personnaliser chaque
                    détail, ou passer directement au récapitulatif.
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4 max-w-xl">
                    {packages.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setPackageId(p.id)}
                        className={`text-left border overflow-hidden transition ${
                          packageId === p.id ? "border-gold bg-gold/10" : "border-white/10 hover:border-gold/60"
                        }`}
                      >
                        {p.imageUrl && (
                          <div className="w-full aspect-video bg-black/40">
                            <img src={p.imageUrl} alt={p.label} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="p-4">
                          <p className="font-jost text-sm tracking-[0.05em]">{p.label}</p>
                          <p className="font-jost text-xs text-goldlight mt-1">{p.price.toLocaleString("fr-FR")}$</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}              

              {current.kind === "category" && (
                <CategoryStep
                  category={current.category}
                  singleChoice={singleChoice}
                  multiChoice={multiChoice}
                  onSelectSingle={(choiceId) =>
                    setSingleChoice((s) => ({ ...s, [current.category.id]: choiceId }))
                  }
                  onToggleMulti={(choiceId) => toggleMulti(current.category.id, choiceId)}
                />
              )}

              {current.kind === "text-group" && (
                <div className={textBackgroundImageUrl ? "lg:grid lg:grid-cols-[1.4fr_1fr] lg:gap-12 lg:items-start" : ""}>
                  {textBackgroundImageUrl && (
                    <div className="lg:sticky lg:top-0 mb-8 lg:mb-0">
                      <div
                        className={`relative w-full border border-white/10 overflow-hidden bg-black/30 ${
                          textBackgroundAspect === "square" ? "aspect-square max-w-lg mx-auto lg:mx-0" : "aspect-video"
                        }`}
                        style={{ boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)" }}
                      >
                        <img src={textBackgroundImageUrl} alt="Aperçu de l'écriture" className="w-full h-full object-cover" />
                        {current.categories.map((cat) => {
                          const value = textValues[cat.id];
                          return (
                            <span
                              key={cat.id}
                              className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap px-2 pointer-events-none"
                              style={{
                                left: `${cat.textPositionX}%`,
                                top: `${cat.textPositionY}%`,
                                fontFamily: cat.textFontFamily || undefined,
                                fontStyle: cat.textItalic ? "italic" : "normal",
                                fontSize: `${cat.textFontSize}px`,
                                color: cat.textColor,
                                opacity: value ? 1 : 0.35
                              }}
                            >
                              {value || cat.label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-3 mb-7">
                      <div>
                        <p className="font-jost text-xs tracking-[0.24em] uppercase text-gold mb-1.5">Personnalisation</p>
                        <h2 className="font-jost text-2xl md:text-3xl tracking-[0.04em] uppercase">Texte</h2>
                      </div>
                      <span className="font-jost text-[0.62rem] tracking-[0.15em] uppercase text-gray2 border border-white/10 px-3 py-1.5 shrink-0">
                        Facultatif
                      </span>
                    </div>

                    <div className="flex flex-col gap-6">
                      {current.categories.map((cat) => (
                        <div key={cat.id}>
                          <p className="font-jost text-xs tracking-[0.15em] uppercase text-gray1 mb-1.5">
                            {cat.label} <span className="text-goldlight">(+{cat.price.toLocaleString("fr-FR")}$)</span>
                          </p>
                          {cat.description && <p className="text-sm text-gray2 mb-3 leading-relaxed">{cat.description}</p>}
                          <input
                            value={textValues[cat.id] ?? ""}
                            onChange={(e) => setTextValues((s) => ({ ...s, [cat.id]: e.target.value }))}
                            placeholder={cat.label.toUpperCase()}
                            style={{
                              fontFamily: cat.textFontFamily || undefined,
                              fontStyle: cat.textItalic ? "italic" : "normal"
                            }}
                            className="w-full bg-bg border border-white/10 px-4 py-3.5 text-sm focus:border-gold transition"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {current.kind === "recap" && (
                <div className="flex flex-col gap-9 flex-1">
                  <div>
                    <p className="font-jost text-xs tracking-[0.24em] uppercase text-gold mb-1.5">Dernière étape</p>
                    <h2 className="font-jost text-3xl md:text-4xl tracking-[0.04em] uppercase">Récapitulatif</h2>
                    <p className="text-sm text-gray2 mt-2 max-w-lg">
                      Voici votre Mega Yacht ELITE PRESTIGE tel que vous venez de le composer.
                    </p>
                  </div>

                  {/* Forfait — grand bandeau */}
                  {selectedPackage?.imageUrl && (
                    <div className="relative w-full aspect-[21/9] border border-white/10 overflow-hidden">
                      <img
                        src={selectedPackage.imageUrl}
                        alt={selectedPackage.label}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                      <div className="absolute inset-0 p-6 flex flex-col justify-end">
                        <p className="font-jost text-[0.62rem] tracking-[0.2em] uppercase text-goldlight mb-1">Forfait</p>
                        <div className="flex items-end justify-between gap-4 flex-wrap">
                          <h3 className="font-jost text-xl md:text-2xl tracking-[0.04em] uppercase">{selectedPackage.label}</h3>
                          <span className="font-jost text-lg text-goldlight">
                            {selectedPackage.price.toLocaleString("fr-FR")}$
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Options choisies, avec image */}
                  {(() => {
                    const imageCards: JSX.Element[] = [];
                    for (const cat of categories) {
                      if (cat.type !== "choice") continue;
                      if (cat.multiple) {
                        const selected = (multiChoice[cat.id] || [])
                          .map((id) => cat.choices.find((c) => c.id === id))
                          .filter((c): c is Choice => !!c && !!c.imageUrl);
                        for (const choice of selected) {
                          imageCards.push(
                            <RecapImageCard
                              key={choice.id}
                              image={choice.imageUrl!}
                              label={cat.label}
                              value={choice.label}
                              price={choice.price ? `+${choice.price.toLocaleString("fr-FR")}$` : "Inclus"}
                            />
                          );
                        }
                      } else {
                        const choice = cat.choices.find((c) => c.id === singleChoice[cat.id]);
                        if (choice?.imageUrl) {
                          imageCards.push(
                            <RecapImageCard key={cat.id} image={choice.imageUrl} label={cat.label} value={choice.label} />
                          );
                        }
                      }
                    }
                    if (imageCards.length === 0) return null;
                    return (
                      <div>
                        <p className="font-jost text-xs tracking-[0.2em] uppercase text-gray1 mb-4">
                          Vos options personnalisées
                        </p>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{imageCards}</div>
                      </div>
                    );
                  })()}

                  {/* Texte et éventuels choix sans image */}
                  {(() => {
                    const lines = categories
                      .map((cat) => {
                        if (cat.type === "text" && textValues[cat.id]?.trim()) {
                          return <RecapLine key={cat.id} label={cat.label} value={textValues[cat.id]} />;
                        }
                        if (cat.type === "choice" && !cat.multiple) {
                          const choice = cat.choices.find((c) => c.id === singleChoice[cat.id]);
                          if (choice && !choice.imageUrl) {
                            return <RecapLine key={cat.id} label={cat.label} value={choice.label} />;
                          }
                        }
                        return null;
                      })
                      .filter(Boolean);
                    if (lines.length === 0) return null;
                    return (
                      <div>
                        <p className="font-jost text-xs tracking-[0.2em] uppercase text-gray1 mb-4">Gravure et détails</p>
                        <div className="border border-white/10 divide-y divide-white/10">{lines}</div>
                      </div>
                    );
                  })()}

                  <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-auto">
                    <span className="font-jost text-sm tracking-[0.15em] uppercase text-gray1">Total estimé</span>
                    <span className="font-jost text-3xl text-goldlight">{total.toLocaleString("fr-FR")}$</span>
                  </div>

                  <button
                    onClick={submitConfiguration}
                    className="bg-gold text-bg py-4 font-jost text-xs tracking-[0.2em] uppercase hover:bg-goldlight transition"
                  >
                    Envoyer cette configuration
                  </button>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="shrink-0 px-8 md:px-12 py-6 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={goPrev}
                disabled={stepIndex === 0}
                className="font-jost text-[0.62rem] tracking-[0.15em] uppercase text-gray1 hover:text-goldlight transition disabled:opacity-30 disabled:hover:text-gray1"
              >
                ← Précédent
              </button>
              {current.kind !== "recap" && (
                <button
                  onClick={goNext}
                  className="bg-gold text-bg px-6 py-2.5 font-jost text-[0.62rem] tracking-[0.15em] uppercase hover:bg-goldlight transition"
                >
                  Suivant →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function RecapLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 px-4 py-3 text-sm">
      <span className="text-gray1">{label}</span>
      <span className="text-cream text-right">{value}</span>
    </div>
  );
}

function RecapImageCard({
  image,
  label,
  value,
  price
}: {
  image: string;
  label: string;
  value: string;
  price?: string;
}) {
  return (
    <div className="border border-white/10 overflow-hidden">
      <div className="w-full aspect-video bg-black/40">
        <img src={image} alt={value} className="w-full h-full object-cover" />
      </div>
      <div className="p-4 flex items-center justify-between gap-2">
        <div>
          <p className="font-jost text-[0.6rem] tracking-[0.15em] uppercase text-gray2">{label}</p>
          <p className="font-jost text-sm text-cream mt-0.5">{value}</p>
        </div>
        {price && <span className="font-jost text-xs text-goldlight shrink-0">{price}</span>}
      </div>
    </div>
  );
}

function CategoryStep({
  category,
  singleChoice,
  multiChoice,
  onSelectSingle,
  onToggleMulti
}: {
  category: Category;
  singleChoice: Record<string, string>;
  multiChoice: Record<string, string[]>;
  onSelectSingle: (choiceId: string) => void;
  onToggleMulti: (choiceId: string) => void;
}) {
  const selectedSingleId = singleChoice[category.id];
  const selectedSingle = category.choices.find((c) => c.id === selectedSingleId);
  const selectedMultiIds = multiChoice[category.id] || [];
  const hasBigImage = !category.multiple && selectedSingle?.imageUrl;

  return (
    <div className={hasBigImage ? "lg:grid lg:grid-cols-[1.5fr_1fr] lg:gap-12 lg:items-start" : ""}>
      {hasBigImage && (
        <div className="lg:sticky lg:top-0 mb-8 lg:mb-0">
          <div
            className={`w-full border border-white/10 overflow-hidden ${
              category.imageAspect === "square" ? "aspect-square max-w-lg mx-auto lg:mx-0" : "aspect-video"
            }`}
            style={{ boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)" }}
          >
            <img src={selectedSingle!.imageUrl!} alt={selectedSingle!.label} className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      <div className="lg:max-h-[520px] lg:overflow-y-auto lg:pr-2">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div>
            <p className="font-jost text-xs tracking-[0.24em] uppercase text-gold mb-1.5">Personnalisation</p>
            <h2 className="font-jost text-2xl md:text-3xl tracking-[0.04em] uppercase">{category.label}</h2>
          </div>
          <span className="font-jost text-[0.62rem] tracking-[0.15em] uppercase text-gray2 border border-white/10 px-3 py-1.5 shrink-0">
            Facultatif
          </span>
        </div>
        {category.description && <p className="text-sm text-gray2 mb-7 leading-relaxed">{category.description}</p>}

        {category.choices.length === 0 && (
          <p className="text-sm text-gray2">Aucun choix disponible pour l'instant.</p>
        )}

        {category.multiple ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {category.choices.map((choice) => {
              const isSelected = selectedMultiIds.includes(choice.id);
              return (
                <button
                  key={choice.id}
                  onClick={() => onToggleMulti(choice.id)}
                  className={`text-left border overflow-hidden transition ${
                    isSelected ? "border-gold bg-gold/10" : "border-white/10 hover:border-gold/60"
                  }`}
                >
                  {choice.imageUrl && (
                    <div className={`w-full bg-black/40 ${category.imageAspect === "square" ? "aspect-square" : "aspect-video"}`}>
                      <img src={choice.imageUrl} alt={choice.label} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-4 flex items-center justify-between gap-2">
                    <span className="font-jost text-sm text-cream">{choice.label}</span>
                    <span className="font-jost text-xs text-goldlight shrink-0">
                      {choice.price ? `+${choice.price.toLocaleString("fr-FR")}$` : "Inclus"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {category.choices.map((choice, i) => (
              <button
                key={choice.id}
                onClick={() => onSelectSingle(choice.id)}
                className={`flex flex-col gap-2 p-2 border transition ${
                  selectedSingleId === choice.id ? "border-gold bg-gold/10" : "border-white/10 hover:border-gold/60"
                }`}
              >
                {choice.imageUrl ? (
                  <span
                    className={`block overflow-hidden bg-black/40 ${
                      category.imageAspect === "square" ? "w-20 h-20" : "w-28 h-16"
                    }`}
                  >
                    <img src={choice.imageUrl} alt={choice.label} className="w-full h-full object-cover" />
                  </span>
                ) : (
                  <span
                    className={`block bg-black/40 flex items-center justify-center text-[0.62rem] text-gray2 ${
                      category.imageAspect === "square" ? "w-20 h-20" : "w-28 h-16"
                    }`}
                  >
                    Sans image
                  </span>
                )}
                <span className="font-jost text-xs tracking-[0.04em] text-cream">
                  {choice.label}
                  {i === 0 && <span className="text-gray2"> · inclus</span>}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
