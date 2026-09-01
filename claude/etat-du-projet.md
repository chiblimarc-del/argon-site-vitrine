# Argon — état du projet, à lire en premier

**Mis à jour le 26 août 2026.** Ce fichier est le point d'entrée unique. Il est écrit pour
qu'une session qui l'a lu n'ait plus besoin de poser de questions avant de travailler.
Si vous n'en lisez qu'une chose, lisez le § 1 et le § 3.

---

## 1. En trente secondes

**Argon** est un logiciel de gestion des interventions terrain (SaaS B2B). Deux produits
distincts, deux dépôts distincts :

| | Le **site vitrine** | Le **SaaS** |
|---|---|---|
| Ce que c'est | 20 pages Next.js en export statique | NestJS + Next + Expo, monorepo npm |
| Dépôt GitHub | `chiblimarc-del/argon-site-vitrine`, branche `main` | `chiblimarc-del/argon-mobility`, branche `master` |
| Sur le poste | `~/Downloads/argon-site-git` | `~/Desktop/APPLICATION ARGON/argon-mobility` (+ worktrees) |
| En ligne | `https://www.argon-mobility.com` | `app.` et `api.argon-mobility.com` |
| Doc d'amorçage | **ce fichier** + `claude/` | `CLAUDE.md` → `ENVIRONNEMENTS.md` → `DEPLOYMENT_CHECKLIST.md` |

**Le site vitrine est en ligne, ouvert à l'indexation depuis le 18/08/2026, 20 pages
indexables, sitemap de 20 URL soumis en Search Console le 25/08.**

Éditeur : **Vertus Consulting**, SAS à associé unique, RCS Bordeaux 913 663 571,
76 rue Arago 33300 Bordeaux, président Marc Chibli. Hébergeur : OVH.

---

## 2. Où vivent les documents

C'est la première chose qu'une session se trompe. Il y a **trois** endroits :

1. **`claude/` dans le dépôt vitrine** — treize fichiers sur le poste, mais **deux seulement
   sont versionnés** : `etat-du-projet.md` (ce fichier) et les audits. Ils partent sur GitHub
   parce qu'un dépôt qui ne les porte pas n'apprend rien à la session qui le clone. Les onze
   autres — comptes rendus de lot, règles, registre de dette — sont des **copies locales**,
   maintenues hors de git par `.gitignore`.
2. **Le projet claude.ai « SITE VITRINE ARGON »** — la source de vérité pour ces onze
   documents-là. Une session lancée depuis claude.ai les lit avec l'outil `Projects` ; une
   session qui n'a que le dépôt ne les a pas, et doit les demander.
3. **`docs/` dans le dépôt vitrine** — `etat-site-vitrine.md` (⚠️ figé au 18/08, périmé
   sur les décomptes de pages) et `publier.md` (la règle de publication, toujours valide).

⚠️ **Ne jamais laisser un document de suivi dans l'espace de travail d'une session.** Il est
détruit à la fin. Cette erreur a coûté une reconstitution complète le 18/08 au matin.

---

## 3. Les interdits — chacun vient d'un incident réel

### Git

> **Ne lancer AUCUNE commande git depuis le montage Linux.** Ni `add`, ni `commit`, ni
> même `status` ou `log` : `status` rafraîchit l'index et pose `.git/index.lock`. Le
> montage interdit la suppression de fichiers, donc le verrou reste, et **toutes les
> commandes git suivantes de l'utilisateur échouent** sur « Another git process seems to
> be running ». Arrivé le 19/08/2026, et de nouveau le 26/08/2026.
>
> Pour connaître l'état du dépôt : lire `.git/HEAD`, `.git/refs/heads/*`, `.git/config`
> directement, ou interroger GitHub.
>
> Si le verrou apparaît, depuis **Git Bash** : `rm -f .git/index.lock`

- **Jamais `git add -A`.** Le dépôt n'a pas de `.gitattributes` ; vu du montage Linux,
  88 fichiers paraissent modifiés alors que seules leurs fins de ligne diffèrent. Un
  `add -A` commiterait 5 420 lignes de bruit. **Toujours la liste explicite.**
- **Commiter depuis Windows, jamais depuis le montage** (`core.autocrlf=true` y normalise
  au moment du `add`). Contrôle : `git status --short` doit lister une vingtaine de
  fichiers. S'il en liste 88, ne rien commiter.
- **Un commit par sujet.** `git log --oneline` doit se lire comme la liste des défauts
  corrigés.

### Déploiement

- **En production : `npm run deploy:ouvrir`, JAMAIS `npm run deploy:build`.** Les deux
  paquets sont identiques à une balise près : `deploy:build` produit le site en `noindex` et
  le **désindexerait en silence**. Rien dans `dist/` ne signale l'erreur ; elle ne se verrait
  qu'en Search Console, des semaines plus tard.
- **Sur le staging, c'est l'inverse : `deploy:build` est le paquet qu'il faut**, et son
  `noindex` est la **seule** chose qui empêche le staging de devenir un duplicata indexé —
  le bloc Caddy du staging n'en pose aucun (vérifié le 26/08/2026). Procédure complète :
  `docs/publier.md` § « Publier sur le staging ».
- **`scp -r dist/.` et jamais `dist/*`.** Le glob du shell ignore les fichiers commençant
  par un point : le `.htaccess` racine — réécriture d'URL, en-têtes de sécurité, cache —
  ne partirait pas.
- **Jamais de synchronisation miroir.** Copie et écrasement uniquement : une
  synchronisation « avec suppression » effacerait `argon-config.php` (clés Mailjet,
  volontairement hors paquet) et le formulaire mourrait en silence.
- **Jamais relancer `deploy-argon.sh` après un `deploy:ouvrir`** : il reconstruit en mode
  FERMÉ. Utiliser `televerser.sh`, qui envoie `dist/` tel quel.

### Livraison

- **Ne jamais faire télécharger un fichier à l'utilisateur.** Aucune extension, aucune
  exception : ni `.tsx`, ni `.ts`, ni `.md`, ni `.yml`, ni quoi que ce soit d'autre. Un
  fichier arrive sur le poste de **deux** façons, et de deux seulement :
  1. **Claude l'écrit directement dans le dépôt** par le pont, quand le chemin l'autorise.
     C'est le cas courant, et il n'y a alors rien à livrer du tout.
  2. **Un seul script `poser-<sujet>.txt`**, quand le pont refuse le chemin — et il refuse
     `.github/workflows/`, qui est protégé.

  ⚠️ **Cet interdit a été enfreint quatre fois le 26/08/2026**, le jour même où il a été
  écrit au § 4 de ce fichier. Pourquoi : il y était formulé comme une LISTE d'extensions
  (« ni `.tsx`, ni `.ts`, ni `.md` ») assortie d'une cause (« le navigateur du poste refuse
  ces extensions »). Un `.yml` n'était pas dans la liste, donc la règle semblait ne pas
  s'appliquer. **Une règle écrite en énumération invite à chercher si son cas y figure.**
  Celle-ci est donc écrite en principe : *rien ne se télécharge*.

### Terminal

- **Ne jamais coller une sortie de terminal DANS le terminal.** Règle établie le
  24/08/2026, **après avoir effacé `src/`** : les lignes précédées de `$` ont échoué,
  celles seules sur leur ligne se sont exécutées. Deux fenêtres Git Bash, l'une pour
  `npm run dev` où l'on ne tape rien.

- **Une marche à suivre destinée à un SERVEUR se donne en UNE SEULE commande
  `ssh … '…'`.** Jamais en bloc à coller dans une session SSH ouverte. Règle établie le
  27/08/2026, après que deux blocs — donnés sous le titre « à faire sur le staging », mais
  sans leur ligne `ssh` — ont été exécutés sur le poste Windows : `df` a mesuré le disque
  local, `docker` répondait `command not found`, et le serveur est resté plein. Coût : deux
  exécutions de CI condamnées d'avance.
  *Un bloc qui change de machine en cours de route est un bloc qui sera exécuté sur la
  mauvaise.* Le copier-coller ne retient pas la frontière ; la commande, elle, la porte.

### Acquisition — décision de cadrage du 01/09/2026

> **Aucune fonctionnalité d'acquisition n'est terminée tant qu'elle ne permet pas de mesurer
> son parcours jusqu'au prospect.**
>
> **Et aucun chantier SEO n'est lancé à grande échelle avant que le tunnel visite → prospect
> soit mesurable.**

Ce n'est pas une préférence de méthode, c'est la leçon que paient la plupart des SaaS :
produire beaucoup de contenu, voir le trafic monter, et découvrir six mois plus tard que
rien de tout cela n'a produit un client — sans pouvoir dire quelle page était en cause,
parce que la mesure n'a jamais été posée.

Deux conséquences pratiques, opposables à tout lot futur :

- une page, un formulaire, un simulateur qui ne dit pas d'où vient la personne est **inachevé**,
  quelle qu'en soit la qualité éditoriale ;
- le choix des mots-clés se fera à terme sur le **CA généré par intention**, pas sur le volume
  de recherche. Cela suppose que la chaîne page → demande → opportunité → client porte la
  provenance de bout en bout. Tant qu'elle ne le fait pas, on ne produit pas en masse.

⚠️ Corollaire pour les **pages locales** : *dix excellentes pages valent mieux que trois cents
pages satellites.* Une page ville n'existe que si Argon peut y dire quelque chose de vrai et
de vérifiable sur le territoire — tissu d'entreprises, contraintes de déplacement,
organisation des tournées, cas client local, partenaire réel. Un gabarit où seul le nom de la
ville change n'est pas une ressource, et Google ne le traitera pas comme telle. **Sinon, pas
de page.**

### Contenu

- **Aucune fonctionnalité, client, témoignage ou chiffre inventé.** Aucune donnée fictive,
  même temporaire. Aucune note, aucun avis fabriqué — jamais, sous aucune formulation.
- Mais **une preuve vraie n'est pas une preuve fabriquée** : la règle interdit le faux,
  pas le vrai. C'est ce qui a autorisé le témoignage D-Trans Express (Lot 11).

---

## 4. Ce que Claude peut et ne peut pas faire

**Claude prépare et vérifie. L'humain colle un bloc.** À chaque modification, sans qu'on le
lui demande, Claude : écrit les fichiers dans le dépôt → vérifie sur un build réel →
fournit le bloc de publication déjà rempli → met à jour la documentation → contrôle la
production après déploiement.

| | Pourquoi c'est impossible |
|---|---|
| **Commiter** | le montage interdit la suppression → `.git/index.lock` reste posé |
| **Pousser** | accès **lecture seule** au dépôt GitHub |
| **Déployer** | le `scp` exige la clé SSH du VPS, qui vit sur le poste |

**Le bloc de publication**, à coller dans Git Bash à la racine du dépôt :

```bash
npm run check

git add -- <la liste exacte, fournie par Claude>
git commit -m "<message fourni par Claude>"
git push

npm run deploy:ouvrir
scp -r dist/. root@164.132.76.117:/home/argon/vitrine/site/
```

### La livraison par script `.txt`

Voir l'interdit au § 3 : **rien ne se télécharge**. Quand le pont ne peut pas écrire le
fichier lui-même — chemin protégé, `.github/workflows/` par exemple — la livraison est
**un seul fichier `poser-<sujet>.txt`**, déposé dans le dépôt et lancé depuis sa racine :

```bash
cd /c/Users/Utilisateur/Downloads/argon-site-git && bash _banc/poser-<sujet>.txt
```

Six exigences par script : garde-fou d'emplacement (`if [ ! -f package.json ]`), garde
d'idempotence, sauvegarde `cp "$F" "$F.avant-lot-N"`, heredocs **entre quotes**
(`<<'FIN_DE_FICHIER_ARGON'` — sinon le shell substitue `$`, backticks et accolades du TSX),
contrôle en dernière ligne, test à blanc avant livraison.

⚠️ Le garde d'idempotence ne se contente pas de « le fichier existe » quand le fichier
existe déjà dans une version antérieure : il teste un **marqueur du contenu attendu**,
et sauvegarde avant d'écraser.

---

## 5. La chaîne de vérification, et ses angles morts

```bash
npm run check      # typecheck → lint → seo:check ; le déploiement échoue si l'un tombe
npm run controle   # contrôle éditorial (vocabulaire, formule comptable, légendes)
npm run dev        # http://localhost:3002
```

**Contraintes dures de `seo:check`** : `title ≤ 60`, `description ≤ 160`, H1 non vide et
unique, `parent` déclaré, deux routes ne peuvent pas partager le même `keyword`.

**Ce que `seo:check` ne voit PAS** — il ne lit aucun fichier de page :
- ni le H1 rendu comparé au registre,
- ni l'existence réelle d'une page pour une route déclarée,
- ni deux mots-clés quasi identiques (comparaison de chaînes exactes seulement).

**Ne marchent pas en local, et c'est structurel** : le formulaire de démonstration (il poste
vers `/api/demande.php`, du PHP que `next dev` n'exécute pas) et Turnstile (clé restreinte
aux domaines déclarés). **Ils se testent sur staging** — `vitrine-staging.argon-mobility.com`, `37.187.183.209` :

⚠️ **Avant tout test du formulaire sur le staging, `argon-config.php` doit y déclarer
`'origines' => ['https://vitrine-staging.argon-mobility.com']`.** Sans cette ligne, la
demande est refusée comme venant d'une origine étrangère. Détail : `docs/publier.md`.

⚠️ **Les DÉCISIONS du formulaire, elles, se vérifient sans serveur** : `npm run test:php`
éprouve `deploy/api/demande-controles.php` (origines, validation, signaux de robot,
provenance). Mais **il n'y a ni PHP ni Docker sur le poste** — vérifié le 31/08/2026, WSL
est installé sans distribution. Ces tests tournent **en CI uniquement**. Les tests
TypeScript, eux, tournent partout : `npm test`, inclus dans `npm run check`.

```bash
ssh -l argon 37.187.183.209 ls /home/argon/
```

⚠️ **Le compte est `argon`, jamais `root`**, et la clé par défaut du poste suffit. Le registre
a cru cet accès fermé pendant un jour parce qu'un seul essai avait été fait, avec `root@` :
erreur de diagnostic, levée le 26/08/2026 (registre, entrée 7). Un lot risqué se répète
désormais sur staging **avant** la production.

⚠️ **Le site est en export statique.** Les blocs `redirects()` et `headers()` de
`next.config.ts` sont **silencieusement ignorés** en production : toute règle de redirection
ou d'en-tête se pose dans `deploy/.htaccess`, unique source.

⚠️ **ESLint ne tourne pas dans un délai raisonnable depuis le montage** (> 45 s, le shell
distant est tué avant la fin). Le typecheck (≈ 34 s) et `seo:check` passent. Pour vérifier
le lint depuis une session distante : recopier `src/` + les configs dans l'environnement de
la session, `npm ci --ignore-scripts`, puis `npx eslint`.

⚠️ **Dans le monorepo SaaS, c'est pire : ni `vitest` ni `tsc` ne tournent depuis le montage**
(constaté le 27/08/2026). `node_modules` y est installé depuis Windows, donc
`@rolldown/binding-linux-x64-gnu` est absent et vitest meurt au démarrage sur
`MODULE_NOT_FOUND` ; le node du montage est en **22.23.2** quand le monorepo exige Node 24 ; et
`tsc --noEmit` tournait encore après **dix minutes** sans rien produire, parce qu'il lit les
déclarations de types de `node_modules` à travers un montage réseau. Un `grep -r` sur `app/` +
`components/` d'un worktree froid dépasse lui aussi la limite du shell distant.
**Tout contrôle réel du monorepo se fait sous Windows.** Ce qu'on peut faire depuis le montage :
lire, chercher dans un périmètre restreint, écrire des fichiers, et répliquer un verrou en
Python quand on connaît exactement ce qu'il vérifie.

---

## 6. L'architecture du code vitrine

```
src/lib/routes.ts        LE REGISTRE — source unique des H1, titres, descriptions,
                         du sitemap, de la navigation, du pied de page et du maillage
src/lib/tarifs.ts        source unique des prix, plans, comparatif et remise
src/lib/site.ts          téléphone, espace client, clé publique Turnstile
src/lib/seo.ts           fabriques de metadata et de JSON-LD
src/lib/maillage-metiers.ts   motifs de lien propres à chaque métier
src/lib/provenance.ts    d'où vient le prospect — sans cookie ni stockage
src/lib/simulation.ts    la simulation emportée depuis /tarifs, sur clic explicite
src/lib/simulation.ts    la simulation emportée depuis /tarifs, sur clic explicite
src/app/robots.ts        constante PRODUCTION_HOST
deploy/.htaccess         réécriture, en-têtes de sécurité, CSP, cache — unique source
deploy/api/demande.php   traitement du formulaire : orchestration et effets
deploy/api/demande-controles.php   les décisions, en fonctions pures — testables
deploy/api/tests/        ce qui les éprouve (npm run test:php, en CI)
tests/                   tests TypeScript (npm test, partout)
```

### Les dépendances en cascade du registre — le piège le plus coûteux

- Changer un `path` sans toucher la page **casse le build** (`getRoute` lève).
- Passer une route en `published: false` transforme tous ses liens en `<span>` inertes
  partout, et fait disparaître sa carte de `RelatedPages` **en silence**.
- Cas particulier : passer `/solutions` en non publiée ferait **disparaître le CTA
  secondaire de l'accueil**, sans la moindre erreur.
- Renommer un chemin `/secteurs/*` change la valeur postée par le formulaire de démo, et
  **`deploy/api/demande.php` porte une table codée en dur** (lignes 563-568) que rien ne
  synchronise : l'e-mail reçu afficherait un chemin brut au lieu du métier.

### Règles de code verrouillées

- **La règle de trois** : un bloc de profondeur porte exactement trois preuves. Le tuple
  `TroisPreuves` est typé en longueur trois — une quatrième ligne **ne compile pas**.
- **`Breadcrumbs` et `breadcrumbSchema` vont ensemble, dans les deux sens.** Google interdit
  de baliser un contenu invisible. *(Le composant a été retiré du dépôt ; si un fil d'Ariane
  visible revient, les deux reviennent ensemble.)*
- **Aucun prix en dur nulle part** — tout vient de `tarifs.ts`, le JSON-LD lit la même source.
- **`REDUCTION_ANNUELLE` ne s'applique jamais à `plan.terrain`** ; seule
  `prixAnnuelRegleDavance` est autorisée à l'appliquer.
- **Le H1 vit dans le registre, jamais dans un composant** (`SEGMENT_ACCENTUE` suit).
- **Quatre stations dans `ProfondeurGrid`, jamais cinq. Un seul lien émis par station.**
- **La taille est une variante, jamais une classe passée de l'extérieur** : `cn()` est un
  simple `join`, le projet n'embarque **pas** tailwind-merge.
- **Une URL externe ne va pas dans le registre** — `espaceClient` vit dans `site.ts`, rendu
  par un `<a>` natif, jamais par `NavLink` ni `Button` (tous deux passent par `next/link`).
- **Le téléphone n'est jamais écrit en dur** — `site.phone` / `site.phoneInternational`
  (affiché : 01 85 73 59 41).
- **`.pastille-connexion` est le seul élément animé en boucle du site.**
  `prefers-reduced-motion` coupe l'animation.

---

## 7. Les règles éditoriales

### La mécanique en quatre temps, dans cet ordre et jamais un autre

1. **le bénéfice** — ce que le dirigeant obtient, pas un nom de fonction
2. **le comment** — le mécanisme en clair
3. **ce que ça évite** — la situation concrète qui disparaît
4. **la preuve** — un écran, un document, une trace, une contrainte du produit

*Un bloc qui s'arrête à l'étape 2 est un catalogue. Un bloc qui saute l'étape 1 est une
notice. Une preuve n'est pas une reformulation du bénéfice : si on ne peut rien montrer,
l'étape 4 manque — et il faut le savoir.*

- **Le SEO n'est jamais le centre d'une page.** Le mot-clé oriente titre, description et
  champ lexical ; il ne décide ni du plan, ni de l'angle, ni de la première phrase.
- **Un titre de section est un bénéfice, pas une étiquette.**
- **Les informations produit viennent du dirigeant, pas d'une lecture du code.** Le code
  sert à enrichir et à préciser, jamais à arbitrer si une fonction existe.
- **Chaque page dit ce qu'Argon ne fait pas.** La frontière est obligatoire.
- **Chaque maquette porte sa légende** (« Interface Argon reproduite en code — données
  d'illustration. »).

### Vocabulaire interdit

`API` · `intégration` · `synchronisation` · `connecteur` · `automatiquement` ·
`en temps réel` · `automatiser` · `optimiser` · `FEC` · tout nom de logiciel comptable ·
`écritures` · `partie double` · `rapprochement bancaire` · `export comptable` (dire
**transfert comptable**) · `chantier` (dire **opération**) · `gestion des congés` au sens RH ·
`limite` / `alerte` sur les heures sup (dire **affiche et cumule**) · `Payée` sur
`BillingPanel` (dire **Partiellement réglée**) · `sans engagement` (interdit, et faux depuis
le Lot 5 : engagement 12 mois).

Ces mots restent autorisés **dans une phrase de frontière** (« Argon ne fait pas… ») et dans
une question de FAQ. C'est ce que `npm run controle` distingue.

### Formulations verrouillées mot pour mot

> **Argon ne tient pas votre comptabilité. Il prépare, centralise et alimente les
> informations et documents nécessaires à leur exploitation.**

- H1 de l'accueil : « Saisi une fois. Le devis, le planning, le compte rendu et la facture
  suivent. »
- H1 de CVC : « En pleine saison, chaque urgence **peut** décaler une visite due. » —
  « peut décaler » et non « décale » : on nomme un risque, pas une fatalité.
- Conclusion du simulateur : « Ce calcul ne prouve rien. Il montre l'ordre de grandeur de ce
  que vous perdez aujourd'hui. »
  ⚠️ **Depuis le 01/09/2026, le bloc de résultat porte une suite** : « Regarder d'où
  viendrait ce gain, sur vos propres opérations. » puis le CTA unique. Les deux phrases se
  lisent l'une après l'autre et ne doivent pas se contredire — la seconde ne promet pas le
  gain, elle propose d'en regarder l'origine. Le libellé du bouton reste
  « Demander une démo », comme partout.
  ⚠️ `MENTION_CONFIDENTIALITE` a été **réécrite le même jour**, et il le fallait : elle
  affirmait qu'aucune valeur n'était « envoyée, ni enregistrée, ni transmise », ce que le
  nouveau bloc rendait faux. Elle dit désormais ce qui part, et à quelle condition. Si l'un
  des deux textes change, l'autre change.
- CTA unique sur toutes les pages : « Demander une démo » → `/demander-une-demo`.
- **D-Trans Express** s'écrit en deux mots, orthographe du logo. Ses chiffres restent DANS
  les guillemets, jamais en titre ni en meta. Sur l'accueil et nulle part ailleurs.

### `/tarifs` est la seule exception

Partout ailleurs le site décrit le produit visé. Ici, **une ligne cochée dans une colonne
payante est un engagement contractuel opposable**. Toute ligne ajoutée doit être livrée le
jour où elle s'écrit. Corollaire pour le balisage : le prix servi hors contexte doit porter
sa propre limite (« part plateforme », utilisateurs terrain facturés en sus).

---

## 8. Le déploiement, en pratique

```
Internet ──▶ Caddy (80/443) ──┬──▶ frontend:3001  SaaS     app.argon-mobility.com
                              ├──▶ backend:3000   API      api.argon-mobility.com
                              └──▶ vitrine:80     site     www.argon-mobility.com
```

- Production **164.132.76.117** (SSH `root@`) · staging **37.187.183.209**
- Vitrine : `/home/argon/vitrine/site/` — projet Docker **séparé** de la pile SaaS
- Le conteneur Apache lit les fichiers à chaque requête : **aucun redémarrage**
- `dist/` = `out/` + trois fichiers de `deploy/` : `.htaccess`, `api/.htaccess`,
  `api/demande.php`

Contrôle après mise en ligne :

```bash
curl -I https://www.argon-mobility.com/solutions
```

Attendu : `HTTP/2 200`, **aucun** `x-robots-tag`, et `x-content-type-options`,
`referrer-policy`, `x-frame-options`, `strict-transport-security`, `content-security-policy`.

⚠️ **CORRIGÉ LE 31/08/2026 : `curl` fonctionne depuis le poste Windows.** Ce paragraphe
affirmait le contraire. En-têtes de production, DNS, codes de retour, corps des pages, POST
de contrôle : tout a été lu au `curl` pendant l'audit du 31/08. Le contrôle en ligne n'a donc
plus besoin d'un humain au navigateur. *(Ce qui reste vrai : `curl --http2` échoue, la
version installée ne le porte pas — la version HTTP servie ne se conclut donc pas ici.)*

### Mesurer le trafic — `deploy/vps/mesure-vitrine.sh`

```bash
ssh root@164.132.76.117 'bash -s' < deploy/vps/mesure-vitrine.sh
```

Lecture seule, rien d'installé, dossier de travail effacé en sortie. Sort : période
réellement couverte, volumes, pages les plus vues, pages d'entrée, référents, 404, robots,
et le tableau **visites → demandes → taux** par page.

- **Filtrage à l'analyse sur `request.host`**, décision du 01/09/2026 : Caddy sert les trois
  domaines dans un seul journal, et séparer les fichiers exigerait de toucher à la
  configuration Caddy de la **production du SaaS**. Le gain de propreté ne vaut pas ce
  risque. La séparation reste possible plus tard, comme chantier d'infrastructure à part.
- ⚠️ **La rétention est courte, et plus courte qu'elle n'en a l'air.** Docker plafonne à
  3 × 10 Mo pour les trois domaines, et les **scans de failles** en consomment l'essentiel :
  4 280 requêtes vers `/wp-admin/…` et consorts en 2,5 jours, contre 295 pages vues. Une
  fenêtre de 168 h n'a rendu que **2,5 jours** le 01/09/2026. Toujours lire la période
  affichée en tête, jamais le paramètre demandé.
- ⚠️ **Un « visiteur » est une adresse qui a obtenu au moins une page en 200**, et non toute
  adresse dont l'agent n'est pas reconnu : les scanners se présentent en « Mozilla/5.0 ».
  La première version annonçait 167 visiteurs là où il y en avait 92.
- ⚠️ **Les demandes ne se comptent jamais sur les visites de `/demande-envoyee`** — page
  servie aussi aux robots piégés. Elles se lisent dans le journal du conteneur vitrine.

Première mesure, 29 → 31/08/2026 : 92 visiteurs, 295 pages vues, 137 vues sur l'accueil,
3 à 10 par page profonde, **aucun référent extérieur**, 1 demande. Les robots d'IA passent
plus souvent que Googlebot (GPTBot 96, Applebot 54, PerplexityBot 51, ClaudeBot 39,
Bytespider 42 — Googlebot 17).

### Le formulaire — les barrières, dans l'ordre où `demande.php` les applique

⚠️ **L'ordre et deux comportements ont changé le 31/08/2026.** Le fichier applique désormais :
méthode → configuration → lecture → **validation calculée** → **origine** → anti-abus →
verdict de validation → envoi.

| Contrôle | Au déclenchement |
|---|---|
| Origine / référent non autorisé | **erreur** `motif=origine` — plus jamais un faux succès |
| Limitation d'envois — 5/h, 15/j | **erreur** (pour qu'un humain puisse appeler) |
| Champ piège | « succès » sans envoi |
| Durée de saisie < 3 s | « succès » sans envoi |
| Turnstile — jeton refusé | **erreur** ; jeton **absent** → la demande PASSE |
| Lien dans « nom » ou « entreprise » | « succès » sans envoi |
| Champ invalide / messagerie jetable | **erreur**, champ nommé dans le journal (jamais sa valeur) |
| Domaine sans MX ni A | la demande **part**, mention portée dans le mail |

Deux principes : **on ne ment jamais à un humain** (une limite atteinte renvoie une erreur,
jamais une fausse confirmation) et **un doute ne coûte jamais une demande**.

⚠️ **Les origines autorisées sont déclarées par le SERVEUR**, clé `origines` de
`argon-config.php` — jamais par le paquet, qui est identique sur les deux machines. C'est la
correction du défaut qui rendait tout test du formulaire mensonger sur le staging : l'origine
attendue y était codée en dur sur le domaine de production, et la demande repartait en
« succès » sans qu'aucun mail ne parte. Clé absente ⇒ repli sur la production, journalisé.

⚠️ **Ne jamais compter les demandes sur les visites de `/demande-envoyee`** : cette page est
aussi servie aux robots piégés. Le décompte qui ne ment pas est `resultat=envoye` dans le
journal. Trois résultats possibles : `envoye`, `refuse`, `silence`.

Le mail reçu porte depuis le 31/08/2026 un bloc **provenance** — page d'origine, URL, source,
campagne, date. Il vient de `src/lib/provenance.ts`, qui n'écrit **rien** dans le navigateur :
le chemin précédent vit dans une variable de module. La politique de confidentialité reste
donc exacte, et ne doit pas être modifiée pour ce mécanisme.

- Le navigateur transmet une **durée** (`performance.now()`), jamais un horodatage comparé à
  l'heure du serveur.
- Adresse du visiteur lue dans `X-Forwarded-For`, jamais `REMOTE_ADDR` (derrière Caddy,
  ce dernier vaut l'adresse du proxy).
- `chown 33:33` sur `argon-config.php`, pas `argon:argon` — Apache tourne sous l'uid 33.
- Un HTTP 200 de Mailjet = **accepté**, pas remis. Toujours vérifier la boîte.
- **Attendre 3 secondes** avant de valider lors d'un test.

Diagnostic :

```bash
ssh root@164.132.76.117 'date -u; docker logs --since 15m argon-vitrine-vitrine-1 2>&1 | grep "demande-demo"'
```

---

## 9. Les pièges déjà payés — ne pas les repayer

1. **Compter n'est pas lire.** Une chaîne contenant une URL, un décompte dans du HTML
   hydraté, une sortie tronquée par la largeur du terminal : trois façons de croire qu'on a
   vérifié. **La mesure qui tranche ne passe jamais par l'affichage** (longueur au `awk`,
   empreinte md5). Trois fois la même erreur le même jour, le 25/08.
2. **Une heure perdue sur `src/app/robots.ts`**, dont `PRODUCTION_HOST` *paraissait*
   contenir un lien Markdown. Le fichier était sain depuis le début : c'est le **rendu** qui
   transformait le domaine en lien. Les échecs répétés étaient le signal que la ligne était
   correcte.
3. **Un contrôle qui remonte 80 faux positifs ne sera plus jamais lu.** `FEC` sans limite de
   mot attrapait « affectée / effectif / effet » ; les phrases de frontière étaient comptées
   comme fautes ; les chemins Windows utilisent `\`, si bien que le contrôle des maquettes
   ne testait rien du tout.
4. **`scroll-behavior: smooth` sur `<html>`** faisait défiler la page sous les yeux du
   visiteur. Next émettait l'avertissement dans `npm run dev` **depuis le début**, classé
   comme bruit. *Un avertissement du journal de développement n'est pas du bruit tant qu'on
   ne l'a pas lu.*
5. **`og:image` perdue sur 16 pages** : toute page déclarant son propre bloc `openGraph`
   sans réinjecter `images` perd sa vignette.
6. **404 généralisé sauf l'accueil**, par modification à l'aveugle du `.htaccess` :
   `RewriteEngine On` doit rester dans le bloc « URLs sans extension ». Sans lui, Apache lit
   les `RewriteRule` et n'en applique aucune, **sans le moindre avertissement**.
7. **Le bug des deux menus** ne venait pas du survol mais de `group-focus-within` : après
   navigation client Next, le `<a>` cliqué garde le focus et le panneau reste figé ouvert.
8. **Un `curl` sur la mauvaise adresse de staging** a fait croire à un déploiement raté.
   *Une vérification qui ment est pire qu'une vérification absente.*
9. **Une recherche partielle ne conclut pas sur un ensemble** — « cinq champs inertes »
   alors que la recherche n'avait porté que sur trois.
10. **Un accès déclaré fermé sur la foi d'un seul essai n'est pas un accès fermé, c'est un
    essai.** Le staging du vitrine a été inscrit au registre comme inaccessible le 25/08 après
    un unique `ssh root@…` refusé. Le compte était `argon`. Le 26/08, trois clés ont été
    essayées successivement — toutes refusées, ce qui **renforçait** la conclusion fausse —
    avant que quelqu'un change de compte. ⚠️ **Un échec répété ne confirme rien s'il ne fait
    varier qu'une seule variable** : utilisateur, clé, port, hôte donnent le même
    `Permission denied (publickey)`. Et la réponse était écrite dans `CLAUDE.md` du monorepo
    depuis le 19/08, dans un paragraphe qui racontait déjà la même erreur.
11. **`Disallow: /` n'est pas un `noindex`.** Il empêche l'exploration, donc la lecture du
    `noindex`. Pour sortir un hôte de l'index : exploration autorisée + `X-Robots-Tag`.
12. **Une alerte Search Console n'est un défaut que si la fonctionnalité visée est
    atteignable.** Un champ manquant sur une fonctionnalité inéligible n'est pas un manque,
    c'est un mauvais type. *(Leçon des cinq signalements du 26/08 sur `/tarifs`.)*
13. **Deux projets qui réclament le même port échouent en silence.** Le backend NestJS du
    monorepo écoute sur `process.env.PORT || 3000` et son `.env` ne définit **pas** `PORT` ;
    `npm run dev` du vitrine réclamait lui aussi le 3000. Le second démarré meurt en
    `EADDRINUSE`, noyé dans la sortie de `concurrently` : le frontend répond, le backend est
    mort, et **rien ne le signale**. Le vitrine est donc fixé sur **3002**, le 3000 restant
    au backend où il est câblé une vingtaine de fois dans `frontend-next` et `mobile`.
    ⚠️ `npm start` a suivi le même jour : il sert `dist` sur le **3002** lui aussi. Il
    n'entre plus en conflit avec le backend, et il n'a jamais concerné la production — le
    déploiement force son propre environnement (`scripts/deploy.ts`).
    ⚠️ Deux stacks lancées coup sur coup laissent des doublons
    (`concurrently`, `nest --watch`) qui se disputent le port et le font répondre par
    intermittence — vérifier `netstat -ano` plutôt que la seule page qui s'affiche.
    *(01/09/2026.)*

---

## 10. Le monorepo SaaS — ce qu'il faut savoir avant d'y toucher

- **Node 24** obligatoire. Toujours depuis la **racine** du monorepo — sauf `expo`, qu'il ne
  faut **jamais** lancer depuis la racine.
- La branche principale est **`master`**, pas `main`. Le remote s'appelle **`github`**, pas
  `origin`. `deploiement-prod` existe mais ne sert plus.
- **Cinq copies de travail du même dépôt**, pas cinq clones : le dépôt principal plus quatre
  worktrees. Écrire dans l'une écrit dans le même dépôt. Relevé le 27/08/2026 :

  | Chemin | Branche |
  |---|---|
  | `~/Desktop/APPLICATION ARGON/argon-mobility` | `suivi-depenses` |
  | `~/argon-ci` | `master` |
  | `~/Desktop/APPLICATION ARGON/argon-mobility-creneaux-referentiel` | `creneaux-referentiel` |
  | `~/Desktop/APPLICATION ARGON/argon-mobility-crm` | `crm` |
  | `~/Desktop/APPLICATION ARGON/argon-mobility-mail-suivi-client` | `mail-suivi-client` |

  ⚠️ **Cette liste bouge, et ce fichier a déjà menti dessus** : il en annonçait trois, dont le
  dépôt principal sur `securite-perimetre-super-admin`, jusqu'au 27/08/2026. Ne pas la croire
  sur parole — elle se relit sans lancer git, dans `.git/worktrees/<nom>/HEAD` et
  `.git/worktrees/<nom>/gitdir`.
- ⚠️ **Un worktree qu'on n'a pas préparé soi-même est périmé jusqu'à preuve du contraire.**
  Le 27/08/2026, un `npm run check --workspace=frontend-next` dans `argon-ci` a sorti
  **73 erreurs de typecheck dont aucune n'était dans le code qu'on venait d'écrire** — et
  `eslint .` était passé juste avant. Trois péremptions superposées : `packages/schemas/dist`
  daté de seize jours plus tôt, `node_modules/@tiptap` absent d'une installation jamais
  refaite, et un `.next/` dont les types citaient trois routes supprimées depuis.

  ```bash
  cd ~/argon-ci
  npm ci                      # `ci` n'écrit pas package-lock.json, `install` peut le réécrire
  rm -rf frontend-next/.next
  npm run check:frontend      # = schemas:build PUIS lint + typecheck + test + build
  ```

  ⚠️ **`npm run check:frontend` depuis la racine, jamais `npm run check --workspace=frontend-next`.**
  Appeler le workspace en direct **saute la construction des schémas**, et produit exactement la
  cascade d'erreurs ci-dessus. C'est cette confusion qui a coûté l'aller-retour.
  ⚠️ `npm ci` laisse quatre paquets à scripts non approuvés (`@prisma/engines`, `bcrypt`,
  `prisma`, `unrs-resolver`) : sans effet sur le frontend, à traiter par `npm approve-scripts`
  avant tout travail **backend** depuis ce worktree.

- Après tout changement de branche ou réinstallation : `npm run schemas:build` **et**
  `npm run prisma:generate --workspace=backend`. Ni `packages/schemas/dist/` ni
  `backend/src/generated/prisma/` ne sont versionnés ; sans eux, le build échoue sur des
  imports introuvables.
- **Ne jamais lancer `prisma migrate dev`** : trois worktrees partagent une seule base
  locale sur trois branches ; `migrate dev` propose alors un `reset`. Écrire la migration et
  l'appliquer par `prisma migrate deploy`.
- **`README.md` ne se lit pas** : archive de 14 909 lignes gelée au 12/08/2026, à consulter
  au `Ctrl+F`. Ordre de lecture : `CLAUDE.md` → `ENVIRONNEMENTS.md` →
  `DEPLOYMENT_CHECKLIST.md`. Le journal vivant est `docs/journal/`, un fichier par entrée.
- CI : `ci.yml` (8 jobs) déclenche `deploy.yml` sur `push` vers `master` uniquement, avec un
  `needs` sur **six** jobs (`schemas`, `backend`, `frontend-next`, `e2e`, `mobile`,
  `images`). La production reste **manuelle**, filtrée par
  `.github/scripts/garde-fou-production.sh`, qui refuse tout SHA que le staging n'exécute
  pas.
- ⚠️ `paths-ignore: '**.md'` : un lot de commits purement documentaires **avance `master`
  sans mettre le staging à jour**, et le garde-fou refuse ensuite ce HEAD.
  ⚠️ Et le rattrapage n'est pas celui qu'on croit. `gh workflow run "CI" --ref master` fait
  tourner les six jobs **mais ne déploie rien** : le job `deploy-staging` de `ci.yml` porte
  `if: github.event_name == 'push'`. Or le garde-fou ne lit pas la CI, il lit le SHA que le
  staging exécute. Pour rendre un tel HEAD déployable :
  `gh workflow run deploy.yml --ref master -f environnement=staging -f commit=<sha40>`.
  Constaté le 26/08/2026, après avoir écrit ici l'inverse.
- ⚠️ **`master` est détenu par le worktree `argon-ci`.** `git checkout master` depuis le dépôt
  principal répond `fatal: 'master' is already used by worktree at ...` et **la branche ne
  change pas** — mais les commandes collées à la suite, elles, s'exécutent. Toute opération
  sur `master` se fait depuis `~/argon-ci`.
- ⚠️ **`argon-ci` n'est synchronisé par rien.** Le 26/08 il avait **369 fichiers et six jours
  de retard** sur `master`. C'est pourtant lui qui sert de base aux vérifications : un
  contrôle lancé de là aurait validé un code qui n'est plus celui du dépôt. `git pull github
  master` d'abord, toujours.
- ⚠️ **Aucune approbation humaine n'est possible** sur ce dépôt (dépôt privé, GitHub répond
  422). La documentation l'annonçait à quatre endroits ; c'était faux. Le garde-fou
  mécanique la remplace.
- Une exécution de CI coûte ≈ 30 min sur un quota de 2 000 min/mois, et **un quota épuisé
  arrête aussi les déploiements**.

---

## 11. Ce qui reste ouvert

Voir `claude/registre-dette-technique.md` pour le détail. En résumé, au 26/08/2026 :

| | Sujet | État |
|---|---|---|
| 1 | ~~`deployer.sh` applique la configuration Caddy avant de la valider~~ | ✅ **résolu le 26/08** — `deploy/valider-caddy.sh`, conteneur jetable, banc de 20 contrôles |
| 3 | staging non authentifié | ouvert, sans urgence |
| 4 | `SuiviErreursService` marquait « notifiée » sans regarder `sent` | ✅ **corrigé le 26/08** (`2108974` sur `securite-perimetre-super-admin`), test compris — `npm run check --workspace=backend` vert, 4 073 tests |
| 6 | quatre réglages de l'onglet Comptabilité lus par aucun code | à trancher côté produit |
| 7 | ~~la clé SSH du poste n'est pas autorisée sur le staging~~ | ✅ **erreur de diagnostic, levée le 26/08** — le compte est `argon`, pas `root`. L'accès existait depuis le début |
| 9 | préchargements Next en 404 (`__next.*.txt`) | **laissé délibérément** : la règle `FilesMatch` qui les couvre épargne `robots.txt` par une assertion négative PCRE ; l'altérer rendrait 20 duplicatas `.txt` indexables |

Décisions produit en attente : une **capture réelle du tableau de bord**
(`CAPTURE_TABLEAU_DE_BORD = null` — l'argument le plus distinctif de la page pivot n'a
aucune image) ; la **passe éditoriale en quatre temps sur les pages restantes** ; la revue
Search Console à 2-3 mois sur les recouvrements `transfert-comptable` ↔ `expert-comptable`
et `/` ↔ `/solutions/gestion-interventions` — **ne rien changer avant d'avoir les données**.

---

## 12. L'historique en une table

| Lot | Objet | Date |
|---|---|---|
| 1 | Six blocs de profondeur, aucune URL nouvelle | 18/08 |
| 2 | En-tête : bug des deux panneaux, retrait du fil d'Ariane | 19/08 |
| 3 | `/solutions/transfert-comptable` (17ᵉ page) | 20/08 |
| 4 | `/solutions/heures-et-absences` (18ᵉ page) — 1ʳᵉ page écrite avec la mécanique éditoriale | 20/08 |
| 5 | `/tarifs` (19ᵉ page), `tarifs.ts` source unique | 25/08 |
| 6 | Refonte de l'accueil : H1, `ModulesSection`, `ProfondeurGrid` | 25/08 |
| 7 | Maillage propre à chaque métier (`maillage-metiers.ts`) | 25/08 |
| 8 | Pages solution : `EncoursPanel`, `BillingPanel` prolongé | 25/08 |
| 9 | `/expert-comptable` (20ᵉ page) | 25/08 |
| 10 | CSP + `Permissions-Policy` dans `deploy/.htaccess` | 25/08 |
| 11 | Témoignage D-Trans Express + logo | 25/08 |
| — | Données structurées `/tarifs` : `Product` → `SoftwareApplication` — déployé et vérifié en production, validation Search Console en attente | 26/08 |
