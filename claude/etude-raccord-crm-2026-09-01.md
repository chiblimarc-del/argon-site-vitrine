# Raccord vitrine → CRM — étude préalable, 1ᵉʳ septembre 2026

**Aucune modification n'a été faite. Aucune migration n'a été lancée.** Ce document est le
livrable demandé avant tout code : ce qui existe, ce qui manque, et ce que coûterait chaque
option.

Périmètre exploré : `~/argon-ci` (worktree sur `master`), backend NestJS, `packages/schemas`,
`backend/prisma/schema.prisma` (6 233 lignes, 111 modèles, 72 enums). Le schéma est **identique
à l'octet près** entre `master` et `suivi-depenses` (md5 `70d6dff4…`) : rien de ce qui suit ne
dépend de la branche.

---

## Le résumé en dix lignes

- **Aucune route réutilisable.** `POST /prospects` existe mais exige un jeton, une permission
  et un contexte d'entreprise qu'un appel machine n'a pas.
- **Aucun mécanisme d'authentification inter-service entrant.** Les clés trouvées
  (Mailjet, Google Maps, Mollie) sont toutes **sortantes**.
- **Aucun champ de provenance dans tout le schéma** : ni `source`, ni `landingPage`, ni `utm*`,
  ni `referrer`, ni `campagne`. Vérifié sur les 6 233 lignes.
- **Mais une bonne nouvelle, testée en réel** : le conteneur vitrine joint déjà le backend sur
  le réseau Docker privé. `http://backend:3000/health` répond depuis le PHP de la vitrine.
  **Aucune URL publique nouvelle n'est nécessaire.**
- **Et un piège**, qui change la recommandation : créer une fiche `Client` — même au stade
  `PROSPECT` — **consomme un numéro de compte comptable** à chaque appel.

---

## 1. Route existante réutilisable — **absence constatée**

| Candidat | Verdict |
|---|---|
| `POST /prospects` | ❌ `@UseGuards(JwtAuthGuard, PermissionsGuard)` + `@RequirePermission('prospects','ecriture','PROSPECTS')`. Le `companyId` vient de `resolveCompanyId(this.prisma)`, alimenté par un `AsyncLocalStorage` que remplit le middleware d'authentification : sans jeton, il lève `NoTenantContextException`. |
| `POST /clients` | ❌ même garde, et l'effet de bord comptable décrit au § 5. |
| Module `demandes-client` | ❌ trompeur : c'est l'écran interne « Mes transports › Commande client », des courses en devenir pour une conciergerie cliente. Rien à voir avec une demande venue du site. |
| Module `opportunites` | ❌ `create()` exige un `clientId` existant et un stade autorisé. |
| Webhook / point d'entrée d'intégration | ❌ aucun. |

**Précédent à connaître, et qui va dans notre sens.** Le 24/08/2026, le projet a explicitement
refusé un webhook pour les encaissements
(`facturation-abonnement/constat-encaissement.service.ts`) :

> « Un webhook exige une URL publique, une route non authentifiée de plus, une vérification de
> signature, et une configuration chez le prestataire refaite pour chaque environnement. »

La différence ici est décisive : **la vitrine et le backend sont sur le même réseau Docker**, il
n'y a donc ni URL publique à ouvrir, ni configuration d'un tiers. Trois des quatre objections
tombent ; la quatrième — une route non authentifiée de plus — est traitée au § 2.

---

## 2. Authentification inter-service — **absence constatée**, mais les briques existent

Recherche sur tout `backend/src` (`x-api-key`, `service-token`, `webhook`, `shared-secret`…) :
**aucune authentification entrante de machine à machine.** Ce qui existe et se réutilise :

**a. `@Public()` et son verrou.** Depuis le 15/08/2026, `AuthentificationRequiseGuard` est en
`APP_GUARD` : **toute route exige un jeton par défaut**. `@Public()` est la seule dérogation, et
`routes-publiques.spec.ts` **fige la liste des treize routes autorisées** — en ajouter une fait
échouer le test tant qu'elle n'y est pas inscrite nommément. Une quatorzième entrée serait donc
une décision écrite, relue, versionnée. C'est exactement le garde-fou qu'il faut.

**b. Un précédent de « barrière par jeton, pas par authentification ».** Deux des treize routes
publiques sont `GET /suivi/:token` : destinées à des clients sans compte, protégées par un jeton
de 24 octets porté par `Mission.lienSuiviToken`. Le modèle est déjà admis dans ce dépôt.

**c. `RateLimitGuard`** (`common/guards/rate-limit.guard.ts`) s'applique à toute l'API et compte
**par IP sur les routes anonymes** — précisément notre cas.

**d. `ConfigModule.forRoot({ isGlobal: true })`** est en place : une variable d'environnement de
plus suit le chemin habituel (`backend/.env.example`, 158 lignes, sert de registre).

**Ce qu'il reste à écrire** : un garde qui compare un en-tête à un secret partagé, en temps
constant, refusant proprement quand la variable est absente — jamais l'inverse.

---

## 3. Le modèle Prisma — état réel

> ## ⚠️ RECTIFICATIF, le 01/09/2026 — lire avant les § 3 et 4
>
> Ce document a d'abord affirmé que le module `prospects` écrivait dans la table `Prospect`, et
> que le chemin « prospect » restait hors du pipeline commercial. **Les deux sont faux**, et la
> vérification qui l'a montré tient en une ligne, en tête de
> `prospects.repository.ts` :
>
> > « Depuis le 26/08/2026, ce repository ne lit plus la table `prospects` mais `clients`,
> > restreinte aux stades PROSPECT et QUALIFIE. »
>
> Trois conséquences, toutes favorables :
>
> 1. **`ProspectsRepository.create()` fait `prisma.client.create({ …, stade: 'PROSPECT' })`.**
>    Créer « un prospect » crée donc bien une fiche du CRM, avec son identifiant définitif.
> 2. **Il ne pose AUCUN `cptCompta`** — vérifié ligne par ligne. Le piège du § 4 ne concerne que
>    `ClientsService.create()`, jamais ce chemin-ci. **Créer un prospect depuis le site
>    n'entraîne aucune conséquence comptable.**
> 3. **Une fiche au stade `PROSPECT` porte des opportunités** : `PerimetreCrmGuard` autorise
>    `PROSPECT` à qui détient la permission `prospects` (ligne 62 et suivantes).
>
> La chaîne complète est donc atteignable sans rien détourner :
> `demande → fiche stade PROSPECT → opportunité → passage en CLIENT (et là seulement, compte
> comptable) → CA`.
>
> Le modèle Prisma `Prospect` reste déclaré dans le schéma mais n'est plus lu par ce module :
> c'est un vestige. **Ne pas y écrire.**

### `Prospect` (le modèle Prisma — vestige, voir le rectificatif ci-dessus)

```prisma
model Prospect {
  id, companyId, raisonSociale, contactNom, email, telephone, telephoneIndicatif,
  adresse, siteId, maisonMereId, commercialId, etatProspectId,
  prochaineTache, prochainRdv, commentaire, createdAt
}
```

Le schéma Zod partagé (`packages/schemas/src/prospect.schema.ts`) expose les mêmes champs.
**Aucun champ de provenance.** Le seul réceptacle libre est `commentaire`.

### ⚠️ `Prospect` n'est PAS l'entité du pipeline commercial

C'est le point qu'il ne faut pas manquer. Le schéma le dit lui-même (ligne 1583) :

> « **Prospect et client ne sont plus deux tables : c'est la MÊME fiche, qui change de stade.**
> L'identifiant ne bouge jamais, si bien que l'historique — activités, contacts, opportunités,
> devis, interventions, factures — reste une seule histoire continue. »

```prisma
enum StadeClient { PROSPECT  QUALIFIE  CLIENT  PERDU }

model Client   { …, stade StadeClient @default(CLIENT), stadeChangeLe, notes, commentaire, cptCompta? @unique, … }
model Opportunite { …, clientId String, etape EtapeOpportunite, … }   // ← exige un Client
enum EtapeOpportunite { NOUVELLE  QUALIFIEE  DEVIS  NEGOCIATION  GAGNEE  PERDUE }
```

Conséquence : **une opportunité se rattache à un `Client`, jamais à un `Prospect`**, et il
n'existe aucune fonction de conversion `Prospect → Client` (recherche faite). Le tunnel
« Prospect → Opportunité » de votre schéma correspond donc, dans le code, à
« `Client` au stade `PROSPECT` → Opportunité ».

### Champs de provenance dans le schéma entier

```
grep -iE "^\s+(source|origine|landing|utm|referrer|canal|provenance|campagne)"  →  1 résultat
```

Et ce résultat est `MailLogPlateforme.canal`, sans rapport. **Il n'existe aucun champ
d'acquisition dans la base, nulle part.**

---

## 4. ⚠️ Le piège : créer un `Client` consomme un compte comptable

`ClientsService.create()` (ligne 208) :

```ts
const cptCompta = await this.numberingService.getNextNumero(companyId, 'CLIENT');
```

**À chaque création, sans condition de stade.** Or `changerStade()` (ligne 260) ne le génère,
lui, que `si stade === 'CLIENT' && !fiche.cptCompta` — le compte comptable est donc conçu pour
naître au passage en client, pas avant.

Créer une fiche `Client` à chaque demande du site consommerait donc un numéro de compte
comptable **par curieux**, y compris pour les demandes jamais rappelées. C'est contraire à la
doctrine écrite dans `Opportunite` :

> « Gagner une affaire ne convertit RIEN. […] un clic commercial ne doit pas entraîner de
> conséquences comptables. »

Une demande venue d'un formulaire public a encore moins de titre à en entraîner.

---

## 5. Proposition minimale — deux temps, et le second est un chantier à part

### Temps 1 — `4a`, sans aucune migration

```
VITRINE ──1──▶ MAILJET            ✅ garantie, inchangée, part la première
   │
   └────2────▶ backend:3000       ⚙️ synchronisation CRM, best-effort
                (réseau Docker privé, jamais internet)
```

- **Le mail part d'abord et décide seul de la réponse au visiteur.** L'appel API vient après,
  avec un `CURLOPT_TIMEOUT` de 2 s, et **son échec n'est jamais lu** : il est journalisé
  (`crm=ok` / `crm=echec`) et rien d'autre. Une panne du SaaS, un backend en cours de
  redéploiement, une base saturée : le prospect est déjà dans la boîte mail.
- Route `POST /demandes-site`, `@Public()`, protégée par : secret partagé
  (`DEMANDES_SITE_SECRET`), `RateLimitGuard`, et validation Zod stricte.
- Elle crée un **`Prospect`** dans l'entreprise plateforme
  (`TenantsService.getOrCreateEntreprisePlateforme()`), **pas un `Client`** — voir § 4.
- La provenance va dans `commentaire`, sous une forme stable et lisible :

```
Demande du site — 01/09/2026 09:14
Page d'origine : Logiciel de gestion des courses et tournées (/secteurs/transport-courses)
Source         : www.google.com
Simulateur     : gains — 12 terrains · plan Business · solde + 1 931 €/mois
```

**Ce que ce temps 1 ne fait pas, et qu'il faut dire** : la provenance n'est pas requêtable, et
elle ne suivra pas automatiquement la fiche si vous reprenez le prospect en client. On saura
lire une demande ; on ne saura pas encore calculer « CA généré par intention ».

### Temps 2 — `4b`, chantier backend séparé, avec migration

C'est lui qui ferme la boucle jusqu'au CA. Deux options, à trancher côté produit :

| | Option **table dédiée** | Option **colonnes sur `Client`** |
|---|---|---|
| Forme | `model DemandeSite { … source, landingPage, utm*, simulateur, resume, traiteeLe, clientId? }` | `Client.acquisitionSource`, `acquisitionPage`, `acquisitionCampagne`, `acquisitionLe` |
| Garde la trace des demandes **jamais reprises** | ✅ | ❌ |
| Permet « CA par page d'origine » en une requête | ✅ (via `clientId`) | ✅ |
| Écran à construire | oui, « Demandes du site » | non |
| Effet sur l'existant | nul, table neuve | ajoute 4 colonnes nullables |

**Recommandation : la table dédiée**, plus une reprise en un clic qui recopie la provenance sur
la fiche créée. C'est le seul montage où une demande sans suite reste mesurable — or c'est
précisément le dénominateur dont vous aurez besoin.

---

## 6. Fichiers qui devront être modifiés

**Vitrine** (2 fichiers, aucun nouveau) :
- `deploy/api/demande.php` — appel best-effort après l'envoi Mailjet ;
- `deploy/api/config.example.php` — `crmUrl`, `crmSecret` (absents ⇒ appel simplement ignoré).

**Backend, temps 1** (6 fichiers, 4 nouveaux) :
- `backend/src/modules/demandes-site/` — `controller`, `service`, `module` (nouveaux) ;
- `backend/src/common/guards/secret-partage.guard.ts` (nouveau) ;
- `packages/schemas/src/demande-site.schema.ts` (nouveau) + son export d'index ;
- `backend/src/app.module.ts` — enregistrement du module ;
- `backend/src/common/guards/routes-publiques.spec.ts` — **14ᵉ entrée, avec sa raison** ;
- `backend/.env.example` — `DEMANDES_SITE_SECRET`.

**Backend, temps 2** : `schema.prisma`, une migration, le module `demandes-site`, un écran
frontend.

---

## 7. Migrations

- **Temps 1 : aucune.** C'est tout son intérêt.
- **Temps 2 : une**, versionnée, appliquée par `prisma migrate deploy`. **Jamais
  `migrate dev`** — trois worktrees partagent une base locale, et `migrate dev` proposerait un
  `reset`. Après tout changement de branche : `npm run schemas:build` **et**
  `npm run prisma:generate --workspace=backend`, sans quoi le build échoue sur des imports
  introuvables.

---

## 8. Tests à ajouter

**Vitrine** (`deploy/api/tests/`) : l'échec du CRM ne change ni la réponse ni le mail ; absence
de `crmUrl` ⇒ aucun appel, aucune erreur ; la charge envoyée contient bien la provenance.

**Backend** :
- `secret-partage.guard.spec.ts` — secret juste/faux/absent/vide ; **variable non posée ⇒ la
  route refuse** (jamais l'inverse) ; comparaison en temps constant ;
- `demandes-site.service.spec.ts` — prospect créé dans l'entreprise plateforme, provenance
  formatée, deux envois du même formulaire ne créent pas deux fiches identiques (idempotence à
  définir : même e-mail sous 24 h ?) ;
- `routes-publiques.spec.ts` — **le test existant tombera tout seul** tant que la route n'est
  pas inscrite. C'est voulu, ne pas l'« arranger » : c'est la relecture obligatoire.

---

## 9. Ordre de déploiement

```
1. Backend d'abord — la vitrine tolère son absence, l'inverse n'est pas vrai
      npm ci  →  npm run check:frontend / check backend  →  push
2. CI verte (8 jobs)
3. Staging : deploy.yml --ref master -f environnement=staging
      poser DEMANDES_SITE_SECRET sur le staging
      vérifier : POST sans secret → 401 ; avec secret → prospect créé
4. Production : déploiement manuel, filtré par garde-fou-production.sh
      (refuse tout SHA que le staging n'exécute pas)
      poser DEMANDES_SITE_SECRET en production
5. Vitrine ensuite : renseigner crmUrl / crmSecret dans argon-config.php,
      puis npm run deploy:ouvrir + scp
6. Contrôle : une demande réelle → mail reçu ET fiche créée
      docker logs argon-vitrine-vitrine-1 | grep "crm="
```

⚠️ **Dans cet ordre et pas un autre.** Vitrine d'abord signifierait des appels vers une route
inexistante : sans conséquence pour le visiteur (l'échec est ignoré), mais des `crm=echec` dans
le journal pendant des jours, qu'on finirait par ne plus lire.

---

## 10. Questions ouvertes, à trancher avant d'écrire

1. **`Prospect` ou `Client` au stade `PROSPECT` ?** Le premier n'a aucun effet de bord mais
   reste hors du pipeline ; le second entre dans le pipeline mais consomme un compte comptable
   par demande (§ 4). Ma recommandation : `Prospect` en temps 1, et laisser la reprise en fiche
   client à l'humain — c'est déjà ce que fait le CRM aujourd'hui.
2. **Idempotence** : deux envois du même formulaire à dix minutes d'intervalle — une fiche ou
   deux ? Le formulaire limite déjà à 5/h par visiteur, mais la question reste.
3. **À qui assigner** ? `commercialId` est pris dans le contexte de la requête, qui sera vide
   pour un appel machine. Fiche non assignée, ou assignée à un utilisateur désigné par
   configuration ?
