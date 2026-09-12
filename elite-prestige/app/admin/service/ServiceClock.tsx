"use client";

import { useEffect, useState } from "react";
import { startShift, endShift } from "./actions";

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function ServiceClock({ activeStartedAt }: { activeStartedAt: string | null }) {
  const [elapsed, setElapsed] = useState(0);
  const [pending, setPending] = useState(false);
  const isActive = !!activeStartedAt;

  useEffect(() => {
    if (!activeStartedAt) return;
    const start = new Date(activeStartedAt).getTime();
    const tick = () => setElapsed(Date.now() - start);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [activeStartedAt]);

  async function handleStart() {
    setPending(true);
    try {
      await startShift();
    } finally {
      setPending(false);
    }
  }

  async function handleEnd() {
    setPending(true);
    try {
      await endShift();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="border border-white/10 bg-card p-8 text-center">
      <p className="font-jost text-xs tracking-[0.2em] uppercase text-gray2 mb-3">
        {isActive ? "En service depuis" : "Statut"}
      </p>
      <p className={`font-jost text-4xl mb-6 ${isActive ? "text-goldlight" : "text-gray1"}`}>
        {isActive ? formatDuration(elapsed) : "Hors service"}
      </p>
      {isActive ? (
        <button
          onClick={handleEnd}
          disabled={pending}
          className="border border-red-400/40 text-red-400 px-8 py-3.5 font-jost text-xs tracking-[0.15em] uppercase hover:bg-red-400/10 transition disabled:opacity-50"
        >
          {pending ? "..." : "Prendre ma fin de service"}
        </button>
      ) : (
        <button
          onClick={handleStart}
          disabled={pending}
          className="bg-gold text-bg px-8 py-3.5 font-jost text-xs tracking-[0.15em] uppercase hover:bg-goldlight transition disabled:opacity-50"
        >
          {pending ? "..." : "Prendre mon service"}
        </button>
      )}
    </div>
  );
}
