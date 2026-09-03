<?php
/**
 * Routeur du serveur local — le seul moyen d'éprouver le formulaire ailleurs
 * qu'en production.
 *
 *   npm run apercu        # http://localhost:3003
 *
 * ─────────────────────────────────────────────────────────────────────────
 * POURQUOI CE FICHIER EXISTE
 *
 * `next dev` n'exécute pas de PHP, et l'export statique interdit toute route
 * serveur de remplacement : le formulaire postait donc dans le vide en local,
 * et ne pouvait être essayé qu'une fois en ligne. C'est ainsi qu'est passé le
 * défaut du 31/08/2026 — une origine refusée repartait vers la page de
 * confirmation sans qu'aucun mail ne parte.
 *
 * Le serveur intégré de PHP, lui, sait faire les deux : servir les fichiers de
 * `out/` et exécuter `deploy/api/demande.php`. Ce routeur ne fait que les
 * aiguiller.
 *
 * ⚠️ CE N'EST PAS APACHE. Il reproduit les deux règles du `.htaccess` dont le
 * formulaire dépend — URL sans extension et fermeture du dossier `api/` — et
 * rien d'autre. Les en-têtes de sécurité, la CSP et le cache ne sont PAS
 * reproduits : ils se vérifient en ligne, sur le paquet réel.
 *
 * ⚠️ ARRÊTER L'APERÇU AVANT DE RECONSTRUIRE. `php -S -t out` place le processus
 * DANS `out/`, et Windows refuse alors d'effacer le dossier : `npm run build`
 * tombe sur `EBUSY: resource busy or locked, rmdir out`. Le message ne dit pas
 * que le coupable est le serveur d'à côté.
 *
 * ⚠️ UN SEUL SERVEUR À LA FOIS. Sous Windows, deux `php -S` sur le même port
 * démarrent tous les deux sans se plaindre, et c'est le plus ancien qui répond.
 * Comme le routeur est relu à chaque requête, un processus périmé sert le code
 * du jour avec la configuration de la veille. En cas de doute :
 * `Get-Process php` ne doit montrer qu'une seule ligne.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * CE QUI MARCHE ICI, ET CE QUI NE PEUT PAS
 *
 * Marche : validation des champs, contrôle d'origine, compteur d'envois,
 * champ piège, durée de saisie, Turnstile (clés de test Cloudflare), et
 * surtout le comportement en ÉCHEC — un refus ne doit jamais repartir en
 * « succès ».
 *
 * Ne peut pas : l'envoi Mailjet réussi, faute de vraies clés, et le raccord
 * CRM, dont l'adresse `backend:3000` vit sur le réseau Docker privé du VPS.
 * Les deux se neutralisent proprement — la configuration absente donne
 * `crm-inactif`, jamais une panne.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * LA CONFIGURATION LOCALE
 *
 * `demande.php` cherche ses identifiants deux dossiers au-dessus de lui, soit
 * `argon-config.php` à la racine du dépôt. C'est là qu'il faut le poser, et
 * NULLE PART AILLEURS : `deploy/api/config.php`, le repli de production, est
 * refusé par `npm run deploy:pack` s'il traîne dans le dépôt.
 *
 *   cp deploy/api/config.example.php argon-config.php
 *   puis 'origines' => ['http://localhost:3003']
 *
 * Le fichier est ignoré par git. Voir docs/publier.md § « Essayer le
 * formulaire en local ».
 */

declare(strict_types=1);

$racine   = dirname(__DIR__);
$statique = $racine . '/out';
$api      = $racine . '/deploy/api';

/*
 * Le journal du formulaire, dans un fichier plutôt que sur la sortie d'erreur.
 *
 * `demande.php` ne dit ce qu'il a fait que par `error_log()` : refuse, silence,
 * succes. Sur la sortie d'erreur du serveur intégré, ces lignes se noient dans
 * les traces de requêtes et disparaissent à la fermeture du terminal — or c'est
 * le seul endroit où l'on apprend qu'un « succès » était un silence.
 *
 * Le chemin est calculé depuis ce fichier, jamais depuis le dossier courant :
 * `php -S -t out` place le processus DANS `out/`, et un chemin relatif irait
 * donc écrire au milieu du site exporté.
 */
ini_set('error_log', $racine . '/argon-journal.log');

$chemin = parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH);
$chemin = rawurldecode(is_string($chemin) && $chemin !== '' ? $chemin : '/');

/* ==========================================================================
   1. LE FORMULAIRE

   Le seul chemin exécuté. On inclut le fichier réel de `deploy/api/`, jamais
   une copie : un routeur qui servirait un double laisserait les deux diverger
   sans que rien ne le signale.

   L'inclusion garde `__DIR__` sur `deploy/api`, donc la recherche de
   configuration reste exactement celle de la production.
   ========================================================================== */
if ($chemin === '/api/demande.php') {
    require $api . '/demande.php';
    return true;
}

/* ==========================================================================
   2. LE RESTE DU DOSSIER api/ EST FERMÉ

   `deploy/api/.htaccess` ne laisse passer que `demande.php`. Sans cette
   règle ici, `demande-controles.php` et surtout `config.php` seraient
   téléchargeables — et le local mentirait sur la sécurité du réel.
   ========================================================================== */
if (str_starts_with($chemin, '/api/')) {
    http_response_code(403);
    header('Content-Type: text/plain; charset=utf-8');
    echo "403 — seul /api/demande.php est exposé.\n";
    return true;
}

/* ==========================================================================
   3. LES FICHIERS DU SITE

   Un chemin qui désigne un fichier existant est rendu au serveur intégré
   (`return false`) : il connaît les types MIME mieux qu'une table écrite ici.

   Le reste passe par la réécriture d'URL du `.htaccess` : `trailingSlash`
   étant à false, l'export produit `contact.html` et l'URL est `/contact`.
   ========================================================================== */
$interdit = static function (string $cible) use ($statique): bool {
    $reel = realpath($cible);
    return $reel === false || !str_starts_with($reel, (string) realpath($statique));
};

if ($chemin !== '/' && is_file($statique . $chemin) && !$interdit($statique . $chemin)) {
    return false;
}

$candidats = $chemin === '/'
    ? [$statique . '/index.html']
    : [$statique . $chemin . '.html', $statique . $chemin . '/index.html'];

foreach ($candidats as $candidat) {
    if (is_file($candidat) && !$interdit($candidat)) {
        header('Content-Type: text/html; charset=utf-8');
        readfile($candidat);
        return true;
    }
}

/* ==========================================================================
   4. LA PAGE 404 DU SITE, avec le code qui va avec.
   ========================================================================== */
http_response_code(404);
if (is_file($statique . '/404.html')) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($statique . '/404.html');
    return true;
}

header('Content-Type: text/plain; charset=utf-8');
echo "404 — lancez `npm run build` : le dossier out/ est incomplet.\n";
return true;
