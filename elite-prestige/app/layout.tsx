import type { Metadata } from "next";
import "./globals.css";
import { prisma } from "@/lib/prisma";
import { hexToRgbTriplet } from "@/lib/color";

export const metadata: Metadata = {
  title: "ELITE PRESTIGE — Location Premium",
  description: "ELITE PRESTIGE — Location premium aérienne, terrestre et maritime."
};

const DEFAULT_THEME = {
  bg: "#02121F",
  card: "#0a2a4a",
  gold: "#c9a24c",
  goldlight: "#e7d19a",
  cream: "#f3eee5",
  gray1: "#949399",
  gray2: "#5f5f65",
  effect: "none"
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  let theme = DEFAULT_THEME;
  try {
    const stored = await prisma.siteTheme.findUnique({ where: { id: "site" } });
    if (stored) theme = { ...DEFAULT_THEME, ...stored };
  } catch {
    // Table pas encore migrée ou base indisponible : on garde les couleurs par défaut.
  }

  const cssVars = `:root{
    --color-bg: ${hexToRgbTriplet(theme.bg, hexToRgbTriplet(DEFAULT_THEME.bg))};
    --color-card: ${hexToRgbTriplet(theme.card, hexToRgbTriplet(DEFAULT_THEME.card))};
    --color-gold: ${hexToRgbTriplet(theme.gold, hexToRgbTriplet(DEFAULT_THEME.gold))};
    --color-goldlight: ${hexToRgbTriplet(theme.goldlight, hexToRgbTriplet(DEFAULT_THEME.goldlight))};
    --color-cream: ${hexToRgbTriplet(theme.cream, hexToRgbTriplet(DEFAULT_THEME.cream))};
    --color-gray1: ${hexToRgbTriplet(theme.gray1, hexToRgbTriplet(DEFAULT_THEME.gray1))};
    --color-gray2: ${hexToRgbTriplet(theme.gray2, hexToRgbTriplet(DEFAULT_THEME.gray2))};
  }`;

  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=Jost:wght@200;300;400;500&family=Montserrat:ital,wght@0,300;0,400;1,300&family=Work+Sans:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{ __html: cssVars }} />
      </head>
      <body className={`bg-bg text-cream font-light effect-${theme.effect}`}>
        {theme.effect === "particles" && (
          <div className="particles-field" aria-hidden="true">
            {Array.from({ length: 14 }).map((_, i) => (
              <span
                key={i}
                className="particle"
                style={{
                  left: `${(i * 37) % 100}%`,
                  animationDelay: `${(i % 7) * 1.8}s`,
                  animationDuration: `${14 + (i % 5) * 3}s`
                }}
              />
            ))}
          </div>
        )}
        {children}
      </body>
    </html>
  );
}
