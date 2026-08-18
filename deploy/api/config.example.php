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
 * FICHIER VOISIN : argon-limites.php
 *
 * `demande.php` borne le nombre d'envois par visiteur et tient son compteur
 * dans `argon-limites.php`, DANS CE MÊME DOSSIER. Il le crée tout seul — à
 * condition de pouvoir y écrire.
 *
 * ⚠️ Apache tourne sous l'uid 33 dans le conteneur. Si le dossier ne lui est
 * pas accessible en écriture, le compteur n'est jamais écrit et la limitation
 * est INACTIVE. Le cas est journalisé à chaque envoi, en toutes lettres — mais
 * autant le prévenir :
 *
 *     touch  /home/argon/vitrine/argon-limites.php
 *     chown  33:33 /home/argon/vitrine/argon-limites.php
 *     chmod  600   /home/argon/vitrine/argon-limites.php
 *
 * Le fichier ne contient que des empreintes salées et des horodatages : ni
 * adresse IP, ni donnée personnelle en clair. Purge automatique à 24 h.
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
];
