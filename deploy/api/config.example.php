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
