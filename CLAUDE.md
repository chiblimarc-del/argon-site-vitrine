# Site vitrine Argon — à lire avant toute chose

**Le document d'amorçage est [`claude/etat-du-projet.md`](claude/etat-du-projet.md).**
Il répond à tout : ce qu'est le projet, où vivent les fichiers, les règles éditoriales, le
déploiement, les pièges déjà payés. Une session qui l'a lu n'a pas de question à poser.

Ce fichier-ci ne contient que ce qu'il serait trop coûteux d'apprendre trop tard.

---

## Les sept interdits

1. **Ne lancer AUCUNE commande `git` depuis un montage distant** — ni `add`, ni `commit`, ni
   même `status` ou `log`. Le montage interdit la suppression de fichiers : git pose
   `.git/index.lock` et ne peut plus l'effacer, si bien que **toutes les commandes git
   suivantes de l'utilisateur échouent**. Lire `.git/HEAD` et `.git/config` directement.
   Si le verrou apparaît, depuis Git Bash : `rm -f .git/index.lock`

2. **Jamais `git add -A`** — toujours la liste explicite des fichiers. Vu d'un montage
   Linux, 88 fichiers paraissent modifiés alors que seules leurs fins de ligne diffèrent.
   Contrôle avant tout commit : `git status --short` doit lister une vingtaine de fichiers,
   pas 88.

3. **En production : `npm run deploy:ouvrir`, JAMAIS `npm run deploy:build`** —
   `deploy:build` produit le même site en `noindex` et le **désindexerait en silence**. Rien
   dans `dist/` ne signale l'erreur.
   ⚠️ **Sur le staging, c'est l'inverse** : `deploy:build` est le bon paquet, son `noindex`
   étant la seule chose qui empêche le staging d'être indexé. Voir `docs/publier.md`
   § « Publier sur le staging ».

4. **`scp -r dist/.` et jamais `dist/*`** — le glob du shell ignore les fichiers commençant
   par un point, et le `.htaccess` racine ne partirait pas. C'est lui qui porte la
   réécriture d'URL, les en-têtes de sécurité et la CSP.

5. **Jamais de synchronisation miroir** vers le serveur — elle effacerait
   `argon-config.php`, qui porte les clés Mailjet et ne figure volontairement dans aucun
   paquet. Le formulaire mourrait en silence.

6. **Ne jamais coller une sortie de terminal DANS le terminal.** Règle établie après avoir
   effacé `src/` de cette manière, le 24/08/2026.

7. **Rien ne se télécharge.** Claude ne fait jamais télécharger un fichier, quelle qu'en soit
   l'extension. Soit il l'écrit directement dans le dépôt par le pont, soit — si le chemin est
   protégé, comme `.github/workflows/` — il livre **un seul `poser-<sujet>.txt`** à lancer
   depuis la racine. Enfreint quatre fois le 26/08/2026 parce que la règle était écrite en
   liste d'extensions : elle est désormais un principe. Détail au § 3 de
   `claude/etat-du-projet.md`.

---

## Ce que Claude fait, et ne peut pas faire

**Claude écrit les fichiers, vérifie sur un build réel, fournit le bloc de publication déjà
rempli, met à jour la documentation, puis contrôle la production. L'humain colle le bloc.**

Claude ne peut ni **commiter** (le verrou d'index), ni **pousser** (accès GitHub en lecture
seule), ni **déployer** (la clé SSH du VPS vit sur le poste). Ce ne sont pas des réserves de
prudence, ce sont trois impossibilités techniques.

---

## Les commandes

```bash
npm run check      # typecheck → lint → seo:check ; le déploiement échoue si l'un tombe
npm run controle   # contrôle éditorial : vocabulaire, formule comptable, légendes
npm run dev        # http://localhost:3002
npm run apercu     # http://localhost:3003 — le site exporté + le VRAI demande.php
```

`next dev` n'exécute pas de PHP : sur le 3002, le formulaire poste dans le vide. C'est
`npm run apercu` qui l'éprouve, après `npm run build`, sur le fichier réel de `deploy/api/`.
Y sont vérifiables l'origine, la validation, le compteur, le champ piège, le délai — et
surtout qu'un échec ne repart **jamais** en confirmation. Restent hors de portée l'envoi
Mailjet réussi (vraies clés) et le raccord CRM (réseau Docker privé du VPS).

---

## Trois choses à savoir avant d'écrire une ligne

- **`src/lib/routes.ts` est le registre** : source unique des H1, titres, descriptions, du
  sitemap, de la navigation et du maillage. Changer un `path` sans toucher la page casse le
  build ; passer une route en `published: false` transforme tous ses liens en `<span>`
  inertes **en silence**.
- **Le site est en export statique.** Les blocs `redirects()` et `headers()` de
  `next.config.ts` sont **silencieusement ignorés** en production : toute règle de
  redirection ou d'en-tête se pose dans `deploy/.htaccess`, unique source.
- **Aucune fonctionnalité, client, témoignage ou chiffre inventé**, aucune note ni avis
  fabriqués. La liste des mots que le site refuse est au § 7 de `claude/etat-du-projet.md`
  et `npm run controle` la fait respecter.

---

@AGENTS.md
