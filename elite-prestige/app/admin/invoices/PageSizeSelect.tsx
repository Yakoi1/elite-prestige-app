"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function PageSizeSelect({ current }: { current: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pageSize", value);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      value={current}
      onChange={(e) => onChange(e.target.value)}
      className="bg-bg border border-white/10 px-3 py-2 text-sm"
    >
      {[15, 30, 50, 100].map((n) => (
        <option key={n} value={n}>
          {n} / page
        </option>
      ))}
    </select>
  );
}
