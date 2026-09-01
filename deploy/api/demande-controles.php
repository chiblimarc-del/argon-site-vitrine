<?php
/**
 * Argon — les décisions du formulaire de demande, isolées de leurs effets.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * POURQUOI CE FICHIER EXISTE
 *
 * `demande.php` mêlait la décision (« faut-il envoyer ? ») à ses effets
 * (rediriger, écrire un journal, appeler Mailjet). Rien n'y était vérifiable
 * sans exécuter un serveur web et sans expédier un vrai message : le contrôle
 * d'origine, en particulier, a laissé passer pendant deux semaines un défaut
 * qui rendait TOUT test du formulaire sur le staging mensonger — la demande
 * repartait en « succès » sans qu'aucun mail ne parte.
 *
 * Tout ce qui décide vit donc ici, en fonctions pures : mêmes entrées, même
 * sortie, aucun effet de bord, aucun réseau, aucune horloge. Ce sont elles que
 * `deploy/api/tests/` met à l'épreuve, y compris le cas qui compte le plus :
 * une origine réellement interdite ne doit JAMAIS produire un envoi.
 *
 * ⚠️ CE FICHIER NE DOIT PAS ÊTRE JOIGNABLE DEPUIS LE WEB. Le `.htaccess` du
 * dossier n'autorise que `demande.php` ; tout le reste est refusé. Il est
 * néanmoins écrit pour ne rien exécuter à l'inclusion : il ne déclare que des
 * constantes et des fonctions.
 *
 * ⚠️ IL DOIT PARTIR AVEC LE PAQUET. `scripts/prepare-deploy.ts` le nomme dans
 * FICHIERS_PUBLIES. Sans lui sur le serveur, `demande.php` meurt sur un
 * `require` introuvable et le formulaire ne répond plus du tout.
 * ─────────────────────────────────────────────────────────────────────────
 */

declare(strict_types=1);

/* ==========================================================================
   ORIGINES AUTORISÉES
   ========================================================================== */

/**
 * Origine retenue quand la configuration n'en déclare aucune.
 *
 * ⚠️ Ce repli n'est pas un défaut de conception, c'est un ordre de
 * déploiement : le paquet du site part par `scp`, la configuration vit sur le
 * serveur et se met à jour à la main. Entre les deux gestes, la production
 * doit continuer de fonctionner. Un serveur dont la configuration ne déclare
 * rien se comporte donc comme avant — et le dit dans son journal.
 */
const ORIGINE_PRODUCTION = 'https://www.argon-mobility.com';

/**
 * Liste des origines acceptées, lue dans la configuration du serveur.
 *
 * C'est le correctif du défaut d'origine : `argon-config.php` est le SEUL
 * fichier qui diffère déjà d'un serveur à l'autre — la production et le
 * staging n'ont ni les mêmes clés Mailjet, ni le même domaine. C'est donc lui,
 * et lui seul, qui sait où il tourne. Coder le domaine dans le PHP livré
 * revenait à demander au paquet de savoir sur quelle machine il serait déposé.
 *
 * Accepte une chaîne unique ou un tableau. Chaque valeur est normalisée en
 * schéma + hôte (+ port), sans slash final : c'est la forme exacte que les
 * navigateurs mettent dans l'en-tête `Origin`.
 *
 * @return array{0: string[], 1: bool} la liste, et vrai si c'est le repli
 */
function originesAutorisees(array $config): array
{
    $brutes = $config['origines'] ?? null;

    if ($brutes === null || $brutes === '' || $brutes === []) {
        return [[ORIGINE_PRODUCTION], true];
    }

    $liste = [];
    foreach ((array) $brutes as $valeur) {
        $normalisee = normaliserOrigine((string) $valeur);
        if ($normalisee !== '') {
            $liste[] = $normalisee;
        }
    }

    // Une liste déclarée mais entièrement illisible est plus dangereuse qu'une
    // liste absente : elle donne l'illusion d'avoir été réglée. On retombe sur
    // le repli, qui, lui, se signale dans le journal.
    if ($liste === []) {
        return [[ORIGINE_PRODUCTION], true];
    }

    return [array_values(array_unique($liste)), false];
}

/**
 * Ramène une URL à « schéma://hôte[:port] », en minuscules, sans slash final.
 * Une valeur qui n'a ni schéma ni hôte n'est pas une origine : elle est
 * rejetée plutôt que réparée, pour qu'une faute de saisie dans la
 * configuration se voie au lieu d'élargir silencieusement l'autorisation.
 */
function normaliserOrigine(string $valeur): string
{
    $valeur = trim($valeur);
    if ($valeur === '') {
        return '';
    }

    $parties = parse_url($valeur);
    if (!is_array($parties)) {
        return '';
    }

    $schema = strtolower((string) ($parties['scheme'] ?? ''));
    $hote   = strtolower((string) ($parties['host'] ?? ''));

    if ($schema === '' || $hote === '') {
        return '';
    }

    $port = isset($parties['port']) ? ':' . (int) $parties['port'] : '';

    return $schema . '://' . $hote . $port;
}

/**
 * L'origine de la requête est-elle acceptée ?
 *
 * TROIS CAS, ET UN SEUL EST UN REFUS.
 *
 * 1. `Origin` présent → il fait foi. Le navigateur le joint à toute
 *    soumission POST, y compris de même origine, et il n'est pas modifiable
 *    par la page qui poste.
 * 2. `Origin` absent, `Referer` présent → on se rabat dessus. Moins fiable,
 *    mais c'est ce qui reste.
 * 3. Les deux absents → ON LAISSE PASSER, et ce n'est pas un oubli : certains
 *    navigateurs et beaucoup d'extensions de confidentialité les suppriment.
 *    Refuser sur une absence perdrait des demandes légitimes sans que
 *    personne ne l'apprenne jamais. Les autres barrières restent actives.
 *
 * @return array{acceptee: bool, motif: string, valeur: string}
 *         motif : 'origine' | 'referent' | 'absente'
 */
function origineAcceptee(string $origine, string $referent, array $autorisees): array
{
    $origine  = trim($origine);
    $referent = trim($referent);

    if ($origine !== '') {
        $normalisee = normaliserOrigine($origine);
        return [
            'acceptee' => $normalisee !== '' && in_array($normalisee, $autorisees, true),
            'motif'    => 'origine',
            'valeur'   => $origine,
        ];
    }

    if ($referent !== '') {
        $normalisee = normaliserOrigine($referent);
        return [
            'acceptee' => $normalisee !== '' && in_array($normalisee, $autorisees, true),
            'motif'    => 'referent',
            'valeur'   => $referent,
        ];
    }

    return ['acceptee' => true, 'motif' => 'absente', 'valeur' => ''];
}

/* ==========================================================================
   VALIDATION DES CHAMPS
   Volontairement permissive : chaque règle trop stricte est une demande
   perdue. Les adresses gratuites ne sont PAS refusées — beaucoup de
   dirigeants de PME utilisent une adresse personnelle.
   ========================================================================== */

/**
 * `mb_strlen` n'est pas garanti présent : l'extension mbstring n'est pas
 * activée dans toutes les images PHP. `strlen` compte des octets et non des
 * caractères, ce qui est ici sans conséquence — les bornes sont larges, et un
 * nom accentué compte simplement quelques octets de plus.
 */
function longueurTexte(string $valeur): int
{
    return function_exists('mb_strlen') ? mb_strlen($valeur) : strlen($valeur);
}

/** Messageries jetables : ni rappel possible, ni suivi de l'échange. */
const DOMAINES_JETABLES = [
    'yopmail.com', 'yopmail.fr', 'jetable.org', 'mailinator.com',
    'guerrillamail.com', 'guerrillamail.info', 'sharklasers.com',
    'temp-mail.org', 'tempmail.com', 'throwawaymail.com', '10minutemail.com',
    '10minutemail.net', 'trashmail.com', 'trashmail.fr', 'getnada.com',
    'maildrop.cc', 'dispostable.com', 'fakeinbox.com', 'mohmal.com',
    'emailondeck.com', 'moakt.com', 'tempr.email', 'discard.email',
    'spamgourmet.com', 'mailnesia.com', 'burnermail.io',
];

/** Domaine d'une adresse, en minuscules. Chaîne vide si l'adresse est informe. */
function domaineAdresse(string $email): string
{
    $arobase = strrchr($email, '@');
    return $arobase === false ? '' : strtolower(substr($arobase, 1));
}

/**
 * Valide les cinq champs et rend la liste des refus, chacun NOMMANT le champ
 * fautif. Une validation globale qui répond « invalide » sans dire quoi est
 * indiagnosticable en exploitation : c'est la panne où l'on sait que des
 * demandes se perdent sans pouvoir dire pourquoi.
 *
 * @param array{nom: string, entreprise: string, email: string, telephone: string, secteur: string} $champs
 * @return string[] vide si tout est valide
 */
function validerChamps(array $champs): array
{
    $nom        = (string) ($champs['nom'] ?? '');
    $entreprise = (string) ($champs['entreprise'] ?? '');
    $email      = (string) ($champs['email'] ?? '');
    $telephone  = (string) ($champs['telephone'] ?? '');
    $secteur    = (string) ($champs['secteur'] ?? '');

    $refus = [];

    if (longueurTexte($nom) < 2 || longueurTexte($nom) > 80) {
        $refus[] = 'nom (' . longueurTexte($nom) . ' caractères)';
    }
    if (longueurTexte($entreprise) < 2 || longueurTexte($entreprise) > 120) {
        $refus[] = 'entreprise (' . longueurTexte($entreprise) . ' caractères)';
    }
    if (longueurTexte($email) > 160 || preg_match('/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i', $email) !== 1) {
        $refus[] = 'email';
    }
    if (preg_match('/^[+0-9][0-9\s.()\-]{7,19}$/', $telephone) !== 1) {
        // ⚠️ La valeur saisie n'est PAS recopiée dans le journal : un numéro de
        // téléphone est une donnée personnelle, et un journal se conserve.
        $refus[] = 'telephone (format)';
    }
    if ($secteur === '' || longueurTexte($secteur) > 60) {
        $refus[] = 'secteur';
    }

    $domaine = domaineAdresse($email);
    if ($domaine !== '' && in_array($domaine, DOMAINES_JETABLES, true)) {
        $refus[] = 'email (messagerie jetable : ' . $domaine . ')';
    }

    return $refus;
}

/* ==========================================================================
   SIGNAUX DE ROBOT
   ========================================================================== */

/**
 * Le formulaire n'a aucun champ libre : « nom » et « entreprise » n'ont donc
 * aucune raison de contenir une URL. Quand ils en contiennent une, ce n'est
 * pas une maladresse de saisie, c'est une charge utile de spam.
 */
const MOTIF_LIEN = '~(https?://|www\.|\[url|</?a\s)~i';

function contientLien(string $valeur): bool
{
    return preg_match(MOTIF_LIEN, $valeur) === 1;
}

/** Un humain met plus de trois secondes à remplir cinq champs. */
const DELAI_MINIMUM_MS = 3000;

/**
 * Juge la DURÉE de remplissage mesurée par le navigateur.
 *
 * ⚠️ Ne JAMAIS revenir à un horodatage comparé à l'heure du serveur. Les deux
 * horloges ne sont pas synchronisées : en recette, un écart de six secondes a
 * produit une durée négative, donc « inférieure au seuil », et un visiteur
 * légitime a été traité comme un robot. Le serveur ne lit qu'une DURÉE, sans
 * jamais consulter sa propre horloge.
 *
 * Une valeur aberrante n'est pas jugeable : on laisse passer plutôt que de
 * risquer de perdre une vraie demande.
 *
 * @return string 'ok' | 'absent' | 'aberrant' | 'trop-rapide'
 */
function verdictDelai(float $delai): string
{
    if ($delai < 0 || $delai > 86400000) {
        return 'aberrant';
    }
    if ($delai <= 0) {
        return 'absent';
    }
    return $delai < DELAI_MINIMUM_MS ? 'trop-rapide' : 'ok';
}

/* ==========================================================================
   PROVENANCE — CE QUI PERMETTRA DE SAVOIR QUELLE PAGE TRAVAILLE
   ========================================================================== */

/**
 * Chemin interne de la page d'où vient le visiteur.
 *
 * Le navigateur le déduit de `document.referrer` lorsqu'il est du même
 * domaine : c'est la page qui portait le bouton sur lequel il a cliqué. Il est
 * donc RENSEIGNÉ PAR LE CLIENT, et le serveur ne lui accorde aucune confiance
 * — il n'ouvre aucun droit, il n'entre dans aucune décision, il ne sert qu'à
 * remplir une ligne de l'e-mail reçu.
 *
 * Le motif reste néanmoins strict : ce qui n'est pas un chemin interne
 * plausible est jeté, plutôt que recopié dans un message que quelqu'un lira.
 */
function normaliserCheminOrigine(string $valeur): string
{
    $valeur = trim($valeur);
    if ($valeur === '' || strlen($valeur) > 120) {
        return '';
    }
    return preg_match('~^/[A-Za-z0-9\-/_]*$~', $valeur) === 1 ? $valeur : '';
}

/**
 * Hôte d'où vient le visiteur quand il arrive d'un autre site (moteur de
 * recherche, réseau social, annuaire). Vide s'il vient d'une page du site ou
 * d'un accès direct.
 */
function normaliserSource(string $valeur): string
{
    $valeur = strtolower(trim($valeur));
    if ($valeur === '' || strlen($valeur) > 100) {
        return '';
    }
    return preg_match('~^[a-z0-9.\-]+\.[a-z]{2,}$~', $valeur) === 1 ? $valeur : '';
}

/**
 * Texte libre venu du client (titre de page, paramètres de campagne).
 *
 * ⚠️ Les retours à la ligne sont retirés AVANT toute mise en forme : c'est ce
 * qui empêche une valeur postée de fabriquer de fausses lignes dans le corps
 * du message que lira un humain. Le corps part en texte brut par l'API
 * Mailjet, il n'y a donc pas d'en-tête à injecter — mais un message dont on
 * peut forger la mise en page reste un message qui ment.
 */
function nettoyerTexteLibre(string $valeur, int $maximum): string
{
    $valeur = str_replace(["\r", "\n", "\t"], ' ', trim($valeur));
    $valeur = preg_replace('/\s+/u', ' ', $valeur) ?? '';
    $valeur = trim($valeur);

    if ($valeur === '') {
        return '';
    }

    return longueurTexte($valeur) > $maximum
        ? rtrim(substr($valeur, 0, $maximum)) . '…'
        : $valeur;
}

/**
 * Assemble le bloc de provenance de l'e-mail reçu.
 *
 * C'est la réponse à « quelle page a généré ce prospect ? ». Sans lui, une
 * demande arrive sans qu'on sache jamais ce qui l'a produite, et toute
 * décision éditoriale se prend à l'intuition.
 *
 * ⚠️ CE QU'IL PEUT DIRE, ET CE QU'IL NE PEUT PAS. Le site ne pose ni cookie,
 * ni stockage local — la politique de confidentialité s'y engage, et ce choix
 * n'est pas rediscuté ici. On ne dispose donc que du dernier saut, jamais du
 * parcours complet : un visiteur venu de Google puis passé par une page métier
 * avant de cliquer donnera la page métier, et « accès direct » en source. Le
 * parcours entier, lui, se lit dans les journaux du serveur.
 *
 * @param array{url: string, titre: string, source: string, campagne: string, simulateur?: string, resultat?: string} $provenance
 * @return string[] lignes déjà formatées
 */
function lignesProvenance(array $provenance): array
{
    $url        = (string) ($provenance['url'] ?? '');
    $titre      = (string) ($provenance['titre'] ?? '');
    $source     = (string) ($provenance['source'] ?? '');
    $campagne   = (string) ($provenance['campagne'] ?? '');
    $simulateur = (string) ($provenance['simulateur'] ?? '');
    $resultat   = (string) ($provenance['resultat'] ?? '');

    $lignes = [];

    // Le titre seul ne suffit pas : deux pages peuvent se ressembler, une URL
    // est sans ambiguïté. On donne les deux, ou l'un des deux, jamais rien.
    if ($titre !== '') {
        $lignes[] = 'Page d\'origine : ' . $titre;
    }
    if ($url !== '') {
        $lignes[] = 'URL            : ' . $url;
    }
    if ($titre === '' && $url === '') {
        $lignes[] = 'Page d\'origine : inconnue (accès direct au formulaire)';
    }

    $lignes[] = 'Source         : ' . ($source !== '' ? $source : 'accès direct ou non transmise');

    if ($campagne !== '') {
        $lignes[] = 'Campagne       : ' . $campagne;
    }

    /**
     * La simulation, quand le visiteur a choisi de l'emporter depuis /tarifs.
     *
     * C'est la ligne la plus qualifiante de tout l'e-mail : elle dit que la
     * personne a saisi ses propres chiffres et vu le résultat avant de
     * demander une démonstration. Elle n'apparaît jamais d'elle-même — le
     * formulaire l'affiche au visiteur, qui peut la retirer.
     *
     * ⚠️ Le résumé est un texte venu du navigateur : il est nettoyé, jamais
     * interprété. Ne rien en déduire automatiquement, et surtout pas un
     * montant à réutiliser dans une proposition commerciale.
     */
    if ($simulateur !== '' || $resultat !== '') {
        $lignes[] = 'Simulateur     : '
            . ($simulateur !== '' ? $simulateur : 'non précisé')
            . ($resultat !== '' ? ' — ' . $resultat : '');
    }

    return $lignes;
}

/* ==========================================================================
   SYNCHRONISATION CRM — ce qui part vers l'API Argon
   ========================================================================== */

/**
 * Clé d'idempotence : une par SOUMISSION, jamais par personne.
 *
 * ⚠️ Ce n'est pas une déduplication par adresse e-mail, et c'est délibéré : deux demandes
 * légitimes du même dirigeant, à deux semaines d'intervalle, doivent donner deux fiches. Ce
 * que cette clé empêche, c'est le doublon de REJEU — le cas où l'API a créé la fiche mais où
 * sa réponse s'est perdue, et où l'on rejoue depuis le journal.
 *
 * `random_bytes` et non `uniqid` ni `rand` : deux demandes arrivées dans la même seconde ne
 * doivent pas se voler leur identité.
 */
function cleIdempotence(): string
{
    return bin2hex(random_bytes(16));
}

/**
 * La charge envoyée à `POST /demandes-site`, en tableau prêt à encoder.
 *
 * Fonction pure : c'est elle qu'on éprouve, plutôt que l'appel réseau. Les noms de champs
 * doivent rester ceux de `packages/schemas/src/demande-site.schema.ts` — une divergence se
 * traduirait par un 400 que personne ne lit, puisque le site ignore la réponse.
 *
 * @param array{nom:string,entreprise:string,email:string,telephone:string,secteur:string,activite:string} $contact
 * @param array{url:string,titre:string,source:string,campagne:string,simulateur:string,resultat:string} $provenance
 */
function chargeCrm(string $cle, array $contact, array $provenance, string $horodatageIso): array
{
    return [
        'cleIdempotence' => $cle,
        'envoyeeLe'      => $horodatageIso,
        'contact'        => [
            'nom'        => $contact['nom'],
            'entreprise' => $contact['entreprise'],
            'email'      => $contact['email'],
            'telephone'  => $contact['telephone'],
            'secteur'    => $contact['secteur'],
            'activite'   => $contact['activite'],
        ],
        'provenance'     => [
            'url'        => $provenance['url'],
            'titre'      => $provenance['titre'],
            'source'     => $provenance['source'],
            'campagne'   => $provenance['campagne'],
            'simulateur' => $provenance['simulateur'],
            'resultat'   => $provenance['resultat'],
        ],
    ];
}

/**
 * Identifiant de simulateur : un mot court, en minuscules, connu du site.
 * Tout le reste est jeté — la ligne de l'e-mail ne doit pas devenir un champ
 * de texte libre supplémentaire.
 */
function normaliserSimulateur(string $valeur): string
{
    $valeur = strtolower(trim($valeur));
    return preg_match('~^[a-z\-]{1,20}$~', $valeur) === 1 ? $valeur : '';
}
