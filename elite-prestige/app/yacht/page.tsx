import { prisma } from "@/lib/prisma";
import Link from "next/link";
import YachtConfigurator from "../YachtConfigurator";
import YachtGallery from "./YachtGallery";
import PresentationImage from "../PresentationImage";

export const dynamic = "force-dynamic";

export default async function YachtPage() {
  const [settings, gallery, packages, categoriesRaw] = await Promise.all([
    prisma.yachtSettings.findUnique({ where: { id: "yacht" } }),
    prisma.yachtGalleryImage.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.yachtPackage.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.yachtOptionCategory.findMany({
      include: { choices: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" }
    })
  ]);

  const heroImage = settings?.presentationImageUrl || packages[0]?.imageUrl;
  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-bg/80 backdrop-blur-md">
        <nav className="max-w-[1200px] mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
          <Link href="/" className="font-jost text-base tracking-[0.3em] uppercase text-cream">
            Elite&nbsp;Prestige
          </Link>
          <div className="hidden md:flex items-center gap-8 font-jost text-sm tracking-[0.14em] uppercase text-gray1">
            <Link href="/#flotte" className="hover:text-goldlight transition">La Flotte</Link>
            <Link href="/yacht" className="text-goldlight">Mega Yacht</Link>
            <Link href="/login" className="hover:text-goldlight transition">Espace collaborateur</Link>
          </div>
        </nav>
      </header>

      <section className="relative w-full h-[70svh] min-h-[420px] flex items-end overflow-hidden">
        <PresentationImage
          images={[settings?.presentationImageUrl || packages[0]?.imageUrl, settings?.presentationImageUrl2]}
          alt="Mega Yacht ELITE PRESTIGE"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-black/30" />
        <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-10 pb-16 w-full">
          <p className="font-jost text-[0.65rem] tracking-[0.32em] uppercase text-gold mb-3">Maritime</p>
          <h1 className="font-jost text-3xl md:text-5xl tracking-[0.06em] uppercase">Mega Yacht sur mesure</h1>
          <p className="font-serif-brand italic text-xl text-[#d7d0c4] mt-4 max-w-xl">
            Couleur, nom, drapeau — un Mega Yacht configuré selon vos envies.
          </p>
        </div>
      </section>

      <main className="max-w-[1200px] mx-auto px-6 md:px-10 py-20">
        <section className="text-center mb-24">
          <p className="font-jost text-[0.65rem] tracking-[0.3em] uppercase text-gold mb-4">Configurateur</p>
          <h2 className="font-jost text-2xl tracking-[0.1em] uppercase mb-6">Composez votre Mega Yacht</h2>
          <p className="text-gray1 max-w-xl mx-auto mb-8 text-sm leading-relaxed">
            Choisissez votre forfait, votre couleur, votre drapeau, et faites graver le nom de votre choix.
            Le total se calcule en direct.
          </p>
          <div className="flex justify-center">
            <YachtConfigurator
              packages={packages}
              categories={categoriesRaw}
              gallery={gallery}
              trigger="button"
              presentationImageUrl={settings?.presentationImageUrl}
              textBackgroundImageUrl={settings?.textBackgroundImageUrl}
              textBackgroundAspect={settings?.textBackgroundAspect}
              packageStepOrder={settings?.packageStepOrder}
            />
          </div>
        </section>

        {gallery.length > 0 && (
          <section>
            <p className="font-jost text-[0.65rem] tracking-[0.3em] uppercase text-gold mb-4">Galerie</p>
            <YachtGallery images={gallery} />
          </section>
        )}
      </main>

      <footer className="border-t border-white/10 text-center py-14 px-6">
        <p className="font-jost text-[0.7rem] tracking-[0.25em] uppercase text-cream mb-3">Elite Prestige</p>
        <p className="font-jost text-[0.6rem] tracking-[0.15em] uppercase text-gray2">Aérien · Terrestre · Maritime</p>
      </footer>
    </>
  );
}
