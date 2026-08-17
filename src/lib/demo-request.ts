import { secteurRoutes } from "@/lib/routes";

/**
 * Traitement d'une demande de démonstration : validation, anti-spam et envoi.
 *
 * Isolé de l'action serveur pour rester lisible et testable. Aucun secret n'est
 * exposé ici : les identifiants Mailjet sont lus depuis l'environnement et ne
 * traversent jamais la frontière client.
 */

/* ==========================================================================
   FORME DES DONNÉES
   ========================================================================== */

export type EtatFormulaire = {
  statut: "inactif" | "succes" | "erreur";
  /** Message global, affiché en tête de formulaire. */
  message?: string;
  /** Erreurs par champ, affichées sous chaque libellé. */
  erreurs?: Partial<Record<ChampDemo, string>>;
  /** Valeurs saisies, réinjectées pour ne pas faire retaper l'utilisateur. */
  valeurs?: Partial<Record<ChampDemo, string>>;
};

export type ChampDemo = "nom" | "entreprise" | "email" | "telephone" | "secteur";

export const etatInitial: EtatFormulaire = { statut: "inactif" };

/** Options du sélecteur, dérivées du registre — jamais écrites en dur. */
export const optionsSecteur = [
  ...secteurRoutes.map((route) => ({ valeur: route.path, libelle: route.label })),
  { valeur: "autre", libelle: "Autre activité" },
];

/* ==========================================================================
   VALIDATION
   Volontairement permissive : chaque règle trop stricte est une demande perdue.
   ========================================================================== */

/** Format d'e-mail. Délibérément large — on vérifie une forme, pas une norme. */
const FORMAT_EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

/** Téléphone : chiffres, espaces, points, tirets, parenthèses et indicatif. */
const FORMAT_TELEPHONE = /^[+0-9][0-9\s.\-()]{7,19}$/;

function texte(donnees: FormData, champ: string): string {
  const valeur = donnees.get(champ);
  return typeof valeur === "string" ? valeur.trim() : "";
}

export function validerDemande(donnees: FormData): {
  valeurs: Record<ChampDemo, string>;
  erreurs: Partial<Record<ChampDemo, string>>;
} {
  const valeurs: Record<ChampDemo, string> = {
    nom: texte(donnees, "nom"),
    entreprise: texte(donnees, "entreprise"),
    email: texte(donnees, "email"),
    telephone: texte(donnees, "telephone"),
    secteur: texte(donnees, "secteur"),
  };

  const erreurs: Partial<Record<ChampDemo, string>> = {};

  if (valeurs.nom.length < 2 || valeurs.nom.length > 80) {
    erreurs.nom = "Indiquez votre nom.";
  }
  if (valeurs.entreprise.length < 2 || valeurs.entreprise.length > 120) {
    erreurs.entreprise = "Indiquez le nom de votre entreprise.";
  }
  if (!FORMAT_EMAIL.test(valeurs.email) || valeurs.email.length > 160) {
    // On n'interdit PAS les adresses gratuites : beaucoup de dirigeants de PME
    // utilisent une adresse personnelle. Refuser serait perdre des demandes.
    erreurs.email = "Cette adresse e-mail semble incorrecte.";
  }
  if (!FORMAT_TELEPHONE.test(valeurs.telephone.replace(/\s+/g, " "))) {
    erreurs.telephone = "Indiquez un numéro où vous joindre.";
  }
  if (!optionsSecteur.some((option) => option.valeur === valeurs.secteur)) {
    erreurs.secteur = "Choisissez votre activité.";
  }

  return { valeurs, erreurs };
}

/* ==========================================================================
   ANTI-SPAM
   Deux barrières sans cookie, sans service tiers, sans capteur biométrique :
   rien à déclarer au titre du RGPD, aucun impact sur les Core Web Vitals.
   ========================================================================== */

/** Nom du champ piège. Plausible pour un robot, invisible pour un humain. */
export const CHAMP_PIEGE = "site_web_entreprise";

/** Nom du champ d'horodatage, renseigné côté client au montage. */
export const CHAMP_INSTANT = "ouverture";

/** Un humain met plus de trois secondes à remplir cinq champs. */
const DELAI_MINIMUM_MS = 3000;

export function estProbablementUnRobot(donnees: FormData): boolean {
  // 1. Champ piège : seul un robot qui remplit tout le formulaire le renseigne.
  if (texte(donnees, CHAMP_PIEGE) !== "") return true;

  // 2. Délai de saisie. Absent si le visiteur navigue sans JavaScript : dans ce
  //    cas on ne bloque pas, le champ piège suffit.
  const instant = Number(texte(donnees, CHAMP_INSTANT));
  if (Number.isFinite(instant) && instant > 0) {
    const ecoule = Date.now() - instant;
    if (ecoule < DELAI_MINIMUM_MS) return true;
  }

  return false;
}

/* ==========================================================================
   ENVOI — MAILJET (API Send v3.1)
   Appel direct en fetch, sans SDK : le site reste à zéro dépendance.
   Mailjet est un fournisseur français, les données ne quittent pas l'UE.
   ========================================================================== */

const MAILJET_ENDPOINT = "https://api.mailjet.com/v3.1/send";

type ConfigMailjet = {
  cleApi: string;
  cleSecrete: string;
  expediteur: string;
  destinataire: string;
};

function lireConfiguration(): ConfigMailjet | null {
  const cleApi = process.env.MAILJET_API_KEY;
  const cleSecrete = process.env.MAILJET_SECRET_KEY;
  const expediteur = process.env.MAILJET_FROM_EMAIL;
  const destinataire = process.env.MAILJET_TO_EMAIL;

  if (!cleApi || !cleSecrete || !expediteur || !destinataire) return null;
  return { cleApi, cleSecrete, expediteur, destinataire };
}

function libelleSecteur(valeur: string): string {
  return optionsSecteur.find((o) => o.valeur === valeur)?.libelle ?? valeur;
}

export async function envoyerDemande(
  valeurs: Record<ChampDemo, string>,
): Promise<{ envoye: boolean; raison?: string }> {
  const config = lireConfiguration();

  if (!config) {
    // On ne révèle jamais au visiteur qu'il s'agit d'un défaut de configuration.
    console.error(
      "[demande-demo] Variables Mailjet manquantes : MAILJET_API_KEY, MAILJET_SECRET_KEY, MAILJET_FROM_EMAIL, MAILJET_TO_EMAIL.",
    );
    return { envoye: false, raison: "configuration" };
  }

  const secteur = libelleSecteur(valeurs.secteur);

  const corpsTexte = [
    "Nouvelle demande de démonstration — argon-mobility.com",
    "",
    `Nom          : ${valeurs.nom}`,
    `Entreprise   : ${valeurs.entreprise}`,
    `E-mail       : ${valeurs.email}`,
    `Téléphone    : ${valeurs.telephone}`,
    `Activité     : ${secteur}`,
  ].join("\n");

  try {
    const reponse = await fetch(MAILJET_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
          `${config.cleApi}:${config.cleSecrete}`,
        ).toString("base64")}`,
      },
      body: JSON.stringify({
        Messages: [
          {
            From: { Email: config.expediteur, Name: "Site Argon" },
            To: [{ Email: config.destinataire }],
            // Répondre depuis la boîte de réception écrit directement au prospect.
            ReplyTo: { Email: valeurs.email, Name: valeurs.nom },
            Subject: `Démo Argon — ${valeurs.entreprise} (${secteur})`,
            TextPart: corpsTexte,
          },
        ],
      }),
      // Ne jamais laisser une requête sortante bloquer l'action indéfiniment.
      signal: AbortSignal.timeout(10_000),
    });

    if (!reponse.ok) {
      console.error(
        `[demande-demo] Mailjet a répondu ${reponse.status} ${reponse.statusText}`,
      );
      return { envoye: false, raison: "fournisseur" };
    }

    return { envoye: true };
  } catch (erreur) {
    console.error("[demande-demo] Envoi impossible :", erreur);
    return { envoye: false, raison: "reseau" };
  }
}
