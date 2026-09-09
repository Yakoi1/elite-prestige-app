"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden bg-gold text-bg px-6 py-3 font-jost text-xs tracking-[0.15em] uppercase hover:bg-goldlight transition"
    >
      Télécharger en PDF (imprimer)
    </button>
  );
}
