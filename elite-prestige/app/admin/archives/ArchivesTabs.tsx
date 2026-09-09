"use client";

import { useState } from "react";

export default function ArchivesTabs({
  accounting,
  clients
}: {
  accounting: React.ReactNode;
  clients: React.ReactNode;
}) {
  const [tab, setTab] = useState<"accounting" | "clients">("accounting");

  return (
    <div>
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setTab("accounting")}
          className={`px-5 py-2.5 border text-xs font-jost tracking-[0.12em] uppercase transition ${
            tab === "accounting" ? "bg-gold border-gold text-bg" : "border-white/10 text-gray1 hover:border-gold"
          }`}
        >
          Comptabilité
        </button>
        <button
          onClick={() => setTab("clients")}
          className={`px-5 py-2.5 border text-xs font-jost tracking-[0.12em] uppercase transition ${
            tab === "clients" ? "bg-gold border-gold text-bg" : "border-white/10 text-gray1 hover:border-gold"
          }`}
        >
          Clients
        </button>
      </div>
      {tab === "accounting" ? accounting : clients}
    </div>
  );
}
