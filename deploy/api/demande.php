<?php
/**
 * Argon — réception du formulaire de demande de démonstration.
 *
 * Remplace l'action serveur Next.js : le site est déployé en export statique,
 * il n'y a aucun processus Node en production.
 *
 * ⚠️ CE FICHIER EST LE SEUL POINT DE DÉCISION. Un POST peut venir de
 * n'importe où : les contraintes HTML du formulaire sont un confort de saisie,
 * pas une sécurité. Tout est revalidé ici.
 *
 * ⚠️ Les identifiants ne sont PAS écrits ici. Ils sont lus depuis config.php,
 * que le .htaccess du dossier rend inaccessible depuis le web et qui n'est
 * jamais versionné.
 *
 * Doit rester synchronisé avec src/lib/demo-request.ts (noms des champs et
 * motifs de saisie). Toute divergence se traduit par des demandes refusées
 * après un aller-retour réseau, ce qui est invisible côté exploitation.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * L'ORDRE DES ÉTAPES, ET POURQUOI IL EST CELUI-LÀ
 *
 *   1. méthode POST
 *   2. configuration, et origines autorisées qu'elle déclare
 *   3. lecture des champs
 *   4. VALIDATION — calculée ici, verdict rendu à l'étape 7
 *   5. CONTRÔLE D'ORIGINE — un refus est une ERREUR, jamais un faux succès
 *   6. ANTI-ABUS : compteur, champ piège, durée de saisie, Turnstile, liens
 *   7. verdict de la validation
 *   8. ENVOI
 *   9. succès
 *
 * ⚠️ La validation est CALCULÉE en 4 et son verdict rendu en 7. Ce décalage
 * est délibéré : le compteur d'envois (étape 6) doit enregistrer TOUTES les
 * tentatives, y compris celles que la validation refusera — sinon un robot
 * qui martèle avec des données invalides n'est jamais compté, donc jamais
 * limité. Refuser dès l'étape 4 rouvrirait exactement ce trou.
 *
 * ⚠️ UN ÉCHEC NE REPART JAMAIS EN « SUCCÈS ». Règle du 31/08/2026, née d'un
 * défaut réel : l'origine attendue était codée en dur sur le domaine de
 * production, si bien que toute soumission depuis le staging repartait vers la
 * page de confirmation SANS QU'AUCUN MAIL NE PARTE. Celui qui testait voyait
 * « merci pour votre demande » et concluait que le formulaire marchait. Deux
 * dégâts : un formulaire intestable ailleurs qu'en production, et des
 * confirmations comptées comme des conversions qui n'en étaient pas.
 *
 * Seule exception maintenue : le SIGNAL DE ROBOT SANS AMBIGUÏTÉ — champ piège
 * rempli, lien dans un champ nominatif, saisie en moins de trois secondes. Là,
 * aucun humain n'attend de réponse, et répondre « refusé » apprendrait au
 * robot où est le piège.
 *
 * ⚠️ NE JAMAIS COMPTER LES CONVERSIONS SUR LES VISITES DE /demande-envoyee :
 * cette page est aussi servie aux robots piégés. Le décompte qui ne ment pas
 * est `resultat=envoye` dans le journal.
 * ─────────────────────────────────────────────────────────────────────────
 */

declare(strict_types=1);

/**
 * Les décisions vivent à côté, en fonctions pures, pour être vérifiables sans
 * serveur web et sans expédier de vrai message : `deploy/api/tests/` les met à
 * l'épreuve, y compris le cas qui compte le plus — une origine réellement
 * interdite ne doit produire aucun envoi.
 *
 * ⚠️ Ce fichier doit être présent sur le serveur. Il est nommé dans
 * FICHIERS_PUBLIES de scripts/prepare-deploy.ts ; sans lui, le formulaire meurt
 * ici même, sur un require introuvable.
 */
require_once __DIR__ . '/demande-controles.php';

/* --------------------------------------------------------------------------
   JOURNAL
   Une ligne de forme stable par demande, pour qu'elle soit comptable :

       [demande-demo] resultat=envoye  motif=-       entreprise=…
       [demande-demo] resultat=refuse  motif=origine valeur=…
       [demande-demo] resultat=silence motif=piege

   Trois résultats, et trois seulement :
     envoye   — Mailjet a accepté le message ;
     refuse   — le visiteur a reçu une erreur et peut recommencer ;
     silence  — robot sans ambiguïté : réponse « succès », aucun envoi.

   ⚠️ `envoye` ne se dit QUE lorsque Mailjet a accepté. Un HTTP 200 vaut
   « accepté », jamais « remis » : la boîte de réception reste la seule preuve.
   -------------------------------------------------------------------------- */

function journal(string $resultat, string $motif, string $detail = ''): void
{
    error_log(sprintf(
        '[demande-demo] resultat=%s motif=%s%s',
        $resultat,
        $motif === '' ? '-' : $motif,
        $detail === '' ? '' : ' ' . $detail,
    ));
}

/* --------------------------------------------------------------------------
   RÉPONSE
   Le formulaire poste sans JavaScript : on renvoie le visiteur sur une page
   du site, plutôt que du JSON qu'il ne verrait jamais.
   Le 303 garantit qu'un rechargement ne renvoie pas la demande une
   seconde fois.
   -------------------------------------------------------------------------- */

/**
 * @param string $etat  'succes' ou 'erreur'
 * @param string $motif repris dans l'URL pour que la page dise au visiteur
 *                      quoi faire. Jamais une cause technique : il n'a à
 *                      connaître ni le nom d'un fournisseur, ni l'état d'un
 *                      compteur.
 */
function redirige(string $etat, string $motif = ''): void
{
    if ($etat === 'succes') {
        header('Location: /demande-envoyee', true, 303);
        exit;
    }

    $cible = '/demander-une-demo?etat=erreur';
    if ($motif !== '') {
        $cible .= '&motif=' . rawurlencode($motif);
    }

    header('Location: ' . $cible, true, 303);
    exit;
}

/* --------------------------------------------------------------------------
   1. MÉTHODE
   -------------------------------------------------------------------------- */

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    redirige('erreur', 'methode');
}

/* --------------------------------------------------------------------------
   2. CONFIGURATION

   Emplacement des identifiants — deux possibilités, dans cet ordre.

   1. AU-DESSUS de la racine web (`www/../argon-config.php`). C'est le meilleur
      emplacement : un fichier hors du dossier servi par Apache ne peut pas
      être téléchargé, quoi qu'il arrive au .htaccess. Aucune règle à faire
      respecter, donc aucune règle qui puisse être perdue lors d'un transfert.
   2. `api/config.php`, protégé par le .htaccess du dossier. Fonctionne, mais
      la protection dépend d'un fichier que les clients FTP masquent et que
      l'hébergeur doit autoriser à surcharger la configuration.

   Si le contrôle « /api/config.php doit renvoyer 403 » échoue, la correction
   n'est pas de bricoler le .htaccess : c'est de déplacer le fichier en 1.
   -------------------------------------------------------------------------- */

$emplacements = [
    dirname(__DIR__, 2) . '/argon-config.php', // au-dessus de www/
    __DIR__ . '/config.php',                   // dans api/
];

$config = null;
$dossierConfig = '';
foreach ($emplacements as $emplacement) {
    if (is_readable($emplacement)) {
        $config = require $emplacement;
        // Le compteur d'envois vivra à côté : même dossier, mêmes garanties
        // d'accès. Si la configuration est hors de la racine web, le compteur
        // l'est aussi.
        $dossierConfig = dirname($emplacement);
        break;
    }
}

if (!is_array($config)) {
    journal('refuse', 'config-absente', 'emplacements=' . implode(',', $emplacements));
    redirige('erreur', 'technique');
}

/**
 * Configuration incomplète : on l'attrape ici plutôt que de laisser Mailjet
 * renvoyer un 401 obscur. Sans ce contrôle, une clé oubliée se traduit par un
 * formulaire qui « ne marche pas » sans que rien n'explique pourquoi dans le
 * journal — le mode de panne le plus coûteux, parce qu'il est silencieux.
 */
$manquants = array_keys(array_filter(
    ['apiKey' => '', 'secretKey' => '', 'from' => '', 'to' => ''],
    static fn(string $_cle, string $nom): bool => trim((string) ($config[$nom] ?? '')) === '',
    ARRAY_FILTER_USE_BOTH,
));

if ($manquants !== []) {
    journal('refuse', 'config-incomplete', 'cles=' . implode(',', $manquants));
    redirige('erreur', 'technique');
}

/**
 * Origines autorisées — déclarées par le SERVEUR, jamais par le paquet.
 *
 * C'est la correction du défaut du 31/08/2026. `argon-config.php` est le seul
 * fichier qui diffère déjà d'une machine à l'autre : production et staging
 * n'ont ni les mêmes clés Mailjet, ni le même domaine. C'est donc lui qui sait
 * où il tourne. Le paquet, lui, est identique partout — lui demander de
 * connaître son serveur était l'erreur d'origine.
 *
 * Absente ou illisible, la liste retombe sur le domaine de production et le
 * DIT : un serveur mis à jour avant sa configuration continue de fonctionner,
 * mais l'écart s'entend.
 */
[$originesAutorisees, $originesParDefaut] = originesAutorisees($config);

if ($originesParDefaut) {
    journal(
        'avertissement',
        'origines-non-declarees',
        'repli=' . ORIGINE_PRODUCTION . ' — ajouter la cle "origines" a argon-config.php',
    );
}

/* --------------------------------------------------------------------------
   3. LECTURE DES CHAMPS
   -------------------------------------------------------------------------- */

const CHAMP_PIEGE   = 'site_web_entreprise';
const CHAMP_INSTANT = 'ouverture'; // contient une DUREE en ms, pas un instant

function valeur(string $nom): string
{
    return trim((string) ($_POST[$nom] ?? ''));
}

$nom        = valeur('nom');
$entreprise = valeur('entreprise');
$email      = valeur('email');
$telephone  = valeur('telephone');
$secteur    = valeur('secteur');

/* --------------------------------------------------------------------------
   4. VALIDATION — calculée ici, verdict rendu à l'étape 7
   Voir l'en-tête du fichier : refuser maintenant priverait le compteur
   d'envois des tentatives invalides, donc de sa raison d'être.
   -------------------------------------------------------------------------- */

$refus = validerChamps([
    'nom'        => $nom,
    'entreprise' => $entreprise,
    'email'      => $email,
    'telephone'  => $telephone,
    'secteur'    => $secteur,
]);

/* --------------------------------------------------------------------------
   5. ORIGINE DE LA REQUÊTE

   Un robot qui poste directement sur ce point d'entrée n'a aucune raison
   d'envoyer un en-tête `Origin` ou `Referer` cohérent : il n'est jamais passé
   par la page.

   ⚠️ L'absence des DEUX en-têtes ne bloque pas. Certains navigateurs et
   certaines extensions de confidentialité les suppriment, et refuser sur cette
   base perdrait des demandes légitimes sans que personne ne le sache jamais.
   On ne refuse que sur une origine PRÉSENTE et ÉTRANGÈRE : c'est un signal,
   pas une absence de signal.

   ⚠️ UN REFUS EST UNE ERREUR, PAS UN FAUX SUCCÈS. Une origine étrangère n'est
   pas un signal de robot sans ambiguïté — c'est aussi, et d'abord, ce que
   produit un environnement de test, un proxy d'entreprise ou un domaine
   oublié dans la configuration. Répondre « succès » a rendu tout test du
   formulaire mensonger pendant deux semaines.
   -------------------------------------------------------------------------- */

$verdictOrigine = origineAcceptee(
    (string) ($_SERVER['HTTP_ORIGIN'] ?? ''),
    (string) ($_SERVER['HTTP_REFERER'] ?? ''),
    $originesAutorisees,
);

if (!$verdictOrigine['acceptee']) {
    journal(
        'refuse',
        'origine',
        sprintf(
            'source=%s valeur=%s autorisees=%s',
            $verdictOrigine['motif'],
            $verdictOrigine['valeur'],
            implode(',', $originesAutorisees),
        ),
    );
    redirige('erreur', 'origine');
}

/* --------------------------------------------------------------------------
   6. ANTI-ABUS

   ADRESSE RÉELLE DU VISITEUR
   ⚠️ `REMOTE_ADDR` NE CONVIENT PAS ICI. Le conteneur est derrière Caddy : il
   voit l'adresse du proxy, pas celle du visiteur. Le journal du 18/08/2026 le
   montre — « [client 172.18.0.3] » pour toutes les demandes, quelle qu'en soit
   la provenance.

   Une limitation fondée sur `REMOTE_ADDR` ne serait donc pas seulement
   inefficace : elle compterait TOUS les visiteurs comme un seul et les
   bloquerait tous après quelques envois.

   `X-Forwarded-For` est renseigné par le proxy, qui AJOUTE à droite : la
   première entrée est l'adresse d'origine. On ne s'y fie que parce qu'on sait
   qui est devant — cet en-tête est trivialement falsifiable sur un serveur
   directement exposé.
   -------------------------------------------------------------------------- */

function adresseVisiteur(): string
{
    $transmise = (string) ($_SERVER['HTTP_X_FORWARDED_FOR'] ?? '');
    if ($transmise !== '') {
        $premiere = trim(explode(',', $transmise)[0]);
        if (filter_var($premiere, FILTER_VALIDATE_IP) !== false) {
            return $premiere;
        }
    }
    return (string) ($_SERVER['REMOTE_ADDR'] ?? '');
}

/* --------------------------------------------------------------------------
   LIMITATION DU NOMBRE D'ENVOIS
   Le champ piège et le contrôle de délai arrêtent un robot naïf. Un robot qui
   remplit les cinq champs visibles et attend trois secondes passe — et, sans
   ce compteur, peut recommencer indéfiniment.

   Les seuils sont volontairement larges : personne ne demande légitimement six
   démonstrations en une heure, mais quelqu'un qui se trompe deux fois de
   numéro de téléphone avant d'y arriver, si. On compte TOUTES les tentatives
   parvenues jusqu'ici, y compris celles que la validation refusera ensuite :
   sinon un robot pourrait marteler avec des données invalides sans jamais être
   compté.

   L'adresse n'est pas stockée : seule son empreinte l'est, salée avec la clé
   secrète Mailjet — un secret qui existe déjà, plutôt qu'un secret de plus à
   gérer. Le fichier ne permet donc pas de reconstituer la liste des visiteurs.

   Le fichier porte l'extension `.php` et non `.json` : servi par erreur, il
   serait exécuté et ne rendrait rien, au lieu d'exposer son contenu.
   -------------------------------------------------------------------------- */

const ENVOIS_MAX_PAR_HEURE = 5;
const ENVOIS_MAX_PAR_JOUR  = 15;

/**
 * Où écrire le compteur.
 *
 * ⚠️ Ce n'est PAS une question de goût. Dans le conteneur de production, le
 * dossier de la configuration est `/var/www` : il appartient à root, et Apache
 * y tourne sous l'uid 33. Il ne peut donc rien y écrire. Le fichier de
 * configuration lui-même y est monté en LECTURE SEULE depuis l'hôte, et créer
 * un fichier voisin côté hôte ne servirait à rien — seul ce fichier-là est
 * monté, pas le dossier qui le contient.
 *
 * On essaie donc les emplacements dans l'ordre, et on prend le premier
 * réellement accessible en écriture :
 *
 *   1. le dossier de la configuration — utilisé tel quel si quelqu'un monte un
 *      jour un dossier inscriptible à cet endroit ; le compteur s'y installera
 *      sans modification de code ;
 *   2. le dossier temporaire du système, qui existe et est inscriptible dans
 *      toute image PHP.
 *
 * Le repli sur le dossier temporaire a une conséquence à connaître : une
 * recréation du conteneur remet le compteur à zéro. Pour une fenêtre glissante
 * de vingt-quatre heures, c'est acceptable — et la recréation du conteneur
 * vitrine est un événement rare, le déploiement du site se faisant par rsync
 * sans redémarrage.
 */
function dossierCompteur(string $dossierConfig): string
{
    foreach ([$dossierConfig, sys_get_temp_dir()] as $candidat) {
        if ($candidat !== '' && is_dir($candidat) && is_writable($candidat)) {
            return $candidat;
        }
    }
    return '';
}

$dossierLimites = dossierCompteur($dossierConfig);
$fichierLimites = $dossierLimites === '' ? '' : $dossierLimites . '/argon-limites.php';

if ($fichierLimites === '') {
    journal(
        'avertissement',
        'compteur-inactif',
        'aucun emplacement inscriptible (essayes : ' . $dossierConfig . ', ' . sys_get_temp_dir() . ')',
    );
}

$empreinte = hash('sha256', adresseVisiteur() . '|' . (string) $config['secretKey']);

$historique = [];
if ($fichierLimites !== '' && is_readable($fichierLimites)) {
    $lu = @include $fichierLimites;
    if (is_array($lu)) {
        $historique = $lu;
    }
}

$maintenant = time();

// Purge : au-delà de 24 h, une trace ne sert plus à rien et ne doit pas rester.
foreach ($historique as $cle => $instants) {
    $recents = array_values(array_filter(
        (array) $instants,
        static fn($t): bool => is_int($t) && $t > $maintenant - 86400,
    ));
    if ($recents === []) {
        unset($historique[$cle]);
    } else {
        $historique[$cle] = $recents;
    }
}

$miens = $historique[$empreinte] ?? [];
$surUneHeure = count(array_filter($miens, static fn(int $t): bool => $t > $maintenant - 3600));
$surUnJour   = count($miens);

if ($fichierLimites !== ''
    && ($surUneHeure >= ENVOIS_MAX_PAR_HEURE || $surUnJour >= ENVOIS_MAX_PAR_JOUR)
) {
    // `erreur` et non `succes` : un humain qui atteint la limite doit le voir
    // et pouvoir appeler. Lui afficher une confirmation mensongère serait
    // exactement la panne silencieuse que ce fichier passe son temps à éviter.
    journal('refuse', 'limite', sprintf('heure=%d jour=%d', $surUneHeure, $surUnJour));
    redirige('erreur', 'limite');
}

$historique[$empreinte] = [...$miens, $maintenant];

if ($fichierLimites !== '' && @file_put_contents(
    $fichierLimites,
    "<?php\n\n// Compteur d'envois. Empreintes salees, purge a 24 h. Genere automatiquement.\n\nreturn "
        . var_export($historique, true) . ";\n",
    LOCK_EX,
) === false) {
    // Un compteur qu'on ne peut pas écrire est un compteur qui n'existe pas.
    // Le dire fort : le mode de panne à éviter est celui où la limitation est
    // inactive depuis des mois sans que rien ne l'ait signalé.
    journal('avertissement', 'compteur-non-ecrit', 'fichier=' . $fichierLimites);
}

/* --------------------------------------------------------------------------
   SIGNAUX DE ROBOT SANS AMBIGUÏTÉ
   Robot détecté : on renvoie un SUCCÈS sans rien envoyer. Répondre par une
   erreur apprendrait au robot que le piège existe et l'inciterait à le
   contourner.

   ⚠️ Ces réponses-là sont journalisées `resultat=silence`. Elles ne doivent
   jamais entrer dans un décompte de demandes.
   -------------------------------------------------------------------------- */

// 1. Champ piège : seul un robot qui remplit tout le formulaire le renseigne.
if (valeur(CHAMP_PIEGE) !== '') {
    // Tracé côté serveur uniquement : le robot ne voit rien, mais sans cette
    // ligne il est impossible de distinguer « le formulaire fonctionne » de
    // « le formulaire avale les demandes en silence ».
    journal('silence', 'piege');
    redirige('succes');
}

// 2. Durée de remplissage, MESURÉE PAR LE NAVIGATEUR et transmise en
//    millisecondes. Absente si le visiteur navigue sans JavaScript : on ne
//    bloque alors pas, le champ piège suffit.
$verdictDelai = verdictDelai((float) valeur(CHAMP_INSTANT));

if ($verdictDelai === 'aberrant') {
    journal(
        'avertissement',
        'delai-aberrant',
        'controle du delai ignore, le champ piege reste actif',
    );
} elseif ($verdictDelai === 'trop-rapide') {
    journal('silence', 'delai', 'minimum=' . DELAI_MINIMUM_MS . 'ms');
    redirige('succes');
}

/* --------------------------------------------------------------------------
   TURNSTILE — CONTRÔLE ANTI-ROBOT DE CLOUDFLARE

   Placé APRÈS le champ piège et le contrôle de délai, qui ne coûtent rien, et
   AVANT le verdict de validation : inutile de payer un aller-retour réseau
   pour un robot que les deux barrières précédentes ont déjà écarté.

   TROIS COMPORTEMENTS, ET LEURS RAISONS

   1. Secret absent de la configuration → on laisse passer, et on le crie dans
      le journal. Le paquet peut être déployé avant que la clé ne soit posée
      sur le serveur ; refuser dans cet intervalle casserait le formulaire
      pour tout le monde. Mais un contrôle inactif doit s'entendre.

   2. Jeton absent → la demande PASSE. L'absence de jeton n'est pas un signal
      de robot : c'est le plus souvent un bloqueur de contenu, un réseau
      d'entreprise filtrant, ou Cloudflare momentanément injoignable. Refuser
      là-dessus perdrait des prospects réels en silence. Les autres barrières
      restent actives. Décision prise explicitement le 18/08/2026.

   3. Jeton présent mais refusé → `erreur`, PAS `succes`.
      C'est une différence de traitement assumée avec le champ piège. Remplir
      un champ invisible est un comportement sans ambiguïté : on répond
      « succès » pour ne rien apprendre au robot. Un jeton refusé, lui, est
      ambigu — il peut avoir expiré chez un visiteur lent, ou avoir déjà servi.
      Renvoyer vers le formulaire lui redonne un jeton neuf et il aboutit ;
      afficher une fausse confirmation lui ferait croire à un envoi qui
      n'aurait jamais eu lieu.

   Le jeton est à usage unique et vaut cinq minutes. Le widget le renouvelle
   tout seul avant expiration.
   -------------------------------------------------------------------------- */

const TURNSTILE_VERIFICATION = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

$secretTurnstile = trim((string) ($config['turnstileSecret'] ?? ''));
$jetonTurnstile  = valeur('cf-turnstile-response');

if ($secretTurnstile === '') {
    journal('avertissement', 'turnstile-inactif', 'turnstileSecret absent de la configuration');
} elseif ($jetonTurnstile === '') {
    journal(
        'avertissement',
        'turnstile-sans-jeton',
        'widget non charge ou bloque — la demande PASSE, les autres barrieres restent actives',
    );
} else {
    $requete = curl_init(TURNSTILE_VERIFICATION);
    curl_setopt_array($requete, [
        CURLOPT_POST           => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 10,
        CURLOPT_POSTFIELDS     => http_build_query([
            'secret'   => $secretTurnstile,
            'response' => $jetonTurnstile,
            // Aide Cloudflare à juger. C'est l'adresse RÉELLE du visiteur,
            // pas celle du proxy — voir adresseVisiteur() plus haut.
            'remoteip' => adresseVisiteur(),
        ]),
    ]);
    $reponseTurnstile = curl_exec($requete);
    $erreurTurnstile  = curl_error($requete);
    curl_close($requete);

    if ($reponseTurnstile === false) {
        // Cloudflare injoignable : même raisonnement que le jeton absent. Une
        // panne chez un tiers ne doit pas fermer votre formulaire.
        journal('avertissement', 'turnstile-injoignable', 'erreur=' . $erreurTurnstile);
    } else {
        $verdict = json_decode((string) $reponseTurnstile, true);
        $accepte = is_array($verdict) && ($verdict['success'] ?? false) === true;

        if (!$accepte) {
            $codes = is_array($verdict) ? (array) ($verdict['error-codes'] ?? []) : ['reponse-illisible'];
            journal(
                'refuse',
                'turnstile',
                'codes=' . (implode(',', array_map('strval', $codes)) ?: 'aucun'),
            );
            redirige('erreur', 'controle');
        }
    }
}

/* --------------------------------------------------------------------------
   CONTENU MANIFESTEMENT AUTOMATISÉ
   Le formulaire n'a aucun champ libre : « nom » et « entreprise » n'ont donc
   aucune raison de contenir une URL. Quand ils en contiennent une, ce n'est
   pas une maladresse de saisie, c'est une charge utile de spam.
   Traité comme le champ piège : on répond « succès » sans rien envoyer. Le
   robot n'apprend rien, le journal dit tout.
   -------------------------------------------------------------------------- */

if (contientLien($nom) || contientLien($entreprise)) {
    journal('silence', 'lien', 'lien detecte dans un champ nominatif');
    redirige('succes');
}

/* --------------------------------------------------------------------------
   7. VERDICT DE LA VALIDATION

   Les messageries jetables sont refusées par `validerChamps` : une adresse
   temporaire ne permet ni de rappeler, ni de suivre l'échange.

   ⚠️ Le journal nomme le champ fautif mais PAS sa valeur — un journal se
   conserve, et un numéro de téléphone est une donnée personnelle.
   -------------------------------------------------------------------------- */

if ($refus !== []) {
    journal('refuse', 'champs', 'invalides=' . implode(', ', $refus));
    redirige('erreur', 'champs');
}

/* --------------------------------------------------------------------------
   EXISTENCE DU DOMAINE — SIGNALÉE, JAMAIS BLOQUANTE

   Une résolution DNS peut échouer parce que le domaine est faux — ou parce que
   le résolveur du serveur a hoqueté. Refuser sur ce doute reviendrait à perdre
   une vraie demande pour une panne réseau de trois secondes. La demande part
   donc, avec la mention dans le mail reçu.

   ⚠️ Ce contrôle N'ATTRAPE PAS les fautes de frappe sur un domaine qui existe.
   Vérifié : « gamil.com » — la coquille du test du 18/08 — possède de vrais
   enregistrements MX, c'est un typosquat enregistré. Le DNS le déclare donc
   valide, et il l'est. Seule la suggestion affichée dans le navigateur peut
   rattraper ce cas ; les deux contrôles sont complémentaires, aucun ne
   remplace l'autre. Ce qui est attrapé ici, ce sont les domaines qui
   n'existent pas du tout.
   -------------------------------------------------------------------------- */

$domaineEmail  = domaineAdresse($email);
$domaineResolu = true;

if ($domaineEmail !== '' && function_exists('checkdnsrr')) {
    $domaineResolu = checkdnsrr($domaineEmail, 'MX') || checkdnsrr($domaineEmail, 'A');
    if (!$domaineResolu) {
        journal(
            'avertissement',
            'domaine-non-resolu',
            'domaine=' . $domaineEmail . ' — la demande PART, signalee dans le mail',
        );
    }
}

/* --------------------------------------------------------------------------
   LIBELLÉ DE L'ACTIVITÉ
   Le sélecteur poste le chemin de la page secteur. On le traduit pour que
   l'e-mail reçu soit lisible. Table à tenir à jour avec le registre de routes
   (src/lib/routes.ts) ; une valeur inconnue est reprise telle quelle plutôt
   que perdue.

   ⚠️ `npm run seo:check` (contrôle 7) compare cette table au registre et fait
   échouer le build si l'une des deux dérive. Ne pas renommer le tableau
   `$libelles` sans mettre le contrôle à jour : il le cherche par son nom.
   -------------------------------------------------------------------------- */

$libelles = [
    '/secteurs/maintenance'       => 'Maintenance',
    '/secteurs/depannage'         => 'Dépannage',
    '/secteurs/installation'      => 'Installation',
    '/secteurs/transport-courses' => 'Transport & courses',
    '/secteurs/cvc'               => 'CVC',
    'autre'                       => 'Autre activité',
];
$activite = $libelles[$secteur] ?? $secteur;

/* --------------------------------------------------------------------------
   PROVENANCE
   D'où vient ce prospect ? Sans cette réponse, une demande arrive sans qu'on
   sache jamais ce qui l'a produite, et toute décision éditoriale se prend à
   l'intuition.

   Les quatre valeurs viennent du navigateur (voir src/components/forms/
   DemoForm.tsx). Elles n'ouvrent aucun droit et n'entrent dans aucune
   décision : elles remplissent des lignes d'un e-mail interne. Elles sont
   néanmoins normalisées avant d'être écrites — ce qui n'est pas un chemin
   interne plausible, un hôte plausible, est jeté.
   -------------------------------------------------------------------------- */

$provenance = [
    'url'        => normaliserCheminOrigine(valeur('origine_url')),
    'titre'      => nettoyerTexteLibre(valeur('origine_titre'), 120),
    'source'     => normaliserSource(valeur('origine_source')),
    'campagne'   => nettoyerTexteLibre(valeur('origine_campagne'), 160),
    // Simulation emportée depuis /tarifs, sur clic explicite du visiteur.
    'simulateur' => normaliserSimulateur(valeur('origine_simulateur')),
    'resultat'   => nettoyerTexteLibre(valeur('origine_resultat'), 200),
];

/**
 * La date est posée par le SERVEUR, jamais par le client : c'est la seule
 * horloge dont on connaisse le réglage. Fuseau explicite — un conteneur nu est
 * en UTC, et « 07:12 » pour une demande de 09:12 fait manquer un rappel.
 */
$horodatage = (new DateTimeImmutable('now', new DateTimeZone('Europe/Paris')))
    ->format('d/m/Y à H:i');

/* --------------------------------------------------------------------------
   8. ENVOI — MAILJET (API Send v3.1)
   Appel direct en cURL, sans SDK. Mailjet est un fournisseur français : les
   données ne quittent pas l'Union européenne.
   -------------------------------------------------------------------------- */

$corps = implode("\n", [
    'Nouvelle demande de démonstration — argon-mobility.com',
    '',
    'Nom          : ' . $nom,
    'Entreprise   : ' . $entreprise,
    'E-mail       : ' . $email,
    'Téléphone    : ' . $telephone,
    'Activité     : ' . $activite,
    '',
    '— Provenance —',
    ...lignesProvenance($provenance),
    'Date           : ' . $horodatage,
]);

// Le doute sur l'adresse est porté jusque dans la boîte de réception : c'est
// là qu'on décide de rappeler par téléphone plutôt que d'écrire dans le vide.
if (!$domaineResolu) {
    $corps .= "\n\n"
        . '⚠️ Le domaine « ' . $domaineEmail . ' » n\'a pas pu être résolu. '
        . 'L\'adresse est peut-être mal saisie : préférez le téléphone.';
}

$charge = [
    'Messages' => [[
        'From'     => ['Email' => $config['from'], 'Name' => 'Site Argon'],
        'To'       => [['Email' => $config['to']]],
        // Répondre depuis la boîte de réception écrit directement au prospect.
        'ReplyTo'  => ['Email' => $email, 'Name' => $nom],
        'Subject'  => 'Démo Argon — ' . $entreprise . ' (' . $activite . ')',
        'TextPart' => $corps,
    ]],
];

$ch = curl_init('https://api.mailjet.com/v3.1/send');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
    CURLOPT_USERPWD        => $config['apiKey'] . ':' . $config['secretKey'],
    CURLOPT_POSTFIELDS     => json_encode($charge, JSON_UNESCAPED_UNICODE),
    // Ne jamais laisser une requête sortante bloquer la page indéfiniment.
    CURLOPT_TIMEOUT        => 10,
]);

$reponse      = curl_exec($ch);
$code         = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$erreurReseau = curl_error($ch);
curl_close($ch);

/**
 * Trace côté serveur uniquement — le visiteur ne doit jamais connaître la
 * cause technique, ni même le nom du fournisseur. Les deux familles de panne
 * sont distinguées parce qu'elles n'ont rien à voir :
 *   — code 0  : la requête n'est jamais partie (DNS, pare-feu sortant de
 *               l'hébergeur, délai dépassé). Rien à corriger dans Mailjet.
 *   — 401/403 : les clés sont refusées.
 *   — 400     : l'expéditeur n'est pas validé dans Mailjet.
 * Le journal est consultable par `docker logs argon-vitrine-vitrine-1`.
 */
if ($erreurReseau !== '') {
    journal('refuse', 'envoi-reseau', 'erreur=' . $erreurReseau);
    redirige('erreur', 'technique');
}

if ($code < 200 || $code >= 300) {
    journal('refuse', 'envoi-refuse', 'http=' . $code . ' reponse=' . (string) $reponse);
    redirige('erreur', 'technique');
}

/* --------------------------------------------------------------------------
   9. SUCCÈS
   La ligne ci-dessous est le SEUL décompte fiable des demandes reçues.
   -------------------------------------------------------------------------- */

$cleDemande = cleIdempotence();

journal('envoye', '', sprintf(
    'entreprise=%s activite=%s page=%s source=%s simulateur=%s idem=%s',
    $entreprise,
    $activite,
    $provenance['url'] !== '' ? $provenance['url'] : '-',
    $provenance['source'] !== '' ? $provenance['source'] : '-',
    $provenance['simulateur'] !== '' ? $provenance['simulateur'] : '-',
    $cleDemande,
));

/* --------------------------------------------------------------------------
   10. SYNCHRONISATION CRM — après l'envoi, jamais avant

   ⚠️ TROIS INTERDITS, qui sont la raison d'être de ce bloc :

   1. **Il ne peut pas changer la réponse au visiteur.** Il s'exécute APRÈS la ligne
      `resultat=envoye`, et sa valeur de retour n'est lue que pour écrire une seconde ligne
      de journal. Quoi qu'il arrive ici, `redirige('succes')` suit.
   2. **Aucune reprise automatique.** Pas de second appel, pas de second mail, pas de file
      d'attente. Un `crm=echec` se rattrape à la main, avec la clé d'idempotence — c'est
      exactement à cela qu'elle sert, et c'est pourquoi elle est journalisée juste au-dessus,
      qu'il y ait eu échec ou non.
   3. **L'absence de configuration n'est pas une panne.** `crmUrl` ou `crmSecret` manquants ⇒
      aucun appel, une ligne `crm=inactif`, et rien d'autre. Le paquet doit pouvoir être
      déployé avant que la clé n'existe sur le serveur — même règle que pour Turnstile.

   Le délai est court (2 s) et assumé : l'API est une commodité, pas une dépendance. Mieux
   vaut une fiche manquante qu'un visiteur qui attend.
   -------------------------------------------------------------------------- */

$crmUrl    = trim((string) ($config['crmUrl'] ?? ''));
$crmSecret = trim((string) ($config['crmSecret'] ?? ''));

if ($crmUrl === '' || $crmSecret === '') {
    journal('avertissement', 'crm-inactif', 'crmUrl ou crmSecret absent de la configuration');
} else {
    $chargeCrm = chargeCrm(
        $cleDemande,
        [
            'nom'        => $nom,
            'entreprise' => $entreprise,
            'email'      => $email,
            'telephone'  => $telephone,
            'secteur'    => $secteur,
            'activite'   => $activite,
        ],
        $provenance,
        (new DateTimeImmutable('now', new DateTimeZone('UTC')))->format('Y-m-d\TH:i:s\Z'),
    );

    $appelCrm = curl_init($crmUrl);
    curl_setopt_array($appelCrm, [
        CURLOPT_POST           => true,
        CURLOPT_RETURNTRANSFER => true,
        // Deux secondes, connexion comprise. Le visiteur attend déjà la réponse de Mailjet ;
        // on ne lui ajoute pas l'attente d'un service qui ne décide de rien.
        CURLOPT_TIMEOUT        => 2,
        CURLOPT_CONNECTTIMEOUT => 2,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'X-Argon-Secret: ' . $crmSecret,
        ],
        CURLOPT_POSTFIELDS     => json_encode($chargeCrm, JSON_UNESCAPED_UNICODE),
    ]);

    $reponseCrm = curl_exec($appelCrm);
    $codeCrm    = (int) curl_getinfo($appelCrm, CURLINFO_HTTP_CODE);
    $erreurCrm  = curl_error($appelCrm);
    curl_close($appelCrm);

    if ($reponseCrm === false) {
        journal('avertissement', 'crm-echec', 'reseau=' . $erreurCrm . ' idem=' . $cleDemande);
    } elseif ($codeCrm < 200 || $codeCrm >= 300) {
        journal('avertissement', 'crm-echec', 'http=' . $codeCrm . ' idem=' . $cleDemande);
    } else {
        // Le statut rendu par l'API distingue « creee » de « deja-traitee ». On le recopie
        // tel quel : c'est la seule chose qui permette de reconnaître un rejeu dans le
        // journal, et de ne pas le compter deux fois.
        $verdictCrm = json_decode((string) $reponseCrm, true);
        $statutCrm  = is_array($verdictCrm) ? (string) ($verdictCrm['statut'] ?? '?') : '?';
        journal('avertissement', 'crm-ok', 'statut=' . $statutCrm . ' idem=' . $cleDemande);
    }
}

redirige('succes');
