"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { enregistrerChemin } from "@/lib/provenance";

/**
 * Mémorise la page d'où vient le visiteur, pour que la demande de démonstration
 * puisse dire quelle page l'a produite.
 *
 * ⚠️ N'ÉCRIT RIEN DANS LE NAVIGATEUR — voir `src/lib/provenance.ts`. Le chemin
 * vit dans une variable de module, le temps que l'onglet garde la page. Aucun
 * cookie, aucun stockage : la politique de confidentialité reste exacte.
 *
 * ⚠️ Ce composant ne rend RIEN et ne doit jamais rendre quoi que ce soit. Il
 * est monté dans le layout racine, donc sur les vingt-cinq pages : le moindre
 * élément produit ici apparaîtrait partout, y compris sur les pages légales.
 *
 * C'est le deuxième composant client du site, après le menu mobile. Il pèse
 * quelques centaines d'octets et n'ajoute aucune requête.
 */
export function SuiviProvenance() {
  const chemin = usePathname();

  useEffect(() => {
    enregistrerChemin(chemin);
  }, [chemin]);

  return null;
}
