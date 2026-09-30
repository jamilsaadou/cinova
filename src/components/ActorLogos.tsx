import Image from "next/image";
import { useTranslations } from "next-intl";

const actors = [
  { src: "armoiries-niger.jpg", alt: "République du Niger" },
  { src: "reca.jpg", alt: "RECA Niger" },
  { src: "oxfam.jpg", alt: "Oxfam" },
  { src: "cooperation-allemande.jpg", alt: "Coopération allemande" },
  { src: "giz.jpg", alt: "GIZ" },
  { src: "apaesc-ao.jpg", alt: "APAESC-AO" },
] as const;

export function ActorLogos() {
  const t = useTranslations("actors");

  return (
    <section aria-labelledby="actors-title" className="border-t border-sand bg-white">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:py-12">
        <h2 id="actors-title" className="font-display text-center text-2xl font-bold text-forest sm:text-3xl">
          {t("title")}
        </h2>
        <ul className="mx-auto mt-6 grid max-w-5xl grid-cols-2 items-center justify-items-center gap-x-4 gap-y-3 md:grid-cols-6 md:gap-6">
          {actors.map((actor) => (
            <li key={actor.src} className="w-full min-w-0 max-w-36 md:max-w-40">
              <Image
                src={`/images/actors/${actor.src}`}
                alt={actor.alt}
                width={1080}
                height={766}
                sizes="(max-width: 767px) 144px, 160px"
                className="h-auto w-full object-contain"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
