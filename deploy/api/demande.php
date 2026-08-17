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
 * Doit rester synchronisé avec src/lib/demo-request.ts (noms de champs et
 * motifs de saisie). Toute divergence se traduit par des demandes refusées
 * après un aller-retour réseau, ce qui est invisible côté exploitation.
 */

declare(strict_types=1);

/* --------------------------------------------------------------------------
   RÉPONSE
   Le formulaire poste sans JavaScript : on renvoie le visiteur sur une page
   du site, plutôt que du JSON qu'il ne verrait jamais.
   Le 303 garantit qu'un rechargement ne renvoie pas la demande une
   seconde fois.
   -------------------------------------------------------------------------- */

function redirige(string $etat): void
{
    // Succès : page de confirmation déjà construite, qui fonctionne y compris
    // sans JavaScript. Échec : retour au formulaire, que le visiteur doit
    // pouvoir renvoyer immédiatement.
    $cible = $etat === 'succes'
        ? '/demande-envoyee'
        : '/demander-une-demo?etat=erreur';

    header('Location: ' . $cible, true, 303);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    redirige('erreur');
}

/**
 * Emplacement des identifiants — deux possibilités, dans cet ordre.
 *
 * 1. AU-DESSUS de la racine web (`www/../argon-config.php`). C'est le meilleur
 *    emplacement : un fichier hors du dossier servi par Apache ne peut pas
 *    être téléchargé, quoi qu'il arrive au .htaccess. Aucune règle à faire
 *    respecter, donc aucune règle qui puisse être perdue lors d'un transfert.
 * 2. `api/config.php`, protégé par le .htaccess du dossier. Fonctionne, mais
 *    la protection dépend d'un fichier que les clients FTP masquent et que
 *    l'hébergeur doit autoriser à surcharger la configuration.
 *
 * Si le contrôle « /api/config.php doit renvoyer 403 » échoue, la correction
 * n'est pas de bricoler le .htaccess : c'est de déplacer le fichier en 1.
 */
$emplacements = [
    dirname(__DIR__, 2) . '/argon-config.php', // au-dessus de www/
    __DIR__ . '/config.php',                   // dans api/
];

$config = null;
foreach ($emplacements as $emplacement) {
    if (is_readable($emplacement)) {
        $config = require $emplacement;
        break;
    }
}

if (!is_array($config)) {
    error_log(
        '[demande-demo] Aucun fichier de configuration trouvé. Emplacements '
        . 'testés : ' . implode(', ', $emplacements),
    );
    redirige('erreur');
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
    error_log(
        '[demande-demo] config.php incomplet — clés vides : '
        . implode(', ', $manquants)
        . '. La demande n\'a PAS été envoyée.',
    );
    redirige('erreur');
}

/* --------------------------------------------------------------------------
   ANTI-ROBOT
   Robot détecté : on renvoie un SUCCÈS sans rien envoyer. Répondre par une
   erreur apprendrait au robot que le piège existe et l'inciterait à le
   contourner.
   -------------------------------------------------------------------------- */

const CHAMP_PIEGE   = 'site_web_entreprise';
const CHAMP_INSTANT = 'ouverture';
const DELAI_MINIMUM_MS = 3000; // Un humain met plus de 3 s à remplir 5 champs.

function valeur(string $nom): string
{
    return trim((string) ($_POST[$nom] ?? ''));
}

// 1. Champ piège : seul un robot qui remplit tout le formulaire le renseigne.
if (valeur(CHAMP_PIEGE) !== '') {
    redirige('succes');
}

// 2. Délai de saisie. Absent si le visiteur navigue sans JavaScript : dans ce
//    cas on ne bloque pas, le champ piège suffit.
$ouverture = (float) valeur(CHAMP_INSTANT);
if ($ouverture > 0 && (microtime(true) * 1000 - $ouverture) < DELAI_MINIMUM_MS) {
    redirige('succes');
}

/* --------------------------------------------------------------------------
   VALIDATION
   Volontairement permissive : chaque règle trop stricte est une demande
   perdue. Les adresses gratuites ne sont PAS refusées — beaucoup de dirigeants
   de PME utilisent une adresse personnelle.
   -------------------------------------------------------------------------- */

$nom        = valeur('nom');
$entreprise = valeur('entreprise');
$email      = valeur('email');
$telephone  = valeur('telephone');
$secteur    = valeur('secteur');

$valide =
    mb_strlen($nom) >= 2 && mb_strlen($nom) <= 80
    && mb_strlen($entreprise) >= 2 && mb_strlen($entreprise) <= 120
    && mb_strlen($email) <= 160
    && preg_match('/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i', $email) === 1
    && preg_match('/^[+0-9][0-9\s.()\-]{7,19}$/', $telephone) === 1
    && $secteur !== '' && mb_strlen($secteur) <= 60;

if (!$valide) {
    redirige('erreur');
}

/* --------------------------------------------------------------------------
   LIBELLÉ DE L'ACTIVITÉ
   Le sélecteur poste le chemin de la page secteur. On le traduit pour que
   l'e-mail reçu soit lisible. Table à tenir à jour avec le registre de routes
   (src/lib/routes.ts) ; une valeur inconnue est reprise telle quelle plutôt
   que perdue.
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
   ENVOI — MAILJET (API Send v3.1)
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
]);

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

$reponse     = curl_exec($ch);
$code        = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
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
 * Le journal est consultable depuis l'espace client OVH.
 */
if ($erreurReseau !== '') {
    error_log('[demande-demo] Requête sortante impossible : ' . $erreurReseau);
    redirige('erreur');
}

if ($code < 200 || $code >= 300) {
    error_log('[demande-demo] Mailjet a répondu ' . $code . ' : ' . (string) $reponse);
    redirige('erreur');
}

redirige('succes');
