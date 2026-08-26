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
npm run dev        # http://localhost:3000
```

Node ≥ 22.6.

Deux choses **ne marchent pas en local**, et c'est structurel : le formulaire de
démonstration (il poste vers `/api/demande.php`, du PHP que `next dev` n'exécute pas) et le
widget Turnstile (clé restreinte aux domaines déclarés). Les deux se testent en ligne.

---

## Vérifier

```bash
npm run check      # typecheck → lint → seo:check
npm run controle   # contrôle éditorial
```

`npm run check` est un préalable au déploiement, qui échoue sans lui. `seo:check` impose
`title ≤ 60`, `description ≤ 160`, un H1 unique et non vide, un `parent` déclaré, et deux
routes ne peuvent pas partager le même mot-clé.

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
| `deploy/.htaccess` | réécriture d'URL, en-têtes de sécurité, CSP, cache |
| `deploy/api/demande.php` | traitement du formulaire, six barrières anti-robot |

Le dépôt du SaaS est ailleurs : `chiblimarc-del/argon-mobility`, branche `master`.
