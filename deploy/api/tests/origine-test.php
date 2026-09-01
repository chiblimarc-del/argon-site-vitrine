<?php
/**
 * L'ORIGINE — le contrôle qui a fait croire pendant deux semaines que le
 * formulaire fonctionnait sur le staging alors qu'aucun mail ne partait.
 *
 * Le test central est le dernier de ce fichier : une origine réellement
 * interdite ne doit produire AUCUN envoi, et la réponse doit être une erreur,
 * jamais une confirmation.
 */

declare(strict_types=1);

titre('Origines déclarées par la configuration');

[$liste, $repli] = originesAutorisees(['origines' => ['https://vitrine-staging.argon-mobility.com']]);
verifierEgal('staging déclaré : la liste le contient', ['https://vitrine-staging.argon-mobility.com'], $liste);
verifier('staging déclaré : ce n\'est pas le repli', $repli === false);

[$liste, $repli] = originesAutorisees([]);
verifierEgal('aucune origine déclarée : repli sur la production', [ORIGINE_PRODUCTION], $liste);
verifier('aucune origine déclarée : le repli est signalé', $repli === true);

[$liste, $repli] = originesAutorisees(['origines' => '']);
verifier('origine vide : repli signalé', $repli === true);

[$liste, $repli] = originesAutorisees(['origines' => ['pas une url', '///']]);
verifierEgal('liste entièrement illisible : repli sur la production', [ORIGINE_PRODUCTION], $liste);
verifier('liste entièrement illisible : le repli est signalé', $repli === true);

[$liste] = originesAutorisees(['origines' => 'https://www.argon-mobility.com']);
verifierEgal('une chaîne seule est acceptée comme une liste d\'un élément', ['https://www.argon-mobility.com'], $liste);

[$liste] = originesAutorisees(['origines' => [
    'https://www.argon-mobility.com/',
    'HTTPS://WWW.ARGON-MOBILITY.COM',
    'https://vitrine-staging.argon-mobility.com',
]]);
verifierEgal(
    'slash final et casse : normalisés, doublon supprimé',
    ['https://www.argon-mobility.com', 'https://vitrine-staging.argon-mobility.com'],
    array_values($liste),
);

titre('Normalisation d\'une origine');

verifierEgal('slash final retiré', 'https://exemple.fr', normaliserOrigine('https://exemple.fr/'));
verifierEgal('casse ramenée en minuscules', 'https://exemple.fr', normaliserOrigine('HTTPS://Exemple.FR'));
verifierEgal('port conservé', 'http://localhost:3000', normaliserOrigine('http://localhost:3000'));
verifierEgal('chemin ignoré', 'https://exemple.fr', normaliserOrigine('https://exemple.fr/une/page'));
verifierEgal('sans schéma : rejeté', '', normaliserOrigine('exemple.fr'));
verifierEgal('vide : rejeté', '', normaliserOrigine('   '));

titre('Acceptation de la requête');

$prod    = ['https://www.argon-mobility.com'];
$staging = ['https://vitrine-staging.argon-mobility.com'];

$verdict = origineAcceptee('https://www.argon-mobility.com', '', $prod);
verifier('production sur production : acceptée', $verdict['acceptee'] === true);
verifierEgal('la décision vient de l\'en-tête Origin', 'origine', $verdict['motif']);

$verdict = origineAcceptee('https://vitrine-staging.argon-mobility.com', '', $staging);
verifier(
    'STAGING sur configuration STAGING : acceptée — c\'est le correctif du 31/08/2026',
    $verdict['acceptee'] === true,
);

$verdict = origineAcceptee('https://vitrine-staging.argon-mobility.com', '', $prod);
verifier(
    'staging sur configuration production : refusée — un autre site ne poste pas ici',
    $verdict['acceptee'] === false,
);

$verdict = origineAcceptee('', 'https://www.argon-mobility.com/demander-une-demo', $prod);
verifier('Origin absent, Referer du site : accepté', $verdict['acceptee'] === true);
verifierEgal('la décision vient du référent', 'referent', $verdict['motif']);

$verdict = origineAcceptee('', 'https://exemple-hostile.invalid/page', $prod);
verifier('Origin absent, Referer étranger : refusé', $verdict['acceptee'] === false);

$verdict = origineAcceptee('', '', $prod);
verifier(
    'les deux en-têtes absents : ACCEPTÉ — une extension de confidentialité les supprime',
    $verdict['acceptee'] === true,
);
verifierEgal('absence signalée comme telle', 'absente', $verdict['motif']);

$verdict = origineAcceptee('https://www.argon-mobility.com.attaquant.invalid', '', $prod);
verifier(
    'domaine qui COMMENCE par le domaine autorisé : refusé (comparaison exacte, pas un préfixe)',
    $verdict['acceptee'] === false,
);

$verdict = origineAcceptee('http://www.argon-mobility.com', '', $prod);
verifier('même hôte en clair : refusé — le schéma fait partie de l\'origine', $verdict['acceptee'] === false);

titre('LE TEST QUI COMPTE : une origine interdite ne produit aucun envoi');

/**
 * Reproduit la décision que prend `demande.php` à l'étape 5, avec des champs
 * parfaitement valides : rien d'autre que l'origine ne peut faire échouer la
 * demande. Si ce test passe au vert alors qu'il ne devrait pas, c'est que le
 * formulaire est de nouveau intestable ailleurs qu'en production.
 */
function decisionOrigine(string $origine, array $autorisees): array
{
    $champs = [
        'nom'        => 'Marc Durand',
        'entreprise' => 'Transports Durand',
        'email'      => 'contact@transports-durand.fr',
        'telephone'  => '06 12 34 56 78',
        'secteur'    => '/secteurs/transport-courses',
    ];

    if (validerChamps($champs) !== []) {
        return ['envoi' => false, 'reponse' => 'erreur', 'motif' => 'champs'];
    }

    $verdict = origineAcceptee($origine, '', $autorisees);
    if (!$verdict['acceptee']) {
        return ['envoi' => false, 'reponse' => 'erreur', 'motif' => 'origine'];
    }

    return ['envoi' => true, 'reponse' => 'succes', 'motif' => ''];
}

$decision = decisionOrigine('https://exemple-hostile.invalid', $prod);
verifier('origine interdite : AUCUN envoi', $decision['envoi'] === false);
verifierEgal('origine interdite : la réponse est une ERREUR', 'erreur', $decision['reponse']);
verifier(
    'origine interdite : la réponse n\'est JAMAIS « succès » — c\'est le défaut du 31/08/2026',
    $decision['reponse'] !== 'succes',
);
verifierEgal('origine interdite : le motif est nommé', 'origine', $decision['motif']);

$decision = decisionOrigine('https://vitrine-staging.argon-mobility.com', $staging);
verifier('staging autorisé sur staging : la demande part', $decision['envoi'] === true);

$decision = decisionOrigine('https://vitrine-staging.argon-mobility.com', $prod);
verifier('staging non autorisé : la demande ne part pas', $decision['envoi'] === false);
verifierEgal('… et le visiteur voit une erreur', 'erreur', $decision['reponse']);

$decision = decisionOrigine('https://www.argon-mobility.com', $prod);
verifier('production : la demande part', $decision['envoi'] === true);
