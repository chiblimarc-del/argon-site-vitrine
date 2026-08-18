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
