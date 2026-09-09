"use client";

import { useEffect, useState } from "react";

export default function PresentationImage({
  images,
  alt,
  className = "",
  intervalMs = 5000
}: {
  images: (string | null | undefined)[];
  alt: string;
  className?: string;
  intervalMs?: number;
}) {
  const validImages = images.filter((src): src is string => !!src);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (validImages.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % validImages.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [validImages.length, intervalMs]);

  if (validImages.length === 0) return null;

  return (
    <div className={`absolute inset-0 ${className}`}>
      {validImages.map((src, i) => (
        <img
          key={src + i}
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === index ? 1 : 0 }}
        />
      ))}
    </div>
  );
}
