"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function SuccessToast({ message, param = "added" }: { message: string; param?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(searchParams.get(param) === "1");

  useEffect(() => {
    if (searchParams.get(param) !== "1") return;
    setVisible(true);
    const timeout = setTimeout(() => {
      setVisible(false);
      const params = new URLSearchParams(searchParams.toString());
      params.delete(param);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    }, 3500);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  if (!visible) return null;

  return (
    <div className="fixed top-6 right-6 z-[100] border border-gold/40 bg-[#0a2a4a] px-6 py-4 shadow-lg flex items-center gap-3">
      <span className="w-2 h-2 rounded-full bg-gold shrink-0" />
      <p className="font-jost text-sm text-cream">{message}</p>
    </div>
  );
}
