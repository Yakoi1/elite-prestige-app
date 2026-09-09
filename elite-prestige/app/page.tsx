import { prisma } from "@/lib/prisma";
import Link from "next/link";
import FleetClient from "./FleetClient";
import ReservationForm from "./ReservationForm";
import PresentationImage from "./PresentationImage";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const vehiclesRaw = await prisma.vehicle.findMany({ orderBy: { addedAt: "desc" } });
  const vehicles = vehiclesRaw.map((v) => ({ ...v, addedAt: v.addedAt.toISOString() }));

  const [settings, yachtPackages] = await Promise.all([
    prisma.yachtSettings.findUnique({ where: { id: "yacht" } }),
    prisma.yachtPackage.findMany({ orderBy: { sortOrder: "asc" } })
  ]);
  const yachtBannerImages = [
    settings?.presentationImageUrl || yachtPackages[0]?.imageUrl,
    settings?.presentationImageUrl2
  ];
  const yachtStartingPrice = yachtPackages.length > 0 ? Math.min(...yachtPackages.map((p) => p.price)) : null;

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-bg/80 backdrop-blur-md">
        <nav className="max-w-[1200px] mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
          <a href="#" className="font-jost text-base tracking-[0.3em] uppercase text-cream">
            Elite&nbsp;Prestige
          </a>
          <div className="hidden md:flex items-center gap-8 font-jost text-sm tracking-[0.14em] uppercase text-gray1">
            <Link href="/yacht" className="hover:text-goldlight transition">Mega Yacht</Link>
            <a href="#maison" className="hover:text-goldlight transition">La Maison</a>
            <a href="#flotte" className="hover:text-goldlight transition">La Flotte</a>
            <a href="/login" className="hover:text-goldlight transition">Espace collaborateur</a>
          </div>
        </nav>
      </header>

      <section className="min-h-[62svh] flex items-center justify-center text-center px-6 pt-36 pb-10 relative overflow-hidden">
        <div className="absolute w-[650px] h-[650px] border border-gold/10 rounded-full" />
        <div className="relative z-10 flex flex-col items-center">
          <p className="font-jost text-sm tracking-[0.4em] uppercase text-gray1">Aérien · Terrestre · Maritime</p>
          <div className="w-16 h-px bg-gold my-7" />
          <p className="max-w-xl font-serif-brand italic text-2xl text-[#d7d0c4]">
            « Le prestige ne se loue pas, il se vit. »
          </p>
          <div className="flex gap-4 mt-10 flex-wrap justify-center">
            <a href="#flotte" className="bg-gold text-bg py-4 px-8 font-jost text-xs tracking-[0.2em] uppercase hover:bg-goldlight transition">
              Découvrir la flotte
            </a>
          </div>
        </div>
      </section>

      <main className="max-w-[1200px] mx-auto px-6 md:px-10">
        <section className="py-12">
          <Link
            href="/yacht"
            className="w-full relative h-[220px] md:h-[280px] border border-gold/30 bg-card overflow-hidden group block"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#123b61] via-[#082238] to-[#020f1c]">
              <PresentationImage
                images={yachtBannerImages}
                alt="Mega Yacht ELITE PRESTIGE"
                className="opacity-90 [&_img]:transition-transform [&_img]:duration-700 group-hover:[&_img]:scale-105"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/30 to-transparent" />
            <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-center max-w-md">
              <p className="font-jost text-[0.65rem] tracking-[0.28em] uppercase text-gold mb-3">Configurateur</p>
              <h3 className="font-jost text-2xl md:text-3xl tracking-[0.06em] uppercase mb-3">Mega Yacht sur mesure</h3>
              <p className="text-gray1 text-sm mb-5">
                Couleur, nom, drapeau... personnalisez votre Mega Yacht selon vos goûts.
              </p>
              {yachtStartingPrice !== null && (
                <span className="inline-flex items-center gap-2 font-jost text-[0.62rem] tracking-[0.18em] uppercase text-goldlight w-fit">
                  À partir de {yachtStartingPrice.toLocaleString("fr-FR")}$
                  <span className="w-6 h-px bg-gold" />
                  Découvrir
                </span>
              )}
            </div>
          </Link>
        </section>

        <section id="maison" className="py-24">
          <div className="text-center mb-10">
            <p className="font-jost text-[0.68rem] tracking-[0.34em] uppercase text-gold mb-4">La Maison</p>
            <h2 className="font-jost text-2xl tracking-[0.12em] uppercase">Une exigence, trois éléments</h2>
          </div>
          <p className="max-w-3xl mx-auto text-center font-serif-brand text-2xl leading-relaxed text-[#d8d1c5]">
            ELITE PRESTIGE imagine chaque déplacement comme une expérience à part entière. Une sélection de
            véhicules terrestres, d'appareils aériens et d'embarcations pensée pour celles et ceux qui recherchent{" "}
            <em className="text-goldlight not-italic">l'élégance, la discrétion et l'exclusivité.</em>
          </p>
        </section>

        <section id="flotte" className="py-12">
          <div className="text-center mb-14">
            <p className="font-jost text-[0.68rem] tracking-[0.34em] uppercase text-gold mb-4">La Flotte</p>
            <h2 className="font-jost text-2xl tracking-[0.12em] uppercase">L'excellence en mouvement</h2>
          </div>
          <FleetClient vehicles={vehicles} />
        </section>

        <section id="reservation" className="py-24">
          <div className="text-center mb-14">
            <p className="font-jost text-[0.68rem] tracking-[0.34em] uppercase text-gold mb-4">Réservation</p>
            <h2 className="font-jost text-2xl tracking-[0.12em] uppercase">Organiser votre expérience</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h3 className="font-jost text-base tracking-[0.08em] uppercase mb-4">Un service sur mesure</h3>
              <p className="text-gray1 text-sm leading-relaxed">
                Chaque demande est étudiée individuellement. La disponibilité, la durée et les conditions sont
                confirmées avant validation.
              </p>
              <div className="mt-8">
                <div className="flex justify-between py-4 border-b border-white/10 font-jost text-[0.6rem] tracking-[0.15em]">
                  <span className="text-gray1 uppercase">Discord</span>
                  <span className="text-goldlight">À compléter</span>
                </div>
                <div className="flex justify-between py-4 border-b border-white/10 font-jost text-[0.6rem] tracking-[0.15em]">
                  <span className="text-gray1 uppercase">Disponibilité</span>
                  <span className="text-goldlight">Sur réservation</span>
                </div>
              </div>
            </div>
            <ReservationForm vehicles={vehicles.map((v) => ({ id: v.id, name: v.name }))} />
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 text-center py-14 px-6">
        <p className="font-jost text-[0.7rem] tracking-[0.25em] uppercase text-cream mb-3">Elite Prestige</p>
        <p className="font-jost text-[0.6rem] tracking-[0.15em] uppercase text-gray2">Aérien · Terrestre · Maritime</p>
        <p className="font-jost text-[0.58rem] tracking-[0.12em] uppercase text-gray2/60 mt-2">
          ELITE PRESTIGE · Univers Roleplay
        </p>
      </footer>
    </>
  );
}
