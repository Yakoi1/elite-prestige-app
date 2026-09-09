"use client";

import { useState } from "react";
import { closeAccounting } from "./actions";

export default function CloseAccountingButton() {
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    setSubmitting(true);
    try {
      await closeAccounting();
      setConfirming(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="border border-red-400/40 text-red-400 px-5 py-3 font-jost text-xs tracking-[0.15em] uppercase hover:bg-red-400/10 transition"
      >
        Clôturer la comptabilité
      </button>
    );
  }

  return (
    <div className="border border-red-400/40 bg-red-400/5 p-5 max-w-lg">
      <p className="text-sm text-cream mb-2">
        Cette action archive toutes les factures et dépenses actuelles, les efface de leurs pages respectives, et
        met à jour le solde bancaire avec le résultat net (impôts déduits).
      </p>
      <p className="text-sm text-red-400 mb-4">Cette action est irréversible. Continuer ?</p>
      <div className="flex gap-3">
        <button
          onClick={handleConfirm}
          disabled={submitting}
          className="bg-red-400 text-bg px-5 py-2.5 font-jost text-xs tracking-[0.15em] uppercase hover:bg-red-300 transition disabled:opacity-50"
        >
          {submitting ? "Clôture en cours..." : "Oui, clôturer"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={submitting}
          className="border border-white/10 px-5 py-2.5 font-jost text-xs tracking-[0.15em] uppercase hover:border-gold transition"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
