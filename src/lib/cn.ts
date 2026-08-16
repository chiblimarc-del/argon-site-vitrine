/**
 * Concatène des classes CSS conditionnelles.
 * Volontairement minimal : évite d'ajouter clsx / tailwind-merge en dépendance
 * pour un site vitrine (cahier V2 §29 — JavaScript minimal).
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
