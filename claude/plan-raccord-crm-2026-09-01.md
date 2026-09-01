# Raccord vitrine → CRM — plan technique

**1ᵉʳ septembre 2026. Rien n'est implémenté : ce document est soumis avant écriture.**
Il fait suite à `claude/etude-raccord-crm-2026-09-01.md` (constat) et applique les quatre
décisions rendues.

---

## 0. Les décisions actées, et ce que la vérification a changé

| | Décision | Conséquence technique |
|---|---|---|
| 1 | **Prospect uniquement**, jamais de fiche client | passage par `ProspectsService`, jamais `ClientsService.create` |
| 2 | **Une soumission = une demande**, clé d'idempotence propre à chaque envoi — pas de déduplication par e-mail | clé générée par la vitrine, unicité tenue par le serveur |
| 3 | **Aucune assignation** | `commercialId` non transmis, fiche non assignée |
| 4 | **Le site doit savoir que l'API a échoué, le visiteur non** | `crm=ok` / `crm=echec` au journal, jamais dans la réponse HTTP au visiteur |

**Ce que la relecture du code a corrigé, et qui rend la décision 1 sans contrepartie.**
Le module `prospects` n'écrit plus dans la table `Prospect` depuis le 26/08/2026 : il fait
`prisma.client.create({ …, stade: 'PROSPECT' })`, **sans poser de `cptCompta`**. Créer un
prospect depuis le site produit donc une vraie fiche du CRM, dans le pipeline, **sans aucune
conséquence comptable**. Il n'y avait pas d'arbitrage à perdre : la décision 1 donne les deux.

---

> ## ✅ TEMPS 1 — ÉCRIT LE 01/09/2026
>
> Le plan ci-dessous a été suivi, avec **trois écarts assumés**, chacun découvert en écrivant :
>
> 1. **`ProspectsRepository` plutôt qu'un `prisma.client.create` propre.** Il prend `companyId`
>    en paramètre — contrairement au service, qui le résout par le contexte de requête qu'un
>    appel de machine n'a pas. On réutilise donc le chemin officiel : stade posé par le
>    repository, cache invalidé, échéances gérées. `ProspectsModule` et `TenantsModule`
>    exportent chacun **leur repository seul** ; exporter `TenantsService` aurait donné au
>    raccord le pouvoir de créer la société éditrice.
> 2. **`200` partout, jamais `201`.** Le corps distingue déjà `creee` de `deja-traitee`, et le
>    site traite les deux comme un succès. Un code différent au rejeu obligerait à expliquer
>    pourquoi, sans que personne n'en fasse rien.
> 3. **Le garde refuse aussi quand la variable est absente**, ce que le plan annonçait — mais
>    il fallait l'écrire : c'est le seul cas où une erreur d'inattention ouvrirait la route à
>    tout l'internet, et le serveur répondrait normalement.
>
> Deux régressions rattrapées par la chaîne, et pas par la relecture :
> un `if (entree.lien)` qui cassait le rétrécissement d'union (le typecheck), et un
> formatage refusé par prettier côté backend (le lint). Elles valent d'être notées : les
> tests, eux, passaient dans les deux cas.

# TEMPS 1 — sans migration

## 1.1 Le chemin, et où il ne faut pas se tromper

```
POST /api/demande.php
   │
   ├─ validation ─── anti-abus ─── (barrières inchangées)
   │
   ├─ MAILJET ────────────────────────────────► ✅ GARANTIE
   │      │                                      c'est lui, et lui seul,
   │      └─ échec ──► erreur visiteur           qui décide de la réponse
   │
   └─ POST http://backend:3000/demandes-site ──► ⚙️ SYNCHRONISATION
          timeout 2 s, réseau Docker privé
          │
          ├─ 2xx ──────────► journal  crm=ok idem=<clé> prospect=<id>
          ├─ 4xx/5xx ──────► journal  crm=echec http=<code> idem=<clé>
          └─ injoignable ──► journal  crm=echec reseau idem=<clé>
                                   │
                                   └─► redirige('succes')   ← inchangé, toujours
```

⚠️ **Trois interdits, qui sont la traduction exacte de la décision 4 :**

1. **L'appel CRM ne peut jamais changer la réponse au visiteur.** Il est placé *après* le
   verdict Mailjet, et sa valeur de retour n'est lue que pour écrire une ligne de journal.
2. **Aucune reprise automatique.** Pas de second appel, pas de second mail, pas de file
   d'attente. Un `crm=echec` se rattrape à la main, avec la clé d'idempotence qui est dans le
   journal — c'est précisément à cela qu'elle sert.
3. **L'absence de configuration n'est pas une panne.** `crmUrl` ou `crmSecret` absents de
   `argon-config.php` ⇒ aucun appel, une ligne `crm=inactif` au premier envoi, et rien d'autre.
   Le paquet doit pouvoir être déployé avant que la clé n'existe sur le serveur — c'est la même
   règle que pour Turnstile.

## 1.2 Contrat de l'endpoint

```
POST http://backend:3000/demandes-site
X-Argon-Secret: <DEMANDES_SITE_SECRET>
Content-Type: application/json
```

```jsonc
{
  "cleIdempotence": "9f2b7c…",          // 32 caractères hexadécimaux, obligatoire
  "envoyeeLe": "2026-09-01T09:14:22Z",  // horloge de la vitrine, informative
  "contact": {
    "nom":        "Marc Durand",
    "entreprise": "Transports Durand",   // obligatoire → raisonSociale
    "email":      "m.durand@transports-durand.fr",
    "telephone":  "06 12 34 56 78",
    "secteur":    "/secteurs/transport-courses",
    "activite":   "Transport & courses"
  },
  "provenance": {
    "url": "/secteurs/transport-courses",
    "titre": "Logiciel de gestion des courses et tournées",
    "source": "www.google.com",
    "campagne": "",
    "simulateur": "gains",
    "resultat": "12 terrains · plan Business · solde + 1 931 €/mois"
  }
}
```

**La clé d'idempotence est dans le CORPS, pas dans un en-tête** — contrairement à l'usage
répandu. Raison : ce dépôt valide *tout* par Zod sur le corps (`ZodValidationPipe`), et une
valeur portée par un en-tête échapperait au schéma, donc à la seule barrière que les
relectures inspectent. Un contrat à un seul endroit vaut mieux qu'un contrat conforme aux
usages et coupé en deux.

### Réponses

| Code | Corps | Quand |
|---|---|---|
| `201` | `{ "statut": "creee", "prospectId": "c…" }` | fiche créée |
| `200` | `{ "statut": "deja-traitee", "prospectId": "c…" }` | clé déjà vue |
| `400` | `{ "statut": "invalide" }` | Zod refuse |
| `401` | *(vide)* | secret faux, absent, ou non configuré côté serveur |
| `429` | *(vide)* | `RateLimitGuard` |

Aucune réponse ne porte de détail technique : la vitrine n'en ferait rien, et cette route est
joignable depuis `api.argon-mobility.com` comme depuis le réseau privé.

## 1.3 Idempotence — Temps 1

La clé est **générée par le PHP**, `bin2hex(random_bytes(16))`, **après le succès Mailjet** et
une seule fois par soumission. Deux demandes légitimes de la même personne portent deux clés :
elles créent deux fiches, comme demandé.

Le seul rejeu possible au Temps 1 est **manuel** : un `crm=echec` par timeout alors que le
backend avait créé la fiche (la réponse s'est perdue, pas l'écriture). Rejouer avec la clé du
journal doit alors répondre `200 deja-traitee`, et ne rien créer.

Mécanisme retenu : `AppCacheService` (Redis, déjà en place), clé `demande-site:<clé>`,
TTL 48 h, valeur = l'identifiant de la fiche.

⚠️ **Sa limite, écrite plutôt que découverte** : `AppCacheService` est *fail-open* — si Redis
est injoignable, il recharge au lieu d'échouer. Un rejeu pendant une panne Redis créerait donc
un doublon. C'est accepté au Temps 1 (deux conditions rares simultanées, et un doublon de fiche
se supprime), et **c'est exactement ce que le Temps 2 supprime** en confiant l'unicité à la
base.

## 1.4 Ce qui est écrit dans la fiche

| Champ de la fiche | Source |
|---|---|
| `raisonSociale` | `contact.entreprise` |
| `contactNom` | `contact.nom` |
| `email`, `telephone` | idem |
| `stade` | `PROSPECT` — posé par le repository, jamais transmis |
| `commercialId` | **absent** (décision 3) |
| `etatProspectId` | absent |
| `commentaire` | bloc de provenance, format stable ci-dessous |
| `companyId` | entreprise plateforme, via `getOrCreateEntreprisePlateforme()` |

```
Demande du site — 01/09/2026 09:14
Page d'origine : Logiciel de gestion des courses et tournées (/secteurs/transport-courses)
Source         : www.google.com
Simulateur     : gains — 12 terrains · plan Business · solde + 1 931 €/mois
Référence      : 9f2b7c…
```

La ligne `Référence` porte la clé d'idempotence : c'est ce qui permettra, au Temps 2, de
rattacher rétroactivement les fiches créées au Temps 1 aux enregistrements `DemandeSite`.

## 1.5 Fichiers — Temps 1

**Vitrine** — 3 modifiés, 1 créé :

| Fichier | Nature |
|---|---|
| `deploy/api/demande.php` | + appel CRM après Mailjet, journalisation `crm=` |
| `deploy/api/demande-controles.php` | + `chargeCrm()` (pure : construit le corps JSON) |
| `deploy/api/config.example.php` | + `crmUrl`, `crmSecret`, documentés |
| `deploy/api/tests/crm-test.php` | **nouveau** |

**Backend** — 4 modifiés, 5 créés :

| Fichier | Nature |
|---|---|
| `packages/schemas/src/demande-site.schema.ts` | **nouveau** — schéma Zod du contrat |
| `packages/schemas/src/index.ts` | + export |
| `backend/src/common/guards/secret-partage.guard.ts` | **nouveau** |
| `backend/src/common/guards/secret-partage.guard.spec.ts` | **nouveau** |
| `backend/src/modules/demandes-site/demandes-site.controller.ts` | **nouveau** |
| `backend/src/modules/demandes-site/demandes-site.service.ts` | **nouveau** |
| `backend/src/modules/demandes-site/demandes-site.service.spec.ts` | **nouveau** |
| `backend/src/modules/demandes-site/demandes-site.module.ts` | **nouveau** |
| `backend/src/app.module.ts` | + enregistrement du module |
| `backend/src/common/guards/routes-publiques.spec.ts` | **+ 14ᵉ entrée, avec sa raison** |
| `backend/.env.example` | + `DEMANDES_SITE_SECRET` |

⚠️ **`routes-publiques.spec.ts` échouera tant que l'entrée ne sera pas ajoutée.** C'est le
comportement voulu du verrou : ne pas l'« arranger », l'utiliser comme relecture obligatoire.

## 1.6 Le garde du secret partagé — trois exigences

1. **Comparaison en temps constant** (`crypto.timingSafeEqual`, longueurs égalisées d'abord) :
   une comparaison naïve laisse deviner le secret caractère par caractère.
2. **Variable absente ⇒ la route REFUSE**, et le crie au démarrage. L'erreur inverse — laisser
   passer quand rien n'est configuré — transformerait un oubli de déploiement en route ouverte.
   C'est la même logique que `NEXT_PUBLIC_SITE_OPEN`, fermé par défaut.
3. **Aucun message distinctif** entre « secret absent », « secret faux » et « en-tête manquant » :
   un 401 nu dans les trois cas.

## 1.7 Tests — Temps 1

**Vitrine** (`deploy/api/tests/crm-test.php`, fonctions pures, aucun réseau) :
- corps JSON conforme au contrat pour une demande complète ;
- provenance vide ⇒ champs vides, jamais de clé absente ;
- clé d'idempotence : 32 hexadécimaux, différente à chaque appel ;
- `crmUrl` absente ⇒ `chargeCrm()` n'est pas construite du tout.

**Backend** :

| Test | Ce qu'il verrouille |
|---|---|
| `secret-partage.guard.spec` — secret juste | 200 |
| — secret faux, en-tête absent, **variable d'env non posée** | 401 dans les trois cas |
| `demandes-site.service.spec` — création | fiche `stade=PROSPECT`, `companyId` = plateforme, `commercialId` **null** |
| — **aucun `cptCompta` n'est consommé** | `NumberingService` jamais appelé |
| — même clé rejouée | une seule fiche, réponse `deja-traitee` |
| — deux clés différentes, même e-mail | **deux fiches** (décision 2) |
| — provenance absente | fiche créée quand même, commentaire sans les lignes vides |
| `routes-publiques.spec` | la 14ᵉ route est déclarée, et elle seule |

---

# TEMPS 2 — la table `DemandeSite`, chantier backend séparé

## 2.1 Modèle proposé

```prisma
/// Une demande venue du site vitrine, telle qu'elle est arrivée.
///
/// Elle EXISTE indépendamment de la fiche qu'elle a produite : c'est ce qui permet de compter
/// les demandes qu'on n'a jamais reprises — le dénominateur sans lequel « CA par intention »
/// n'a pas de sens.
model DemandeSite {
  id             String            @id @default(cuid())
  companyId      String            @map("company_id")

  /// Clé produite par la vitrine, une par soumission. L'unicité est tenue par la BASE :
  /// deux envois de la même clé ne peuvent pas créer deux lignes, même en concurrence.
  cleIdempotence String            @unique @map("cle_idempotence")

  recueLe        DateTime          @default(now()) @map("recue_le")
  envoyeeLe      DateTime?         @map("envoyee_le")

  nom            String?
  entreprise     String
  email          String?
  telephone      String?
  secteur        String?
  activite       String?

  originePage    String?           @map("origine_page")
  origineTitre   String?           @map("origine_titre")
  origineSource  String?           @map("origine_source")
  origineCampagne String?          @map("origine_campagne")
  simulateur     String?
  simulationResume String?         @map("simulation_resume")

  statut         StatutDemandeSite @default(RECUE)
  erreur         String?
  traiteeLe      DateTime?         @map("traitee_le")

  /// La fiche produite. `SetNull` : supprimer une fiche ne doit pas effacer la demande —
  /// sinon on perdrait précisément la trace qu'on cherchait à garder.
  clientId       String?           @map("client_id")

  company        Company           @relation(fields: [companyId], references: [id], onDelete: Cascade)
  client         Client?           @relation(fields: [clientId], references: [id], onDelete: SetNull)

  @@index([companyId, statut])
  @@index([originePage])
  @@map("demandes_site")
}

/// ⚠️ À ne pas confondre avec `StatutDemandeClient`, qui décrit tout autre chose : les
/// commandes clients d'une conciergerie.
enum StatutDemandeSite {
  RECUE          // arrivée, pas encore transformée
  PROSPECT_CREE  // une fiche existe — `clientId` la porte
  DEJA_TRAITEE   // rejeu d'une clé connue, aucune écriture
  ECHEC          // la création a échoué — `erreur` dit pourquoi
  IGNOREE        // écartée à la main (spam, test, doublon manifeste)
}
```

Deux relations à ajouter côté existant : `Company.demandesSite` et `Client.demandesSite` —
Prisma l'exige des deux côtés.

## 2.2 Migration

⚠️ **Écrite à la main**, dans `backend/prisma/migrations/<horodatage>_demandes_site/migration.sql`,
appliquée par **`prisma migrate deploy`**. Jamais `migrate dev` : trois worktrees partagent une
base locale, et `migrate dev` proposerait un `reset`.

Contenu : `CREATE TYPE "StatutDemandeSite"`, `CREATE TABLE "demandes_site"`, l'index unique sur
`cle_idempotence`, les deux index de lecture, les deux clés étrangères. **Aucune colonne
ajoutée à une table existante, aucune donnée touchée** : la migration est purement additive,
donc réversible par un `DROP TABLE` si elle devait l'être.

Après application, et à chaque changement de branche : `npm run schemas:build` **et**
`npm run prisma:generate --workspace=backend`.

## 2.3 Ce que le Temps 2 change dans le service

L'écriture devient : `DemandeSite` d'abord (la trace), puis la fiche, puis
`statut = PROSPECT_CREE` et `clientId`. Sur `P2002` (clé déjà vue), on relit la ligne et on
répond `deja-traitee` — **le même patron que `creerEntreprisePlateforme`**, qui traite déjà un
`P2002` comme « quelqu'un d'autre a réussi », pas comme un échec.

Redis disparaît alors du chemin d'idempotence : la base tranche, et le doublon de panne décrit
au § 1.3 n'est plus possible.

## 2.4 Tests — Temps 2

- deux appels concurrents, même clé ⇒ une ligne, une fiche, deux réponses cohérentes ;
- création de fiche en échec ⇒ `statut = ECHEC`, `erreur` renseignée, **la demande reste** ;
- suppression de la fiche cliente ⇒ la `DemandeSite` survit, `clientId` à `null` ;
- requête d'exploitation : demandes par `originePage`, et parmi elles celles devenues clientes.

---

# 3. Ordre de déploiement

```
0. PRÉCONDITION — créer l'entreprise plateforme (§ 4.2) : espace Super-administrateur,
   rubrique Entreprise plateforme. Un geste, une fois, aucun code.
   Contrôle : SELECT count(*) FROM companies WHERE est_plateforme  →  1

1. BACKEND ensuite — la vitrine tolère son absence, l'inverse n'est pas vrai
   npm ci · npm run check:frontend · check backend · push
2. CI verte (8 jobs)
3. STAGING : gh workflow run deploy.yml --ref master -f environnement=staging -f commit=<sha40>
   poser DEMANDES_SITE_SECRET
   vérifier : sans secret → 401 · avec secret → fiche créée · même clé → 200 deja-traitee
4. PRODUCTION : déploiement manuel, garde-fou-production.sh
   poser DEMANDES_SITE_SECRET
5. VITRINE ensuite : crmUrl + crmSecret dans argon-config.php, puis deploy:ouvrir + scp
6. CONTRÔLE : une vraie demande → mail reçu ET fiche créée
   docker logs argon-vitrine-vitrine-1 | grep "crm="
```

⚠️ **Vitrine en dernier.** L'inverse ne casserait rien pour le visiteur (l'échec est ignoré),
mais produirait des `crm=echec` pendant des jours — et un journal qui crie sans raison finit
par ne plus être lu.

---

# 4. Question tranchée — constat du 01/09/2026

**Le parcours fonctionne de bout en bout. Il lui manque une chose, et ce n'est pas du code.**

## 4.1 Les cinq maillons, vérifiés un par un

| # | Maillon | Constat | Preuve |
|---|---|---|---|
| 1 | **tenant** | Un SUPER_ADMIN sans `?companyId=` est rattaché à **l'entreprise éditrice, toujours** | `tenant.middleware.ts:96` — règle arrêtée après l'audit de sécurité du 20/08/2026 ; `?companyId=` a été retiré et ne doit pas revenir |
| 2 | **permissions (API)** | `if (user.role === 'SUPER_ADMIN') return true;` — accès complet, la fonctionnalité de plan n'est même pas évaluée | `permissions.guard.ts:28` |
| 3 | **périmètre CRM** | SUPER_ADMIN ⇒ `['PROSPECT','QUALIFIE','CLIENT','PERDU']` | `perimetre-crm.guard.ts:62` |
| 4 | **écran (frontend)** | Le menu est filtré par permissions, et `useHasModulePermission` « accorde toujours l'accès à un SUPER_ADMIN sans consulter ses droits effectifs » | test nommé, `useHasModulePermission.test.tsx:41` |
| 5 | **repository** | `PERIMETRE_PROSPECTS = { stade: { in: ['PROSPECT','QUALIFIE'] } }`, et **rien d'autre** : ni commercial, ni état, ni site exigés | `common/clients/perimetre-commercial.ts` |

Une fiche créée par `/demandes-site` — `stade = PROSPECT`, sans commercial, sans état — remonte
donc dans `GET /prospects` et s'affiche à l'écran, sans aucune adaptation.

## 4.2 ⚠️ Le point de rupture : l'entreprise plateforme n'existe pas encore

Interrogation de la base de **production**, en lecture seule, le 01/09/2026 :

```
entreprises_plateforme | super_admins | users_rattaches_plateforme | fiches_plateforme
          0            |      1       |             0              |        0
```

**Il y a bien un SUPER_ADMIN, mais aucune entreprise éditrice.**

⚠️ **Et il n'y a rien d'autre non plus.** Relevé complet de la base `argon` en production, le
01/09/2026 : `users = 1`, `companies = 0`, `clients = 0`, `missions = 0`. **La production du
SaaS est vierge** — elle n'est pas « à compléter d'une étape », elle n'a jamais servi.

⚠️ **Ne pas confondre avec l'environnement local.** L'écran Super-administrateur consulté depuis
le poste affiche 2 entreprises et 29 utilisateurs : ce sont les données **locales**
(PostgreSQL sur `127.0.0.1:5432`, application sur les ports 3000/3001). Créer l'entreprise
plateforme en local **ne crée rien en production**. Le geste est à refaire dans chaque
environnement où le raccord doit fonctionner — local, staging, production.

Or le middleware est explicite, et le frontend le répète :

> « Tant que cette entreprise n'existe pas, le Super-administrateur n'a **AUCUN** contexte
> d'entreprise, donc toutes les requêtes de la fiche échoueraient. » — `useTenants.ts:274`

En l'état, un SUPER_ADMIN qui ouvrirait l'écran Prospects aujourd'hui obtiendrait
`NoTenantContextException`. **Ce n'est pas un défaut du raccord CRM : c'est une étape
d'exploitation qui n'a jamais été faite**, la plateforme n'ayant pas encore eu besoin d'elle.

## 4.2 bis — ✅ FAIT EN PRODUCTION le 01/09/2026

L'entreprise plateforme a été créée depuis l'espace Super-administrateur (badge **ARGON** en
haut à droite → **« Mon entreprise »**, qui appelle `POST /tenants/plateforme` au chargement).

```
name           | est_plateforme | statut | site_par_defaut
Argon Mobility | t              | ACTIF  | Siège
```

Le site par défaut a bien été créé en même temps (`ensureSiteParDefaut`), et le SUPER_ADMIN
dispose désormais d'un contexte d'entreprise : **la précondition de l'étape 0 est levée en
production.**

⚠️ **Elle ne l'est PAS en local ni sur le staging.** Le même geste est à refaire dans chaque
environnement où le raccord doit être exercé. Sans lui, le service répondra
`503 / crm=echec motif=plateforme-absente` — ce qui est le comportement voulu, mais qui ne
prouve rien sur le raccord lui-même.

⚠️ **Le nom est « Argon Mobility »**, posé par la constante serveur. Il ne se change pas depuis
la fiche entreprise — celle-ci édite `EntrepriseInfo` (nom commercial, nom fiscal), pas
`Company.name`. Un vrai renommage passe par l'écran Entreprises (`PATCH /tenants/:id`).

## 4.2 ter — ✅ Le maillon « écran » vérifié EN PRODUCTION, pas seulement dans le code

`https://app.argon-mobility.com/dashboard/prospects` s'ouvre pour le SUPER_ADMIN : tableau
complet, colonnes Agence · Succursale · Mail · Commercial · Contact · État · Prochaine tâche ·
Prochain RDV · Téléphone · **Commentaire**, et « Aucun prospect pour le moment » — cohérent
avec une base vierge.

Deux conséquences pour le chantier :

1. **Une fiche créée par `/demandes-site` sera visible sans aucune adaptation d'écran.** Les
   cinq maillons du § 4.1 sont désormais tous vérifiés *en fonctionnement*, plus seulement par
   lecture du code.
2. **La colonne « Commentaire » est affichée dans la liste elle-même.** C'est là que le Temps 1
   écrit la provenance : page d'origine, source, simulation. Elle sera donc lisible sans ouvrir
   la fiche — ce qui rend le Temps 1 utile tout de suite, sans attendre l'écran dédié du
   Temps 2.

⚠️ **Deux espaces distincts, et aucun lien de l'un vers l'autre.** `/super-admin`
(ARGON CONTROL — supervision des conciergeries clientes) et `/dashboard` (l'application, dans
le contexte de SON entreprise). Le code ne redirige vers `/dashboard` que les rôles **autres**
que SUPER_ADMIN (`app/super-admin/page.tsx:87`) : un SUPER_ADMIN qui veut ses propres données
doit taper l'URL. À savoir avant de conclure qu'un prospect « n'est pas arrivé ».

## 4.3 Le plus petit chantier : aucun code

`POST /tenants/plateforme` est un « récupère ou crée » idempotent, déjà écrit, déjà branché à
l'écran. **Il suffit d'ouvrir une fois l'espace Super-administrateur, rubrique Entreprise
plateforme.** L'entreprise est créée, son site par défaut aussi
(`TenantsRepository.ensureSiteParDefaut`), et les cinq maillons ci-dessus s'enchaînent.

Vérification, en lecture seule, une fois le geste fait :

```bash
ssh root@164.132.76.117 'docker exec -i argon-production-postgres-1 sh -c "psql -U \$POSTGRES_USER -d \$POSTGRES_DB -A -c \"SELECT count(*) FROM companies WHERE est_plateforme\""'
```

Attendu : `1`.

## 4.4 Ce que ce constat change dans le plan

**`/demandes-site` doit LIRE l'entreprise plateforme, jamais la créer.**

Le plan disait `getOrCreateEntreprisePlateforme()`. C'était une erreur : la première demande
d'un visiteur inconnu aurait alors créé l'entité structurante de l'éditeur — la société qui
facture toutes les conciergeries — par un POST public, en silence. Une entité de ce rang naît
d'un geste d'exploitation, pas d'un formulaire.

Le service lira donc `findPlateforme()`. Absente ⇒ **503**, journal
`crm=echec motif=plateforme-absente`, et **le mail a déjà été envoyé** : aucune demande perdue.
Cela devient une **précondition de déploiement**, vérifiable par la requête ci-dessus, et non
une panne à découvrir.

---

# 5. Ancienne question ouverte — conservée pour mémoire

**Qui verra ces fiches ?**

Elles sont créées dans l'**entreprise plateforme** (`estPlateforme = true`). Or cette entreprise
est délibérément **exclue de `TenantsRepository.findAll`** — ce n'est pas une conciergerie
cliente, elle n'a rien à faire dans la liste. Le seul rattachement documenté est celui du
`SUPER_ADMIN` par `TenantMiddleware`.

Il faut donc vérifier — et je ne l'ai pas encore fait — **qu'un SUPER_ADMIN voit bien l'écran
Prospects dans le contexte de l'entreprise plateforme**. Si ce n'est pas le cas, on créerait des
fiches que personne ne regarde : la panne silencieuse que tout ce chantier cherche à éviter.

Trois issues possibles, par ordre de préférence :
1. l'écran existant suffit → rien à faire, on vérifie et on écrit le constat ;
2. il faut un accès explicite → petit chantier frontend, à chiffrer ;
3. rien ne convient → le Temps 2 et son écran « Demandes du site » deviennent le préalable, et
   le Temps 1 se réduit à écrire la trace sans créer de fiche.

**Je propose de trancher cette question avant d'écrire la première ligne du Temps 1.** Elle
décide de son périmètre.
