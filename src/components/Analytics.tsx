"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Envoie une balise de visite à chaque changement de page (non bloquant).
export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    const controller = new AbortController();
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
      signal: controller.signal,
      keepalive: true,
    }).catch(() => {});
    return () => controller.abort();
  }, [pathname]);

  return null;
}
