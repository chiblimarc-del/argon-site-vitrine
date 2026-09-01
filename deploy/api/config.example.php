<?php
/**
 * Identifiants Mailjet — modèle.
 *
 * Ce fichier est un EXEMPLE. Le vrai fichier s'appelle `argon-config.php` et
 * se place AU-DESSUS du dossier `www/`.
 *
 * ⚠️ Ni ce modèle ni le vrai fichier ne doivent être versionnés.
 *
 * Hors de la racine web, le fichier ne peut pas être téléchargé — aucune règle
 * de configuration à faire respecter, donc aucune règle à perdre lors d'un
 * transfert. Repli accepté : `www/api/config.php`, protégé par le .htaccess du
 * dossier ; vérifier alors que /api/config.php renvoie bien 403.
 *
 * Les quatre valeurs ci-dessous sont vides volontairement : elles doivent être
 * remplacées par les vraies clés, jamais par des valeurs de test.
 */

/*
 * ---------------------------------------------------------------------------
 * COMPTEUR D'ENVOIS — RIEN À FAIRE
 *
 * `demande.php` borne le nombre d'envois par visiteur et tient son compteur
 * dans un fichier `argon-limites.php` qu'il crée tout seul, à l'emplacement
 * inscriptible qu'il trouve.
 *
 * En production, ce sera le dossier temporaire du conteneur : le dossier de ce
 * fichier-ci, `/var/www`, appartient à root et Apache y tourne sous l'uid 33.
 * Créer le fichier côté hôte ne servirait à rien — seul `argon-config.php` est
 * monté, pas le dossier qui le contient.
 *
 * Conséquence à connaître : une recréation du conteneur remet le compteur à
 * zéro. Pour une fenêtre glissante de 24 h, c'est sans importance.
 *
 * Le fichier ne contient que des empreintes salées et des horodatages : ni
 * adresse IP, ni donnée personnelle en clair.
 * ---------------------------------------------------------------------------
 */

return [
    /*
     * -----------------------------------------------------------------------
     * ORIGINES AUTORISÉES À POSTER LE FORMULAIRE
     *
     * ⚠️ C'EST LA SEULE CHOSE QUI DIFFÈRE ENTRE LA PRODUCTION ET LE STAGING.
     * Le paquet déposé par `scp` est identique sur les deux machines : lui
     * demander de savoir où il tourne était le défaut du 31/08/2026. Ce
     * fichier-ci, lui, est propre à chaque serveur — il porte déjà des clés
     * Mailjet différentes. C'est donc lui qui déclare son domaine.
     *
     * Sur la PRODUCTION :
     *     'origines' => ['https://www.argon-mobility.com'],
     *
     * Sur le STAGING :
     *     'origines' => ['https://vitrine-staging.argon-mobility.com'],
     *
     * Forme attendue : schéma + hôte, SANS slash final — exactement ce que le
     * navigateur met dans l'en-tête `Origin`. Une valeur qui n'a ni schéma ni
     * hôte est ignorée : une faute de saisie doit se voir, pas élargir
     * l'autorisation en silence.
     *
     * Laissée vide, la liste retombe sur le domaine de production et chaque
     * demande le journalise (`motif=origines-non-declarees`). Le site continue
     * donc de fonctionner si le paquet arrive avant la mise à jour de ce
     * fichier — mais l'écart s'entend.
     *
     * ⚠️ Ne PAS ajouter le staging à la liste de la production : ce serait
     * autoriser un autre site à poster sur le formulaire de production.
     * -----------------------------------------------------------------------
     */
    'origines'  => ['https://www.argon-mobility.com'],

    /*
     * -----------------------------------------------------------------------
     * SYNCHRONISATION CRM — facultative (01/09/2026)
     *
     * Quand ces deux valeurs sont posées, chaque demande devient AUSSI une fiche
     * prospect dans Argon, avec sa page d'origine et sa simulation.
     *
     * ⚠️ L'E-MAIL RESTE LA GARANTIE. Cet appel a lieu APRÈS l'envoi Mailjet, avec
     * deux secondes de patience, et son échec n'est jamais lu autrement que pour
     * écrire une ligne de journal. Laisser ces clés vides ne casse rien : le
     * formulaire fonctionne comme avant, et le journal dit `crm=inactif`.
     *
     * `crmUrl` — le backend, joint par le RÉSEAU DOCKER PRIVÉ, jamais par
     * internet. Le conteneur de la vitrine et celui du backend partagent le même
     * réseau : `http://backend:3000` ne sort donc pas du serveur, et aucune URL
     * publique n'est nécessaire.
     *
     *     'crmUrl' => 'http://backend:3000/demandes-site',
     *
     * `crmSecret` — la même valeur que `DEMANDES_SITE_SECRET` du backend, dans
     * CE MÊME environnement. Un secret différent par environnement : celui de
     * production n'a rien à faire sur le staging.
     * -----------------------------------------------------------------------
     */
    'crmUrl'    => '',
    'crmSecret' => '',

    // Mailjet > Account settings > REST API > API Key Management
    'apiKey'    => '',
    'secretKey' => '',

    // Expéditeur : doit être un expéditeur VALIDÉ dans Mailjet, sur le
    // domaine argon-mobility.com. Recommandé : no-reply@argon-mobility.com —
    // le Reply-To étant l'adresse du prospect, personne n'écrit jamais ici.
    // Voir deploy/MAILJET.md, étapes 2 et 3.
    'from'      => '',

    // Destinataire des demandes.
    'to'        => 'contact@argon-mobility.com',

    /*
     * Clé SECRÈTE Turnstile — dash.cloudflare.com > Turnstile > votre widget.
     *
     * À ne pas confondre avec la clé publique, qui vit dans le dépôt
     * (`src/lib/site.ts`) parce qu'elle s'affiche de toute façon dans la page.
     * Celle-ci prouve à Cloudflare que c'est bien VOTRE serveur qui pose la
     * question : elle ne doit exister qu'ici.
     *
     * Laissée vide, le contrôle Turnstile est simplement INACTIF — le
     * formulaire continue de fonctionner, et chaque envoi le journalise en
     * toutes lettres. C'est volontaire : déployer le site avant d'avoir posé
     * la clé ne doit casser aucune demande.
     */
    'turnstileSecret' => '',
];
