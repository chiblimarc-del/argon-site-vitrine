/**
 * ENCOURS CLIENT — profondeur de /solutions/devis-facturation
 * ===========================================================
 *
 * NOUVEAU AU LOT 8.
 *
 * ─── POURQUOI CE BLOC EXISTE ──────────────────────────────────
 *
 * L'argument est signalé comme manquant depuis la CLÔTURE DU LOT 1, le 18/08 :
 *
 *   « Encours client affiche le reste dû, la part en retard et l'ancienneté
 *     par tranches. C'est ce qu'un dirigeant regarde avant d'appeler sa
 *     banque, et le site n'en dit rien. »
 *
 * L'audit du 20/08 le reprend dans « ce qui manque » : le sujet qui décide d'un
 * achat en trésorerie n'est nulle part sur les dix-sept pages.
 *
 * C'est un des rares arguments du site qui parle au dirigeant en tant que
 * dirigeant — pas en tant qu'exploitant. À ce titre il vaut une place dans le
 * corps de la page argent, pas une ligne de FAQ.
 *
 * ─── OÙ IL SE POSE, ET POURQUOI PAS AILLEURS ──────────────────
 *
 * Sur `/solutions/devis-facturation`, APRÈS le bloc de relance. L'ordre est
 * l'argument : on voit d'abord ce qui est dû et depuis quand, on décide
 * ensuite qui on relance. L'inverse ferait de l'encours un rapport, alors que
 * c'est un point de départ.
 *
 * ⚠️ PAS DE CINQUIÈME STATION SUR L'ACCUEIL. `ProfondeurGrid` en garde quatre.
 * L'encours se lie depuis la station « relance », pas à côté d'elle.
 *
 * ─── LA RÈGLE DE TROIS ────────────────────────────────────────
 *
 * `TroisPreuves` est typé en longueur trois. Une quatrième ligne NE COMPILE
 * PAS. Ce bloc a trois preuves, et il en aura toujours trois.
 *
 * ─── LA LIMITE, ÉCRITE ────────────────────────────────────────
 *
 * Argon montre ce qui est dû et depuis quand. Il ne juge pas la solvabilité
 * d'un client, ne note personne, et ne dialogue avec aucune banque ni assureur
 * crédit. Ne jamais laisser entendre le contraire : ce serait sortir du produit
 * et entrer dans un métier réglementé.
 */

import { Section } from "@/components/ui/Section";
import { BlocProfondeur, type TroisPreuves } from "@/components/sections/depth/BlocProfondeur";
import { EncoursPanel } from "@/components/mockups/EncoursPanel";

const PREUVES: TroisPreuves = [
  {
    titre: "Un total de créances ne dit rien. Sa répartition dit quoi faire.",
    texte:
      "Le reste dû se lit par tranches d'ancienneté — moins de trente jours, de trente à soixante, au-delà. Le même montant global n'a pas la même signification selon la tranche où il se trouve : dans la première, c'est du délai normal ; dans la dernière, c'est un problème qui ne se réglera pas tout seul.",
  },
  {
    titre: "La part en retard se voit sans être calculée.",
    texte:
      "Elle n'est pas le résultat d'un export retravaillé le soir : elle découle des échéances portées par les factures elles-mêmes. Ce qui est en retard l'est parce que sa date est passée, pas parce que quelqu'un l'a classé comme tel.",
  },
  {
    titre: "Derrière chaque tranche, il y a des noms.",
    texte:
      "Une tranche qu'on ne peut pas ouvrir est un indicateur. Une tranche qui donne les clients concernés, leur montant et leur retard est une liste d'appels à passer cet après-midi.",
  },
];

export function EncoursSection() {
  return (
    <>
      <BlocProfondeur
        /* 1. éveil — le territoire, jamais la fonction */
        eyebrow="L'encours client"
        /* 2. promesse — un résultat pour le dirigeant */
        titre="Vous savez ce qu'on vous doit, et depuis quand."
        /* 3. bénéfice, avec ce que ça évite : découvrir l'ampleur de ce qui
              est dû au moment où la trésorerie manque, c'est-à-dire au moment
              où il est trop tard pour relancer utilement. */
        chapo="Avant d'en avoir besoin, pas le jour où la trésorerie manque — quand il est déjà trop tard pour relancer utilement."
        preuves={PREUVES}
        frontiere="Argon montre ce qui est dû et depuis quand. Il n'évalue pas la solvabilité de vos clients, ne leur attribue aucune note et ne communique avec aucune banque ni aucun assureur crédit."
      />

      {/*
        La maquette vit HORS du bloc, et c'est une contrainte du gabarit, pas
        un choix de mise en page : BlocProfondeur a six emplacements et aucun
        n'accueille d'illustration. Le contourner en ajoutant une septième
        prop affaiblirait la règle de trois — c'est elle qui empêche ces blocs
        de redevenir des listes de fonctions.

        ⚠️ Légende obligatoire. Une interface recréée en code illustre un
        mécanisme, elle ne le prouve pas.
      */}
      <Section containerWidth="wide" className="border-b border-line-soft">
        <div className="mx-auto max-w-3xl">
          <EncoursPanel />
          <p className="mt-4 text-center text-xs text-ink-soft">
            Interface Argon reproduite en code — données d&apos;illustration.
          </p>
        </div>
      </Section>
    </>
  );
}
