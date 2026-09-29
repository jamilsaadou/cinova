"use client";

import { useEffect, useRef, useState } from "react";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Décalage d'apparition en ms (effet cascade) */
  delay?: number;
  variant?: "up" | "fade" | "scale";
  as?: "div" | "li" | "article" | "section" | "span";
  once?: boolean;
  id?: string;
};

// Révèle son contenu quand il entre dans le viewport.
export function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "up",
  as = "div",
  once = true,
  id,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) obs.unobserve(el);
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [once]);

  const base =
    variant === "fade" ? "reveal reveal-fade" : variant === "scale" ? "reveal reveal-scale" : "reveal";

  const Tag = as as React.ElementType;
  return (
    <Tag
      ref={ref}
      id={id}
      className={`${base} ${visible ? "is-visible" : ""} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
