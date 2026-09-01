<?php
/**
 * VALIDATION, SIGNAUX DE ROBOT ET PROVENANCE.
 *
 * Deux exigences se contredisent en apparence et sont toutes deux tenues ici :
 * la validation doit être assez stricte pour qu'une demande inexploitable
 * n'arrive pas, et assez permissive pour ne jamais perdre un vrai prospect.
 * Chaque cas ci-dessous dit laquelle des deux il protège.
 */

declare(strict_types=1);

/** Un jeu de champs valide, dont chaque test ne modifie qu'une valeur. */
function champsValides(array $remplacements = []): array
{
    return array_merge([
        'nom'        => 'Marc Durand',
        'entreprise' => 'Transports Durand',
        'email'      => 'contact@transports-durand.fr',
        'telephone'  => '06 12 34 56 78',
        'secteur'    => '/secteurs/transport-courses',
    ], $remplacements);
}

titre('Validation des champs');

verifierEgal('un jeu complet et correct : aucun refus', [], validerChamps(champsValides()));

verifier('nom d\'une lettre : refusé', validerChamps(champsValides(['nom' => 'M'])) !== []);
verifier('nom de 81 caractères : refusé', validerChamps(champsValides(['nom' => str_repeat('a', 81)])) !== []);
verifier('nom composé accentué : accepté', validerChamps(champsValides(['nom' => 'Léa Ngô-Thérèse'])) === []);

verifier('entreprise vide : refusée', validerChamps(champsValides(['entreprise' => ''])) !== []);
verifier('entreprise avec sigle et points : acceptée', validerChamps(champsValides(['entreprise' => 'S.A.R.L. Durand & Fils'])) === []);

verifier('adresse sans arobase : refusée', validerChamps(champsValides(['email' => 'contact.fr'])) !== []);
verifier('adresse sans point : refusée', validerChamps(champsValides(['email' => 'contact@durand'])) !== []);
verifier('adresse avec sous-domaine : acceptée', validerChamps(champsValides(['email' => 'a.b@mail.durand.co.uk'])) === []);
verifier(
    'adresse grand public : ACCEPTÉE — beaucoup de dirigeants de PME n\'en ont pas d\'autre',
    validerChamps(champsValides(['email' => 'durand.transports@gmail.com'])) === [],
);
verifier('messagerie jetable : refusée', validerChamps(champsValides(['email' => 'a@yopmail.com'])) !== []);
verifier(
    'messagerie jetable en majuscules : refusée aussi',
    validerChamps(champsValides(['email' => 'A@YOPMAIL.COM'])) !== [],
);

verifier('téléphone trop court : refusé', validerChamps(champsValides(['telephone' => '0612'])) !== []);
verifier('téléphone international : accepté', validerChamps(champsValides(['telephone' => '+33 6 12 34 56 78'])) === []);
verifier('téléphone avec points : accepté', validerChamps(champsValides(['telephone' => '06.12.34.56.78'])) === []);
verifier('téléphone avec lettres : refusé', validerChamps(champsValides(['telephone' => '06 12 SOS 78'])) !== []);

verifier('secteur vide : refusé', validerChamps(champsValides(['secteur' => ''])) !== []);
verifier('secteur « autre » : accepté', validerChamps(champsValides(['secteur' => 'autre'])) === []);

titre('Le journal ne recopie aucune donnée personnelle');

$refus = validerChamps(champsValides(['telephone' => '06 99 88 77 66 55 44']));
verifier('un téléphone refusé est signalé', $refus !== []);
verifier(
    'le numéro saisi n\'apparaît PAS dans le motif de refus — un journal se conserve',
    strpos(implode(' ', $refus), '99 88 77') === false,
);

$refus = validerChamps(champsValides(['email' => 'jean.dupont@yopmail.com']));
verifier(
    'seul le DOMAINE jetable est nommé, jamais l\'adresse complète',
    strpos(implode(' ', $refus), 'jean.dupont') === false,
);

titre('Signaux de robot');

verifier('lien http dans le nom : détecté', contientLien('Marc http://spam.example'));
verifier('www. dans l\'entreprise : détecté', contientLien('www.spam.example'));
verifier('balise <a : détectée', contientLien('<a href="x">'));
verifier('nom ordinaire : rien à signaler', contientLien('Marc Durand') === false);
verifier('entreprise avec tiret et point : rien à signaler', contientLien('S.A.R.L. Durand-Fils') === false);

verifierEgal('durée normale : ok', 'ok', verdictDelai(8500.0));
verifierEgal('durée juste au-dessus du seuil : ok', 'ok', verdictDelai(3001.0));
verifierEgal('durée sous le seuil : robot', 'trop-rapide', verdictDelai(900.0));
verifierEgal('durée absente (sans JavaScript) : on ne juge pas', 'absent', verdictDelai(0.0));
verifierEgal('durée négative : aberrante, on ne juge pas', 'aberrant', verdictDelai(-4200.0));
verifierEgal('durée démesurée : aberrante, on ne juge pas', 'aberrant', verdictDelai(90000000.0));

titre('Provenance — ce qui remplit l\'e-mail reçu');

verifierEgal('chemin interne : conservé', '/secteurs/cvc', normaliserCheminOrigine('/secteurs/cvc'));
verifierEgal('racine : conservée', '/', normaliserCheminOrigine('/'));
verifierEgal('URL absolue : rejetée', '', normaliserCheminOrigine('https://exemple.fr/x'));
verifierEgal('chemin sans slash initial : rejeté', '', normaliserCheminOrigine('secteurs/cvc'));
verifierEgal('chemin avec paramètre : rejeté', '', normaliserCheminOrigine('/x?y=1'));
verifierEgal('chemin démesuré : rejeté', '', normaliserCheminOrigine('/' . str_repeat('a', 200)));

verifierEgal('hôte source : conservé', 'www.google.com', normaliserSource('www.google.com'));
verifierEgal('hôte en majuscules : ramené en minuscules', 'google.fr', normaliserSource('GOOGLE.FR'));
verifierEgal('URL complète en source : rejetée', '', normaliserSource('https://www.google.com/search'));
verifierEgal('source vide : vide', '', normaliserSource(''));

verifierEgal(
    'les retours à la ligne sont retirés — une valeur postée ne fabrique pas de fausses lignes',
    'Titre Ligne deux',
    nettoyerTexteLibre("Titre\nLigne deux", 120),
);
verifierEgal('espaces multiples réduits', 'a b', nettoyerTexteLibre("a    b", 120));
verifier(
    'un texte trop long est tronqué',
    longueurTexte(nettoyerTexteLibre(str_repeat('a', 300), 120)) <= 121,
);

titre('Lignes de provenance de l\'e-mail');

$lignes = lignesProvenance([
    'url'      => '/secteurs/cvc',
    'titre'    => 'Logiciel de gestion des interventions CVC',
    'source'   => 'www.google.com',
    'campagne' => '',
]);
$texte = implode("\n", $lignes);
verifier('la page d\'origine est nommée', strpos($texte, 'Logiciel de gestion des interventions CVC') !== false);
verifier('l\'URL est donnée', strpos($texte, '/secteurs/cvc') !== false);
verifier('la source est donnée', strpos($texte, 'www.google.com') !== false);
verifier('aucune ligne de campagne quand il n\'y en a pas', strpos($texte, 'Campagne') === false);

$lignes = lignesProvenance(['url' => '', 'titre' => '', 'source' => '', 'campagne' => '']);
$texte = implode("\n", $lignes);
verifier(
    'provenance inconnue : la ligne est écrite quand même, jamais omise',
    strpos($texte, 'inconnue') !== false,
);
verifier('source inconnue : dite explicitement', strpos($texte, 'accès direct') !== false);

$lignes = lignesProvenance([
    'url'      => '/tarifs',
    'titre'    => '',
    'source'   => '',
    'campagne' => 'utm_source=linkedin utm_campaign=lancement',
]);
$texte = implode("\n", $lignes);
verifier('URL sans titre : l\'URL suffit', strpos($texte, '/tarifs') !== false);
verifier('campagne présente : reportée', strpos($texte, 'utm_source=linkedin') !== false);

titre('La simulation emportée depuis /tarifs');

verifierEgal('identifiant simple : conservé', 'gains', normaliserSimulateur('gains'));
verifierEgal('majuscules : ramenées en minuscules', 'gains', normaliserSimulateur('GAINS'));
verifierEgal('espaces autour : ignorés', 'gains', normaliserSimulateur('  gains  '));
verifierEgal('identifiant avec chiffres ou symboles : rejeté', '', normaliserSimulateur('gains<script>'));
verifierEgal('identifiant démesuré : rejeté', '', normaliserSimulateur(str_repeat('a', 40)));
verifierEgal('vide : vide', '', normaliserSimulateur(''));

$lignes = lignesProvenance([
    'url'        => '/tarifs',
    'titre'      => 'Tarifs Argon',
    'source'     => '',
    'campagne'   => '',
    'simulateur' => 'gains',
    'resultat'   => '12 terrains · plan Business · solde + 1 931 €/mois',
]);
$texte = implode("\n", $lignes);
verifier('le simulateur est nommé', strpos($texte, 'gains') !== false);
verifier('le résultat calculé est reporté', strpos($texte, '1 931') !== false);

$lignes = lignesProvenance([
    'url'      => '/secteurs/cvc',
    'titre'    => 'CVC',
    'source'   => '',
    'campagne' => '',
]);
verifier(
    'aucune ligne « Simulateur » quand le visiteur n\'en a emporté aucune',
    strpos(implode("\n", $lignes), 'Simulateur') === false,
);

$lignes = lignesProvenance([
    'url'        => '/tarifs',
    'titre'      => '',
    'source'     => '',
    'campagne'   => '',
    'simulateur' => 'gains',
    'resultat'   => '',
]);
verifier(
    'simulateur sans résultat : la ligne existe quand même',
    strpos(implode("\n", $lignes), 'Simulateur') !== false,
);

verifierEgal(
    'un résumé multiligne ne peut pas fabriquer de fausses lignes dans le mail',
    'gains truque : Nom Autre chose',
    nettoyerTexteLibre("gains truque : Nom\nAutre chose", 200),
);
