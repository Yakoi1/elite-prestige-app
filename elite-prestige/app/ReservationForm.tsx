"use client";

type VehicleOption = { id: string; name: string };

export default function ReservationForm({ vehicles }: { vehicles: VehicleOption[] }) {
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        alert("Merci ! Ta demande a bien été notée. Le système d'envoi réel sera connecté prochainement.");
      }}
    >
      <div className="flex flex-col gap-2">
        <label className="font-jost text-[0.6rem] tracking-[0.18em] uppercase text-gray1">Nom / Pseudo RP</label>
        <input required className="bg-card border border-white/10 px-4 py-3 text-sm" />
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-jost text-[0.6rem] tracking-[0.18em] uppercase text-gray1">Véhicule</label>
        <select required className="bg-card border border-white/10 px-4 py-3 text-sm">
          <option value="">Sélectionner</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-jost text-[0.6rem] tracking-[0.18em] uppercase text-gray1">Date souhaitée</label>
        <input type="date" required className="bg-card border border-white/10 px-4 py-3 text-sm" />
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-jost text-[0.6rem] tracking-[0.18em] uppercase text-gray1">Votre demande</label>
        <textarea
          required
          placeholder="Durée, horaire, lieu, événement..."
          className="bg-card border border-white/10 px-4 py-3 text-sm min-h-[110px]"
        />
      </div>
      <button className="bg-gold text-bg py-3 px-8 font-jost text-[0.65rem] tracking-[0.2em] uppercase hover:bg-goldlight transition w-fit">
        Envoyer la demande
      </button>
    </form>
  );
}
