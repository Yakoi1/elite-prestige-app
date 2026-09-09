"use client";

import { useRef } from "react";

type GalleryImage = { id: string; imageUrl: string; caption: string | null };

export default function YachtGallery({ images }: { images: GalleryImage[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (images.length === 0) return null;

  function scrollByCard(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-card]");
    const cardWidth = card ? card.offsetWidth + 12 : 400;
    track.scrollBy({ left: direction * cardWidth, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 no-scrollbar"
      >
        {images.map((img) => (
          <div
            key={img.id}
            data-card
            className="relative shrink-0 w-[94%] sm:w-[90%] lg:w-[92%] aspect-video overflow-hidden bg-card border border-white/10 snap-start"
          >
            <img src={img.imageUrl} alt={img.caption ?? "Yacht ELITE PRESTIGE"} className="w-full h-full object-cover" />
            {img.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-4">
                <p className="font-jost text-[0.62rem] tracking-[0.12em] uppercase text-cream">{img.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={() => scrollByCard(-1)}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 md:w-12 md:h-12 flex items-center justify-center border border-white/15 bg-black/50 backdrop-blur-sm text-gray1 hover:text-goldlight hover:border-gold transition text-xl"
          >
            ‹
          </button>
          <button
            onClick={() => scrollByCard(1)}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 md:w-12 md:h-12 flex items-center justify-center border border-white/15 bg-black/50 backdrop-blur-sm text-gray1 hover:text-goldlight hover:border-gold transition text-xl"
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}
