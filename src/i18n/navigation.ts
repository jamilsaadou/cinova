import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Wrappers de navigation conscients de la locale (Link, useRouter, redirect...).
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
