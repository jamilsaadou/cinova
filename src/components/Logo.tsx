import Image from "next/image";
import { Link } from "@/i18n/navigation";

type LogoProps = {
  variant?: "color" | "white";
  className?: string;
  priority?: boolean;
};

// Logo officiel CINOVA (verrouillage complet). La variante blanche
// conserve les couleurs du logo sur fond blanc pour les surfaces foncées.
export function Logo({ variant = "color", className, priority }: LogoProps) {
  return (
    <Link href="/" aria-label="CINOVA — accueil" className="inline-flex">
      <Image
        src="/brand/cinova-logo.png"
        alt="CINOVA"
        width={698}
        height={254}
        priority={priority}
        className={`${variant === "white" ? "logo-white" : ""} ${className ?? ""}`}
      />
    </Link>
  );
}
