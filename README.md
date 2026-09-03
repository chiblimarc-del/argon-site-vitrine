# Site vitrine Argon

Le site public d'**Argon**, logiciel de gestion des interventions terrain.
En ligne sur **https://www.argon-mobility.com** — 20 pages, ouvert à l'indexation depuis le
18 août 2026.

Next.js 16 en **export statique**, servi par Apache derrière Caddy sur un VPS. Aucun
processus Node en production.

---

## Démarrer

```bash
npm ci
npm run dev        # http://localhost:3002
```

Node ≥ 22.6.

`next dev` n'exécute pas de PHP : le formulaire y poste dans le vide. Il s'essaie donc sur un
second serveur, qui sert le site exporté **et** le vrai `deploy/api/demande.php` :

```bash
npm run build && npm run apercu    # http://localhost:3003
```

Exige PHP ≥ 8.3 et une configuration locale — voir
[`docs/publier.md`](docs/publier.md) § « Essayer le formulaire en local ». Le journal du
formulaire s'écrit alors dans `argon-journal.log`, à la racine : c'est lui qui distingue un
succès d'un silence.

Deux choses ne s'y vérifient pas, et là c'est structurel : **l'envoi Mailjet réussi** (il
faudrait les vraies clés — avec de fausses, on vérifie justement que l'échec ne repart jamais
en confirmation) et **le raccord CRM**, dont l'adresse `backend:3000` vit sur le réseau
Docker privé du VPS.

---

## Vérifier

```bash
npm run check      # typecheck → lint → seo:check → tests
npm run controle   # contrôle éditorial
npm run test:php   # tests du formulaire — exige PHP
```

`npm run check` est un préalable au déploiement, qui échoue sans lui. `seo:check` impose
`title ≤ 60`, `description ≤ 160`, un H1 unique et non vide, un `parent` déclaré, et deux
routes ne peuvent pas partager le même mot-clé.

`npm run test:php` éprouve les décisions de `deploy/api/demande-controles.php` — dont celle
qui compte le plus : une origine interdite ne doit produire aucun envoi, et jamais une
confirmation. Ce sont des **fonctions pures**, qui ne touchent jamais au réseau ; le parcours
complet, lui, se joue avec `npm run apercu`. Les mêmes tests tournent **en CI** à chaque
push : **ne pas déployer le formulaire avant que la vérification GitHub soit verte.**

---

## Mesurer

```bash
ssh root@164.132.76.117 'bash -s' < deploy/vps/mesure-vitrine.sh
ssh root@164.132.76.117 'bash -s' < deploy/vps/mesure-vitrine.sh -- --depuis 24h
```

Visiteurs, pages vues, pages d'entrée, référents, 404, robots, et le tableau
**visites → demandes → taux** par page. Lecture seule : le script n'installe rien, ne
modifie ni Caddy ni `argon-deploy`, et efface son dossier de travail en sortant.

⚠️ **La rétention limite la fenêtre.** Les journaux Docker sont plafonnés à 3 × 10 Mo,
partagés avec les trois domaines, et les scans de failles en consomment l'essentiel : le
1ᵉʳ septembre 2026, `--depuis 168h` ne remontait en fait qu'à **2,5 jours**. La période
réellement couverte est affichée en tête du rapport — c'est elle qui fait foi. Pour
comparer deux mois, il faudra archiver les rapports.

---

## Publier

**La règle complète est dans [`docs/publier.md`](docs/publier.md).** En bref, à coller dans
Git Bash à la racine du dépôt :

```bash
npm run check
git add -- <la liste exacte des fichiers>
git commit -m "<message>"
git push
npm run deploy:ouvrir
scp -r dist/. root@164.132.76.117:/home/argon/vitrine/site/
```

⚠️ **`deploy:ouvrir`, jamais `deploy:build`** — le second produit le même site en `noindex`.
⚠️ **`dist/.`, jamais `dist/*`** — le glob perdrait le `.htaccess`.

Le conteneur Apache lit les fichiers à chaque requête : aucun redémarrage, c'est en ligne
dès la fin du `scp`.

---

## Où est quoi

| | |
|---|---|
| `claude/etat-du-projet.md` | **le document d'amorçage — commencer par là** |
| `claude/` | règles, comptes rendus de lot, registre de dette, audits |
| `docs/publier.md` | la règle de publication, dans le détail |
| `src/lib/routes.ts` | le registre : H1, titres, descriptions, sitemap, navigation, maillage |
| `src/lib/tarifs.ts` | source unique des prix, plans et comparatif |
| `src/lib/provenance.ts` | d'où vient le prospect — sans cookie ni stockage |
| `src/lib/simulation.ts` | la simulation emportée depuis `/tarifs`, sur clic explicite |
| `deploy/.htaccess` | réécriture d'URL, en-têtes de sécurité, CSP, cache |
| `deploy/api/demande.php` | traitement du formulaire, six barrières anti-robot, raccord CRM |
| `deploy/api/demande-controles.php` | les décisions du formulaire, en fonctions pures |
| `deploy/api/tests/` | ce qui les met à l'épreuve (`npm run test:php`) |
| `scripts/serveur-local.php` | le serveur qui fait tourner le formulaire en local (`npm run apercu`) |

Le dépôt du SaaS est ailleurs : `chiblimarc-del/argon-mobility`, branche `master`.
