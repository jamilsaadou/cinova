import Image from "next/image";
import { useTranslations } from "next-intl";

const actors = [
  { src: "armoiries-niger.jpg", alt: "République du Niger" },
  { src: "reca.jpg", alt: "RECA Niger" },
  { src: "oxfam.jpg", alt: "Oxfam" },
  { src: "cooperation-allemande.jpg", alt: "Coopération allemande" },
  { src: "giz.jpg", alt: "GIZ" },
  { src: "apaesc-ao.jpg", alt: "APAESC-AO" },
  { src: "prsa.png", alt: "PRSA — Programme de Résilience du Système Alimentaire en Afrique de l’Ouest" },
] as const;

export function ActorLogos() {
  const t = useTranslations("actors");

  return (
    <section aria-labelledby="actors-title" className="border-t border-sand bg-white">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:py-12">
        <h2 id="actors-title" className="font-display text-center text-2xl font-bold text-forest sm:text-3xl">
          {t("title")}
        </h2>
        <ul className="mx-auto mt-6 grid max-w-6xl grid-cols-2 items-center justify-items-center gap-x-4 gap-y-3 md:grid-cols-4 md:gap-6 lg:grid-cols-7">
          {actors.map((actor) => (
            <li key={actor.src} className="relative aspect-[1080/766] w-full min-w-0 max-w-36 last:col-span-2 md:max-w-40 md:last:col-span-1">
              <Image
                src={`/images/actors/${actor.src}`}
                alt={actor.alt}
                fill
                sizes="(max-width: 767px) 144px, 160px"
                className="object-contain"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
