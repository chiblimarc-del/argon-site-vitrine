<?php
/**
 * Lanceur de tests du formulaire — sans dépendance, sans PHPUnit.
 *
 *   php deploy/api/tests/lanceur.php
 *
 * Pourquoi pas PHPUnit : le dépôt n'a aucune dépendance PHP, pas de composer,
 * et le serveur n'exécute que deux fichiers. Ajouter un gestionnaire de
 * paquets pour vérifier une centaine d'assertions coûterait plus que ce qu'il
 * rapporte. Ce lanceur tient en cinquante lignes et rend un code de sortie :
 * c'est tout ce que la CI attend de lui.
 *
 * ⚠️ AUCUN TEST NE DOIT TOUCHER AU RÉSEAU. Les fonctions éprouvées ici sont
 * pures : elles décident, elles n'exécutent rien. C'est précisément ce qui
 * permet de vérifier qu'une origine interdite ne produit aucun envoi sans
 * jamais envoyer quoi que ce soit.
 */

declare(strict_types=1);

/** @var array{0: int, 1: int, 2: string[]} */
$compteurs = ['reussis' => 0, 'echoues' => 0, 'messages' => []];

function verifier(string $intitule, bool $condition, string $detail = ''): void
{
    global $compteurs;

    if ($condition) {
        $compteurs['reussis']++;
        return;
    }

    $compteurs['echoues']++;
    $compteurs['messages'][] = $intitule . ($detail === '' ? '' : ' — ' . $detail);
}

/** Compare deux valeurs et rend l'écart lisible en cas d'échec. */
function verifierEgal(string $intitule, mixed $attendu, mixed $obtenu): void
{
    verifier(
        $intitule,
        $attendu === $obtenu,
        'attendu ' . var_export($attendu, true) . ', obtenu ' . var_export($obtenu, true),
    );
}

function titre(string $texte): void
{
    echo "\n" . $texte . "\n" . str_repeat("-", strlen($texte)) . "\n";
}

require_once __DIR__ . '/../demande-controles.php';

foreach (glob(__DIR__ . '/*-test.php') ?: [] as $fichier) {
    require $fichier;
}

echo "\n";
echo str_repeat('=', 60) . "\n";

if ($compteurs['echoues'] === 0) {
    echo sprintf("✅  %d vérifications, aucune en échec.\n", $compteurs['reussis']);
    exit(0);
}

echo sprintf(
    "❌  %d échec(s) sur %d vérifications :\n\n",
    $compteurs['echoues'],
    $compteurs['reussis'] + $compteurs['echoues'],
);
foreach ($compteurs['messages'] as $message) {
    echo '   • ' . $message . "\n";
}
echo "\n";
exit(1);
