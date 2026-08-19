import { NavLink } from "@/components/navigation/NavLink";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  LegalHero,
  LegalCorps,
  LegalBloc,
  LegalIdentite,
} from "@/components/sections/legal/LegalLayout";
import { metadataFor, webPageSchema } from "@/lib/seo";

/**
 * MENTIONS LÉGALES.
 *
 * ⚠️ Aucune information de cette page n'est déduite, estimée ou complétée.
 * Chaque valeur vient de l'extrait Kbis de la société ou des mentions légales
 * publiées par l'hébergeur. Une mention légale inexacte est pire qu'une
 * mention légale absente : elle engage l'éditeur sur une information fausse.
 *
 * Obligation : article 6-III de la loi pour la confiance dans l'économie
 * numérique. Elle court dès que le site est accessible au public, pas
 * seulement à partir de son ouverture aux moteurs de recherche.
 *
 * À METTRE À JOUR si l'un de ces éléments change : forme juridique, capital,
 * siège, président, hébergeur. Penser aussi à `MISE_A_JOUR` ci-dessous.
 */

const PATH = "/mentions-legales";

export const metadata = metadataFor(PATH);

const MISE_A_JOUR = "Dernière mise à jour : 18 août 2026.";

const editeur = [
  { terme: "Dénomination sociale", valeur: "Vertus Consulting" },
  {
    terme: "Forme juridique",
    valeur: "Société par actions simplifiée à associé unique (SASU)",
  },
  { terme: "Capital social", valeur: "482 500 €" },
  { terme: "Siège social", valeur: "76 rue Arago, 33300 Bordeaux, France" },
  { terme: "Immatriculation", valeur: "RCS Bordeaux 913 663 571" },
  { terme: "TVA intracommunautaire", valeur: "FR33 913 663 571" },
  { terme: "Directeur de la publication", valeur: "Marc Chibli, président" },
  { terme: "Courriel", valeur: "contact@argon-mobility.com" },
  { terme: "Téléphone", valeur: "01 85 73 59 41" },
];

const hebergeur = [
  { terme: "Dénomination sociale", valeur: "OVH SAS" },
  {
    terme: "Forme juridique",
    valeur: "Société par actions simplifiée au capital de 10 174 560 €",
  },
  { terme: "Siège social", valeur: "2 rue Kellermann, 59100 Roubaix, France" },
  { terme: "Immatriculation", valeur: "RCS Lille Métropole 424 761 419" },
  { terme: "Site", valeur: "ovhcloud.com" },
];

const marque = [
  "« Argon » est le nom commercial du logiciel édité et exploité par Vertus Consulting. Le site www.argon-mobility.com présente ce logiciel ; il n'est pas exploité par une entité distincte.",
  "L'ensemble des éléments du site — textes, structure, interfaces reproduites, identité visuelle, logo — est protégé par le droit de la propriété intellectuelle et reste la propriété de Vertus Consulting.",
  "Toute reproduction, représentation ou adaptation, totale ou partielle, par quelque procédé que ce soit, est interdite sans autorisation écrite préalable. La citation d'un extrait avec mention de la source et lien vers la page d'origine reste libre.",
];

const donnees = [
  "Le site ne collecte aucune donnée personnelle en dehors du formulaire de demande de démonstration. Il ne dépose aucun cookie et n'utilise aucun service de mesure d'audience.",
  "Les traitements mis en œuvre, leurs finalités, leurs durées de conservation et les moyens d'exercer vos droits sont décrits dans la politique de confidentialité.",
];

const litiges = [
  "Le présent site est soumis au droit français.",
  "Pour toute question relative au site ou à son contenu, écrivez à contact@argon-mobility.com. Nous répondons à l'adresse depuis laquelle vous nous écrivez.",
];

export default function MentionsLegalesPage() {
  return (
    <>
      <LegalHero
        path={PATH}
        chapo="Informations relatives à l'éditeur du site, à son hébergeur et aux conditions d'utilisation de son contenu."
        miseAJour={MISE_A_JOUR}
      />

      <LegalCorps>
        <LegalBloc numero="01" titre="Éditeur du site">
          <LegalIdentite entrees={editeur} />
        </LegalBloc>

        <LegalBloc numero="02" titre="Hébergement">
          <p>
            Le site est hébergé sur une infrastructure située en France, opérée
            par :
          </p>
          <LegalIdentite entrees={hebergeur} />
        </LegalBloc>

        <LegalBloc numero="03" titre="Marque et propriété intellectuelle">
          {marque.map((texte) => (
            <p key={texte}>{texte}</p>
          ))}
        </LegalBloc>

        <LegalBloc numero="04" titre="Données personnelles">
          {donnees.map((texte) => (
            <p key={texte}>{texte}</p>
          ))}
          <p>
            <NavLink
              href="/politique-de-confidentialite"
              className="text-accent-text underline underline-offset-4 transition-colors hover:text-ink"
            >
              Consulter la politique de confidentialité
            </NavLink>
          </p>
        </LegalBloc>

        <LegalBloc numero="05" titre="Droit applicable et contact">
          {litiges.map((texte) => (
            <p key={texte}>{texte}</p>
          ))}
        </LegalBloc>
      </LegalCorps>

      <JsonLd data={webPageSchema(PATH)} />
    </>
  );
}
