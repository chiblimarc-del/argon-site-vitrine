"use client";

/**
 * Les deux simulateurs partagent un état : le forfait et le nombre
 * d'utilisateurs terrain choisis en haut alimentent la ligne « coût Argon »
 * du simulateur de valeur.
 *
 * Sans ce lien, le visiteur saisirait deux fois la même chose et pourrait
 * comparer une valeur à un coût qui n'est pas le sien — ce serait le défaut
 * classique de ce genre de page.
 *
 * Ce composant ne rend aucune interface propre : il porte l'état, et les deux
 * sections gardent leur place dans le plan de page (le socle et le comparatif
 * s'intercalent entre elles, passés en `children`).
 */

import { useState } from "react";
import { SimulateurPrix } from "./SimulateurPrix";
import { SimulateurValeur } from "./SimulateurValeur";
import { PLAN_PAR_DEFAUT, type IdPlan } from "@/lib/tarifs";

export function SimulateursLies({
  entreDeux,
}: {
  /** Ce qui s'affiche entre le simulateur de prix et le simulateur de valeur. */
  entreDeux: React.ReactNode;
}) {
  const [plan, setPlan] = useState<IdPlan>(PLAN_PAR_DEFAUT);
  const [terrains, setTerrains] = useState(12);

  return (
    <>
      <SimulateurPrix
        onChoixPlan={(id, n) => {
          setPlan(id);
          setTerrains(n);
        }}
      />

      {entreDeux}

      <SimulateurValeur planRetenu={plan} terrainsRetenus={terrains} />
    </>
  );
}
