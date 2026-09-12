"use client";

import { useEffect, useState } from "react";

export default function WeeklyServiceLive({
  baseHours,
  activeStartedAt
}: {
  baseHours: number;
  activeStartedAt: string | null;
}) {
  const [liveHours, setLiveHours] = useState(baseHours);

  useEffect(() => {
    if (!activeStartedAt) {
      setLiveHours(baseHours);
      return;
    }
    const start = new Date(activeStartedAt).getTime();
    const tick = () => setLiveHours(baseHours + (Date.now() - start) / 1000 / 60 / 60);
    tick();
    const id = setInterval(tick, 5000);
    return () => clearInterval(id);
  }, [baseHours, activeStartedAt]);

  return <>{liveHours.toFixed(1)} h</>;
}
