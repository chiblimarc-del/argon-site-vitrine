> ⚠️ **DOCUMENT ARCHIVÉ — figé au 18/08/2026, conservé pour son historique.**
> Il annonce 16 pages ; le site en compte **20** depuis le 25/08/2026. Il décrit un fil
> d'Ariane et un en-tête retirés depuis. Les décomptes, l'état des chantiers et le tableau
> de bord ci-dessous ne sont plus à jour.
>
> **Le document d'amorçage est [`claude/etat-du-projet.md`](../claude/etat-du-projet.md).**
> Ce qui reste valide ici et ne figure nulle part ailleurs : le détail des six défauts de
> recette du 18/08 (§ 3), les contrôles du formulaire (§ 5 bis) et les scripts
> d'exploitation de `Downloads/` (§ 5 ter).

# Site vitrine Argon — EN LIGNE ET OUVERT AUX MOTEURS (18/08/2026, 16h00)

**https://www.argon-mobility.com** — déployé, fonctionnel, **ouvert à l'indexation depuis le 18/08/2026**.

Les 16 pages de contenu sont indexables ; `/demande-envoyee`, `/mentions-legales`
et `/politique-de-confidentialite` restent en `noindex, follow`, et les seize
duplicatas `.txt` que Next produit à côté des pages sont tenus hors de l'index
par la règle `FilesMatch` du `.htaccess` — vérifié en production le jour de
l'ouverture, c'est elle et elle seule qui les protège désormais.

**Code : https://github.com/chiblimarc-del/argon-site-vitrine** (branche `main`, à jour).
**SaaS : github.com/chiblimarc-del/argon-mobility** (branche `master`, à jour) — pour la configuration Caddy.

⚠️ **Ce fichier vit dans le dépôt (`docs/etat-site-vitrine.md`).** Ne jamais laisser un document de suivi dans l'espace de travail Claude : il est détruit à la fin de la session. C'est ce qui a coûté une reconstitution complète le 18/08 au matin.

## Tableau de bord

| Chantier | État |
|---|---|
| Contenu · SEO · export · formulaire | 🟢 |
| SPF · DKIM Google · DKIM Mailjet · DMARC | 🟢 |
| Les 6 défauts de recette | 🟢 corrigés, poussés, déployés, vérifiés en ligne |
| Formulaire de démonstration | 🟢 testé en production le 18/08 à 09:25 UTC — **mail reçu** |
| `app.` · `api.` · `staging.` · `api.staging.` hors index | 🟢 déployé et vérifié |
| Duplicatas `.txt` | 🟢 couverts avant l'ouverture |
| `og:image` sur les 17 pages | 🟢 |
| Logo officiel | 🟢 en ligne |
| Mentions légales et politique de confidentialité | 🟢 rédigées, publiées, vérifiées en ligne |
| Base légale du formulaire | 🟢 arbitrée : article 6.1.b, mesures précontractuelles |
| Contrôles anti-robot et anti-spam du formulaire | 🟢 quatre contrôles actifs, vérifiés en production |
| Clés Mailjet | 🟢 régénérées le 18/08, testées en production |

---

## 1. Ce qui a été livré le 18/08

Neuf commits sur la vitrine, un sur le SaaS.

| Patch | Objet |
|---|---|
| `0001` | Déploiement VPS + boucle HTTPS + `RewriteEngine On` (défauts 4 et 5) |
| `0002` | Anti-robot : le navigateur mesure une durée, le serveur ne lit plus son horloge (défaut 1) |
| `0003` | Journalisation de tous les chemins (défaut 2) |
| `0004` | `chown 33:33` sur le fichier de clés, documenté (défaut 3) |
| `0005` | Le paquet publie une liste d'inclusions, jamais d'exclusions (défaut 6) |
| `0006` | Logo officiel de la charte à la place de la reconstruction |
| `0007` | `.txt` hors index + `og:image` sur les 17 pages |
| `0008` | Correction : prop `id` oubliée sur six appels à `LogoMark` |
| `0009` | Correction : suffixe `Ref` exigé par `react-hooks/immutability` |
| `0010` | Mentions légales et politique de confidentialité |
| `0011` | Le contrôle de secrets nomme son motif et tolère un cas légitime |
| `0012` | Limitation d'envois, contrôle d'origine, heuristiques, domaines jetables, suggestion d'adresse ; base légale 6.1.b |
| `0013` | Turnstile, et la politique cesse de promettre « aucun tiers » |
| `0014` | Le compteur d'envois choisit un emplacement réellement inscriptible |
| SaaS `26ca85c` | `app.` et `api.` hors index, exploration autorisée |

`0008` et `0009` corrigent des régressions introduites par `0006` et `0002`. Toutes deux ont été arrêtées par `npm run check`, aucune n'a atteint le serveur. Leur cause commune : des correctifs écrits sans que la chaîne d'outils du projet puisse les exécuter.

**Règle qui en découle : ne plus livrer un correctif TypeScript sans l'avoir passé à l'ESLint du projet.** Reconstruire l'environnement (`package.json`, `package-lock.json`, `eslint.config.mjs`, `npm ci --ignore-scripts`) coûte une minute et attrape ce que la relecture ne voit pas.

---

## 2. Architecture en production

```
Internet ──▶ Caddy (80/443) ──┬──▶ frontend:3001   SaaS     app.argon-mobility.com    🔒 noindex
                              ├──▶ backend:3000    API      api.argon-mobility.com    🔒 noindex
                              └──▶ vitrine:80      site     www.argon-mobility.com    🔒 noindex (pré-lancement)
```

- **VPS production** `164.132.76.117` (SSH `root@`) · **staging** `37.187.183.209`
- Pile SaaS : `/home/argon/argon-deploy/` · Vitrine : `/home/argon/vitrine/` (projet Docker **séparé**)
- Bloc Caddy vitrine dans `argon-deploy/conf.d/vitrine-production.caddy`, activé par `import /etc/caddy/conf.d/*.caddy`
- Dépôt vitrine cloné dans `Downloads/argon-site-git` · dépôt SaaS dans `~/argon-ci` (worktree, remote nommé **`github`**, pas `origin`)

### La chaîne de déploiement du SaaS (réparée le 18/08)

Un push sur `master` avec CI verte **déploie le staging automatiquement** — `deploy.yml` est le dernier maillon de `ci.yml`, avec `needs` sur les cinq vérifications. La production reste manuelle :

```bash
gh workflow run deploy.yml -f environnement=production -f commit=<SHA>
```

Le garde-fou refuse tout SHA que le staging n'exécute pas. Il a fonctionné le 18/08 : refus en 7 secondes, aucune image publiée.

`deployer.sh` gère le Caddyfile seul — comparaison d'empreintes md5 puis `docker compose up -d --force-recreate caddy`. **Une recréation, pas un `reload`** : un bind mount de fichier attache l'inode, et `rsync` en crée un nouveau, si bien qu'un `reload` relit l'ancienne configuration en rapportant un succès (panne du 03/08).

⚠️ **Angle mort connu :** aucun `caddy validate` avant la recréation. Une configuration invalide est détectée *après* application, par les sondes publiques — à ce moment-là le service est déjà tombé. Valider avant de pousser.

---

## 3. Les six défauts de recette, et les règles qui en découlent

| Défaut | Conséquence évitée |
|---|---|
| Anti-robot comparant deux horloges | Prospects rejetés en silence (« validé en -941 ms ») |
| Aucune trace sur succès / anti-robot / validation | Panne indiagnosticable |
| Fichier de clés en `chown argon:argon` | Apache (uid 33) ne peut pas le lire → formulaire mort |
| `.htaccess` forçait la redirection https | Boucle infinie derrière le proxy |
| `RewriteEngine On` perdu avec ce bloc | 16 pages sur 17 en 404 |
| `deploy/vps/` publié avec le site | `docker-compose.yml` et la doc téléchargeables |

**Règles à ne jamais réintroduire :**

- Canonisation http→https et apex→www **par Caddy**, jamais par le `.htaccess`.
- Le navigateur transmet une **durée** (`performance.now()`), jamais un horodatage comparé à l'heure du serveur.
- `chown 33:33` sur `argon-config.php`, pas `argon:argon`.
- **Ne jamais supprimer le dossier monté** : `rsync -a --delete` remplace le contenu, le montage reste valide.
- Le paquet publie une **liste d'inclusions** (3 fichiers nommés), jamais une liste d'exclusions.
- Le `<form>` ne doit dépendre d'aucun `useSearchParams` : il disparaîtrait du HTML exporté.
- Un HTTP 200 de Mailjet = **accepté**, pas remis. Toujours vérifier la boîte, et avec une adresse valide.
- Le test du formulaire exige d'**attendre 3 secondes** avant de valider.
- **`Disallow: /` n'est pas un `noindex`.** Il empêche l'exploration, donc la lecture du `noindex`. Pour sortir un hôte de l'index : exploration autorisée + `X-Robots-Tag`.
- Le champ caché du formulaire **ne doit pas porter `defaultValue`** si l'on veut pouvoir relire sa valeur après soumission — React la réécrit au rendu suivant. Sans conséquence sur l'envoi (le navigateur sérialise avant), mais trompeur au diagnostic.

---

## 4. État vérifié en ligne (18/08, 11h30)

**Les 17 pages** : statut 200, canonical correct, `noindex, follow`, un seul `<h1>`, `og:image` **et** `twitter:image`, JSON-LD présent, logo officiel. Aucun titre ni canonical dupliqué. **Zéro anomalie.**

**Étanchéité** : `/api/config.php` et `/api/config.example.php` → 403. `/deploy/vps/*`, `/README.md`, `/MAILJET.md` → 404.

**Sécurité** : 3 en-têtes + HSTS. CSP toujours absente. HTTP/3, TTFB 28 ms, 43 requêtes, **aucun tiers, aucun cookie**.

**Sitemap** : 16 URLs, exactement les 16 routes `indexable: true`.

**Pages légales** : les deux en 200, `noindex, follow`, canonical correct, fil d'Ariane, quatre blocs JSON-LD, absentes du sitemap, liées depuis le pied de page. Identité conforme au Kbis.

**Formulaire, avec les six barrières** : testé le 18/08 à 10:48 UTC. Journal :
une seule ligne, « Demande transmise a Mailjet (HTTP 200) ». Aucune ligne
Turnstile, aucune ligne de compteur, aucune ligne anti-robot — c'est ce silence
qui prouve que les quatre contrôles sont actifs et laissent passer un humain.

**Turnstile en ligne** : script chargé, widget rendu, résolution automatique,
champ `cf-turnstile-response` rempli (794 caractères) et présent dans le
formulaire.

**Formulaire, premier test** : le 18/08 à 09:25 UTC. Journal : « Demande transmise a Mailjet (HTTP 200) », **aucune** ligne anti-robot — la barrière est active et laisse passer un humain. Mail reçu.

---

## 5. Ce qui reste

1. *(Fait le 18/08)* **Base légale du formulaire** : article 6.1.b, mesures
   précontractuelles prises à la demande de la personne. Le motif est inscrit
   en tête de `src/app/politique-de-confidentialite/page.tsx`.

   ⚠️ **Point encore ouvert** : le mécanisme encadrant le transfert vers
   Cloudflare — clauses contractuelles types ou Data Privacy Framework — n'a pas
   pu être vérifié à la source. La politique décrit le fait sans nommer le
   mécanisme. À compléter.

   *(Ancien texte de ce point :)* **Trancher la base légale du formulaire.** L'article 13.1.c du RGPD impose
   de l'indiquer ; la politique publiée décrit ce qui déclenche la collecte
   sans citer d'article, en attendant l'arbitrage. Deux qualifications
   plausibles, documentées en tête de
   `src/app/politique-de-confidentialite/page.tsx` : art. 6.1.b (mesures
   précontractuelles) ou art. 6.1.f (intérêt légitime). Une ligne à changer une
   fois la réponse obtenue. **À faire avant l'ouverture au public**, une
   politique muette sur ce point restant incomplète.

2. *(Fait le 18/08)* **Mentions légales + politique de confidentialité.**
   Éditeur : **Vertus Consulting**, SAS à associé unique, capital 482 500 €, RCS Bordeaux **913 663 571**, siège 76 rue Arago 33300 Bordeaux, président Marc Chibli.
   Hébergeur : OVH SAS, capital 10 174 560 €, RCS Lille Métropole 424 761 419, 2 rue Kellermann 59100 Roubaix.
   **Manque encore** : Kbis à jour (celui fourni date du 27/03/2024), lien juridique entre « Argon Mobility » et Vertus Consulting, durée de conservation des demandes, adresse de contact RGPD, numéro de TVA confirmé.
   ⚠️ L'activité déclarée au Kbis ne mentionne pas l'édition de logiciel — à vérifier avec un comptable avant publication.
   Routes déjà déclarées `published: false` : `/mentions-legales` et `/politique-de-confidentialite`.

3. *(Fait le 18/08)* **Clés Mailjet régénérées** et posées sur le VPS.

   ⚠️ Elles vivent à QUATRE endroits, et la duplication est voulue : secrets
   GitHub du dépôt SaaS (source de vérité, et seul emplacement lisible par la
   veille externe quand les deux VPS sont morts), `.env` de production, `.env`
   de staging — les trois synchronisés par `synchroniser-secrets-mail.sh` — et
   `argon-config.php` de la vitrine, que rien ne synchronise. Une rotation les
   touche tous si la clé est partagée.

4. *(Fait le 18/08)* **Ouverture aux moteurs.** Contrôlé après téléversement :
   16 pages en `index, follow`, 3 en `noindex, follow`, sitemap de 16 URLs
   cohérent avec le registre, canonical corrects, duplicatas `.txt` toujours en
   `noindex`, `robots.txt` sans en-tête et portant la ligne `Sitemap:`.

   ⚠️ **Ne jamais relancer `deploy-argon.sh` après un `deploy:ouvrir`** : il
   reconstruit en mode FERMÉ et ferait retomber le site hors de l'index sans
   rien signaler. Utiliser `televerser.sh`, qui envoie `dist/` tel quel et
   annonce l'état lu dans le `.htaccess` avant d'envoyer.

   *(Ancienne procédure :)* **Ouvrir** : `npm run deploy:ouvrir` → redéployer **tout** (le `.htaccess` change) → soumettre le sitemap en Search Console.
   ⚠️ Vérifier alors que `/index.txt` porte toujours `noindex` et que `/robots.txt` n'en porte plus :
   ```bash
   curl -sI https://www.argon-mobility.com/index.txt  | grep -i x-robots-tag   # noindex, nofollow
   curl -sI https://www.argon-mobility.com/robots.txt | grep -i x-robots-tag   # rien
   ```

5. **SEO V3** — à reprendre seulement après l'ouverture. Point de friction connu : `/` cible « logiciel gestion interventions terrain » et `/solutions/gestion-interventions » « logiciel gestion des interventions ». `seo:check` ne compare que des chaînes exactes et ne peut pas voir ce recouvrement. Search Console tranchera.

6. Durcissement, sans urgence : CSP et Permissions-Policy, `caddy validate` dans `deployer.sh`, authentification sur le staging, posture du `sitemap.xml` en pré-lancement.

---

## 5 bis. Les contrôles du formulaire

Six barrières, dans l'ordre où `demande.php` les applique :

| Contrôle | Comportement au déclenchement |
|---|---|
| Origine / référent étranger | « succès » sans envoi, journalisé |
| Limitation d'envois — 5/h, 15/j | **erreur**, pour qu'un humain le voie et puisse appeler |
| Champ piège | « succès » sans envoi |
| Durée de saisie < 3 s | « succès » sans envoi |
| Turnstile — jeton refusé | **erreur** ; jeton absent → la demande PASSE |
| Lien dans « nom » ou « entreprise » | « succès » sans envoi |
| Messagerie jetable | refus, champ nommé dans le journal |
| Domaine sans MX ni A | **la demande part**, mention portée dans le mail reçu |

Deux principes qui expliquent ces choix :

- **On ne ment jamais à un humain.** Une limite atteinte ou un jeton refusé
  renvoient une erreur, jamais une fausse confirmation. Le champ piège, lui,
  est sans ambiguïté : on n'apprend rien au robot.
- **Un doute ne coûte jamais une demande.** Jeton absent, Cloudflare
  injoignable, DNS muet : la demande passe, et le journal le dit.

**Adresse réelle du visiteur** : lue dans `X-Forwarded-For`, jamais dans
`REMOTE_ADDR`. Derrière Caddy, ce dernier vaut l'adresse du proxy — une
limitation fondée dessus bloquerait tous les visiteurs après cinq envois.

**Suggestion de correction d'adresse** : côté navigateur, distance de deux
caractères au plus sur le domaine. C'est le seul contrôle capable d'attraper
`gamil.com`, qui possède de vrais enregistrements MX et que le DNS déclare donc
valide.

**Clés Turnstile** : la publique est versionnée dans `src/lib/site.ts` — elle
s'affiche de toute façon dans la page, et la mettre dans `.env.local`, ignoré
par Git, ferait qu'un poste qui l'oublie expédierait un build sans widget. La
secrète vit dans `argon-config.php`, avec les identifiants Mailjet.

**Compteur d'envois** : écrit dans le dossier temporaire du conteneur, faute
d'emplacement inscriptible ailleurs — `/var/www` appartient à root et Apache y
tourne sous l'uid 33. Une recréation du conteneur remet le compteur à zéro,
sans conséquence sur une fenêtre de 24 h. Le code prendra automatiquement un
dossier monté en écriture si l'on en ajoute un au `docker-compose`.

---

## 5 ter. Scripts d'exploitation

Dans `Downloads/`, écrits pour ne demander aucun caractère AltGr — le clavier
AZERTY et le collage de Git Bash mangent les `@` et les `~`, ce qui a produit
plusieurs commandes muettes le 18/08.

| Script | Ce qu'il fait |
|---|---|
| `deploy-argon.sh` | applique les correctifs en attente, vérifie, construit, pousse, met en ligne |
| `ssh-argon.sh` | session serveur · `journal` : lignes du formulaire · `menage` : efface les sauvegardes |
| `rotation-mailjet.sh` | envoie et lance la rotation des clés sur le serveur |
| `poser-cles-mailjet.sh` | remplace les deux clés dans `argon-config.php` (tourne SUR le serveur) |
| `poser-cle-turnstile.sh` | pose la clé secrète Turnstile (tourne SUR le serveur) |
| `televerser.sh` | envoie `dist/` **tel quel**, sans reconstruire — à utiliser après `deploy:ouvrir` |
| `commit-etat.sh` | verse ce document dans le dépôt |

Tous suivent la même règle : sauvegarde, écriture **dans** le fichier existant
par redirection — jamais `sed -i`, qui créerait un inode neuf que le conteneur
ne verrait pas —, relecture par le conteneur, restauration si le contrôle
échoue.

`deploy-argon.sh` teste chaque patch **à deux sens** : applicable à l'endroit →
il manque ; applicable à l'envers → déjà là ; ni l'un ni l'autre → appliqué
puis modifié depuis, on passe. Un seul des deux tests suffirait à se tromper.

---

## 6. Mettre à jour le site

```bash
cd ~/Downloads/argon-site-git
npm ci && npm run check && npm run deploy:build
scp -r dist root@164.132.76.117:/tmp/site-neuf
ssh root@164.132.76.117 'rsync -a --delete /tmp/site-neuf/ /home/argon/vitrine/site/ && chown -R argon:argon /home/argon/vitrine/site && rm -rf /tmp/site-neuf'
```

Aucun redémarrage : le conteneur lit les fichiers à chaque requête.

Diagnostic du formulaire :

```bash
ssh root@164.132.76.117 'date -u; docker logs --since 15m argon-vitrine-vitrine-1 2>&1 | grep "demande-demo"'
```

---

## 7. Règles éditoriales verrouillées

- Aucune fonctionnalité, client, témoignage ou chiffre inventé. Aucune donnée fictive, même temporaire.
- Interdits : IA, géolocalisation avancée, optimisation de tournées, stocks, RH, BI, comptabilité, mode hors ligne, signature qualifiée eIDAS, relance automatisée.
- Chaque page dit ce qu'Argon **ne fait pas**.
- `/a-propos` : aucune biographie, date de création, équipe, effectif ou levée de fonds.
- Le logo du site n'affiche **jamais** le baseline « TRANSPORT MANAGEMENT SYSTEM » : le site adresse cinq métiers, pas le seul transport.
