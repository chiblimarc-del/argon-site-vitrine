<?php
/**
 * LA SYNCHRONISATION CRM — ce qui part vers l'API Argon.
 *
 * Ce qui est éprouvé ici est la CHARGE, jamais l'appel : le réseau n'a pas sa place dans un
 * test, et la partie qui peut mentir est celle qui met en forme. Un nom de champ qui dérive
 * du schéma Zod produirait un 400 que personne ne verrait — le site ignore la réponse par
 * construction.
 */

declare(strict_types=1);

titre('Clé d\'idempotence');

$cle = cleIdempotence();

verifier('32 caractères hexadécimaux', preg_match('/^[0-9a-f]{32}$/', $cle) === 1);
verifier(
    'deux appels donnent deux clés — une par SOUMISSION, jamais par personne',
    cleIdempotence() !== cleIdempotence(),
);

titre('La charge envoyée à POST /demandes-site');

$contact = [
    'nom'        => 'Marc Durand',
    'entreprise' => 'Transports Durand',
    'email'      => 'm.durand@transports-durand.fr',
    'telephone'  => '06 12 34 56 78',
    'secteur'    => '/secteurs/transport-courses',
    'activite'   => 'Transport & courses',
];

$provenance = [
    'url'        => '/secteurs/transport-courses',
    'titre'      => 'Logiciel de gestion des courses et tournées',
    'source'     => 'www.google.com',
    'campagne'   => '',
    'simulateur' => 'gains',
    'resultat'   => '12 terrains · solde + 1 931 €/mois',
];

$charge = chargeCrm($cle, $contact, $provenance, '2026-09-01T09:14:22Z');

// Les noms de champs sont le CONTRAT avec `packages/schemas/src/demande-site.schema.ts`.
// Les vérifier un par un est fastidieux, et c'est exactement pour cela qu'on le fait : une
// divergence ne casse rien de visible ici, elle casse une fiche qui n'arrive jamais.
verifierEgal('la clé est reportée', $cle, $charge['cleIdempotence']);
verifierEgal('horodatage ISO', '2026-09-01T09:14:22Z', $charge['envoyeeLe']);
verifierEgal('entreprise', 'Transports Durand', $charge['contact']['entreprise']);
verifierEgal('nom', 'Marc Durand', $charge['contact']['nom']);
verifierEgal('email', 'm.durand@transports-durand.fr', $charge['contact']['email']);
verifierEgal('téléphone', '06 12 34 56 78', $charge['contact']['telephone']);
verifierEgal('secteur', '/secteurs/transport-courses', $charge['contact']['secteur']);
verifierEgal('activité en clair', 'Transport & courses', $charge['contact']['activite']);
verifierEgal('page d\'origine', '/secteurs/transport-courses', $charge['provenance']['url']);
verifierEgal('titre de la page', 'Logiciel de gestion des courses et tournées', $charge['provenance']['titre']);
verifierEgal('source', 'www.google.com', $charge['provenance']['source']);
verifierEgal('simulateur', 'gains', $charge['provenance']['simulateur']);
verifier('résultat du simulateur', strpos($charge['provenance']['resultat'], '1 931') !== false);

verifier(
    'aucune clé inattendue à la racine',
    array_keys($charge) === ['cleIdempotence', 'envoyeeLe', 'contact', 'provenance'],
);

titre('Provenance absente : la demande part quand même');

$vide = ['url' => '', 'titre' => '', 'source' => '', 'campagne' => '', 'simulateur' => '', 'resultat' => ''];
$chargeSansProvenance = chargeCrm($cle, $contact, $vide, '2026-09-01T09:14:22Z');

verifier(
    'le bloc provenance existe, même vide — jamais absent du contrat',
    isset($chargeSansProvenance['provenance']),
);
verifierEgal('page d\'origine vide', '', $chargeSansProvenance['provenance']['url']);
verifierEgal('le contact, lui, reste complet', 'Transports Durand', $chargeSansProvenance['contact']['entreprise']);

titre('La charge est encodable en JSON, accents compris');

$json = json_encode($charge, JSON_UNESCAPED_UNICODE);

verifier('encodage réussi', $json !== false);
verifier(
    'les accents partent en clair, pas en séquences d\'échappement',
    strpos((string) $json, 'tournées') !== false,
);
verifier(
    'le secret ne se trouve NULLE PART dans la charge — il vit dans l\'en-tête',
    stripos((string) $json, 'secret') === false,
);
