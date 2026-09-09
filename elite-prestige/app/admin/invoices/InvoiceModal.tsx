"use client";

import { useMemo, useState } from "react";
import { createInvoice, searchClients } from "./actions";

type VehicleOption = {
  id: string;
  name: string;
  categoryLabel: string;
  licensePlate: string | null;
  vehicleUuid: string | null;
  price: number | null;
  price3d: number | null;
  price7d: number | null;
};

type ClientSuggestion = { id: string; name: string; phone: string };

const DURATIONS = [
  { key: "24h", label: "24 heures" },
  { key: "3j", label: "3 jours" },
  { key: "7j", label: "1 semaine" }
];

export default function InvoiceModal({ vehicles }: { vehicles: VehicleOption[] }) {
  const [open, setOpen] = useState(false);
  const [vehicleId, setVehicleId] = useState("");
  const [plateSearch, setPlateSearch] = useState("");
  const [duration, setDuration] = useState("24h");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [suggestions, setSuggestions] = useState<ClientSuggestion[]>([]);
  const [licenseImage, setLicenseImage] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selected = vehicles.find((v) => v.id === vehicleId) || null;

  const plateMatch = useMemo(() => {
    if (!plateSearch.trim()) return null;
    return vehicles.find((v) => v.licensePlate?.toLowerCase() === plateSearch.trim().toLowerCase()) || null;
  }, [plateSearch, vehicles]);

  const price = selected
    ? duration === "3j"
      ? selected.price3d
      : duration === "7j"
      ? selected.price7d
      : selected.price
    : null;

  function reset() {
    setVehicleId("");
    setPlateSearch("");
    setDuration("24h");
    setClientName("");
    setClientPhone("");
    setSuggestions([]);
    setLicenseImage("");
    setError("");
  }

  async function onClientNameChange(value: string) {
    setClientName(value);
    if (value.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const results = await searchClients(value);
    setSuggestions(results);
  }

  function pickSuggestion(s: ClientSuggestion) {
    setClientName(s.name);
    setClientPhone(s.phone);
    setSuggestions([]);
  }

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (!file) continue;
        const reader = new FileReader();
        reader.onload = () => setLicenseImage(String(reader.result));
        reader.readAsDataURL(file);
        e.preventDefault();
        break;
      }
    }
  }

  async function handleSubmit() {
    if (!selected || price == null) return;
    setSubmitting(true);
    setError("");
    try {
      const formData = new FormData();
      formData.set("vehicleId", selected.id);
      formData.set("duration", duration);
      formData.set("clientName", clientName.trim());
      formData.set("clientPhone", clientPhone.trim());
      formData.set("driverLicenseImage", licenseImage);
      await createInvoice(formData);
      setOpen(false);
      reset();
    } catch (e: any) {
      setError(e?.message || "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-gold text-bg px-6 py-3 font-jost text-xs tracking-[0.15em] uppercase hover:bg-goldlight transition"
      >
        Entrer une facture
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="w-full max-w-lg border border-gold/30 bg-card p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="font-jost text-lg tracking-[0.15em] uppercase mb-6">Nouvelle facture</h2>

            <div className="flex flex-col gap-5 mb-6">
              <div>
                <label className="font-jost text-[0.6rem] tracking-[0.15em] uppercase text-gray2">
                  Sélectionner le véhicule
                </label>
                <select
                  value={vehicleId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setVehicleId(id);
                    const v = vehicles.find((x) => x.id === id);
                    setPlateSearch(v?.licensePlate || "");
                  }}
                  className="w-full bg-bg border border-white/10 px-4 py-3 text-sm mt-2"
                >
                  <option value="">Sélectionner un véhicule</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                      {v.licensePlate ? ` — ${v.licensePlate}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-jost text-[0.6rem] tracking-[0.15em] uppercase text-gray2">
                  Ou plaque d'immatriculation
                </label>
                <div className="flex gap-2 mt-2">
                  <input
                    value={plateSearch}
                    onChange={(e) => setPlateSearch(e.target.value)}
                    placeholder="ex : ABC-123"
                    className="flex-1 bg-bg border border-white/10 px-4 py-3 text-sm focus:border-gold transition"
                  />
                  <button
                    type="button"
                    disabled={!plateMatch}
                    onClick={() => plateMatch && setVehicleId(plateMatch.id)}
                    className="px-4 py-3 border border-white/10 text-xs font-jost uppercase tracking-[0.1em] hover:border-gold transition disabled:opacity-30"
                  >
                    Utiliser
                  </button>
                </div>
                {plateSearch && !plateMatch && (
                  <p className="text-xs text-red-400 mt-1.5">Aucun véhicule ne correspond à cette plaque.</p>
                )}
                {plateMatch && (
                  <p className="text-xs text-goldlight mt-1.5">
                    Trouvé : {plateMatch.name} ({plateMatch.categoryLabel})
                  </p>
                )}
              </div>

              <div>
                <label className="font-jost text-[0.6rem] tracking-[0.15em] uppercase text-gray2">Catégorie</label>
                <input
                  readOnly
                  value={selected?.categoryLabel || ""}
                  placeholder="—"
                  className="w-full bg-bg/60 border border-white/10 px-4 py-3 text-sm mt-2 text-gray1"
                />
              </div>

              <div>
                <label className="font-jost text-[0.6rem] tracking-[0.15em] uppercase text-gray2">Durée</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-bg border border-white/10 px-4 py-3 text-sm mt-2"
                >
                  {DURATIONS.map((d) => (
                    <option key={d.key} value={d.key}>
                      {d.label}
                    </option>
                  ))}
                </select>
                {selected && price == null && (
                  <p className="text-xs text-red-400 mt-1.5">
                    Aucun tarif défini pour cette durée sur ce véhicule.
                  </p>
                )}
              </div>

              <div className="border-t border-white/10 pt-5">
                <p className="font-jost text-xs tracking-[0.15em] uppercase text-goldlight mb-4">Client</p>

                <div className="relative mb-4">
                  <label className="font-jost text-[0.6rem] tracking-[0.15em] uppercase text-gray2">
                    Prénom / Nom
                  </label>
                  <input
                    value={clientName}
                    onChange={(e) => onClientNameChange(e.target.value)}
                    placeholder="ex : Emilio Ricci"
                    autoComplete="off"
                    className="w-full bg-bg border border-white/10 px-4 py-3 text-sm mt-2 focus:border-gold transition"
                  />
                  {suggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 border border-gold/30 bg-[#0a2a4a] max-h-48 overflow-y-auto">
                      {suggestions.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => pickSuggestion(s)}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-gold/10 transition flex justify-between"
                        >
                          <span>{s.name}</span>
                          <span className="text-gray2">{s.phone}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="font-jost text-[0.6rem] tracking-[0.15em] uppercase text-gray2">
                    Numéro de téléphone
                  </label>
                  <input
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="ex : 555-0123"
                    className="w-full bg-bg border border-white/10 px-4 py-3 text-sm mt-2 focus:border-gold transition"
                  />
                </div>

                <div>
                  <label className="font-jost text-[0.6rem] tracking-[0.15em] uppercase text-gray2">
                    Permis de conduire (capture d'écran)
                  </label>
                  <div
                    onPaste={handlePaste}
                    tabIndex={0}
                    className="mt-2 border border-dashed border-white/15 hover:border-gold/50 transition px-4 py-6 text-center cursor-text focus:outline-none focus:border-gold"
                  >
                    {licenseImage ? (
                      <div className="flex flex-col items-center gap-3">
                        <img src={licenseImage} alt="Permis de conduire" className="max-h-40 border border-white/10" />
                        <button
                          type="button"
                          onClick={() => setLicenseImage("")}
                          className="text-xs text-gray2 hover:text-red-400 transition"
                        >
                          Retirer l'image
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-gray2">
                        Clique ici puis fais <span className="text-gray1">Ctrl+V</span> pour coller une capture
                        d'écran du permis.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <span className="font-jost text-xs uppercase tracking-[0.15em] text-gray1">Montant</span>
                <span className="font-jost text-xl text-goldlight">
                  {price != null ? `${price.toLocaleString("fr-FR")}$` : "—"}
                </span>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={!selected || price == null || submitting}
                className="flex-1 bg-gold text-bg py-3 font-jost text-xs tracking-[0.15em] uppercase hover:bg-goldlight transition disabled:opacity-40"
              >
                {submitting ? "Création..." : "Créer la facture"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
                className="px-6 py-3 border border-white/10 font-jost text-xs uppercase tracking-[0.15em] hover:border-gold transition"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
