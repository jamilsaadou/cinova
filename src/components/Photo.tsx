"use client";

import { useEffect, useRef, useState } from "react";

type PhotoProps = {
  src: string;
  alt: string;
  className?: string;
  /** position de l'image (object-position) */
  position?: string;
  priority?: boolean;
  /** Superposition d'un voile pour la lisibilité du texte par-dessus */
  overlay?: "none" | "soft" | "strong" | "green";
  children?: React.ReactNode;
};

// Affiche une photo avec un dégradé de repli (visible tant que le fichier
// n'existe pas encore, ou pendant le chargement). Zéro casse si l'image manque.
export function Photo({
  src,
  alt,
  className = "",
  position = "center",
  priority = false,
  overlay = "none",
  children,
}: PhotoProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Si l'image est déjà en cache au montage, onLoad ne se déclenche pas :
  // on lit alors l'état `complete` directement.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete) {
      if (img.naturalWidth > 0) setLoaded(true);
      else setFailed(true);
    }
  }, []);

  const overlayClass =
    overlay === "soft"
      ? "bg-black/20"
      : overlay === "strong"
        ? "bg-black/45"
        : overlay === "green"
          ? "bg-gradient-to-t from-forest/85 via-forest/35 to-transparent"
          : "";

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-forest via-green to-olive ${className}`}
    >
      {/* Motif discret sur le fond de repli */}
      {!loaded && (
        <div
          aria-hidden
          className="absolute inset-0 opacity-30 rings"
        />
      )}

      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          style={{ objectPosition: position }}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {overlayClass && <div aria-hidden className={`absolute inset-0 ${overlayClass}`} />}
      {children && <div className="relative h-full w-full">{children}</div>}
    </div>
  );
}
