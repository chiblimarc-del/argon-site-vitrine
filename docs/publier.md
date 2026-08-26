# Publier le site Argon — la règle

**Établie le 19 août 2026, après le lot « en-tête ». Elle ne se rediscute pas :
elle existe pour qu'on n'ait plus jamais à se demander comment publier.**

---

## Le partage des rôles

**Claude prépare et vérifie. L'humain colle un bloc.** Rien de plus.

À chaque modification, sans qu'on le lui demande, Claude :

1. écrit les fichiers directement dans le dépôt ;
2. vérifie sur un build réel — typecheck, lint, `seo:check`, `next build`, et
   contrôle au navigateur des états concernés ;
3. **fournit le bloc de publication ci-dessous, déjà rempli**, avec la liste
   exacte des fichiers et les messages de commit rédigés ;
4. met à jour la documentation du projet ;
5. contrôle la production une fois le déploiement passé.

---

## ⚠️ Ce que Claude ne peut PAS faire, et pourquoi

Ce n'est pas une réserve de prudence, ce sont trois impossibilités techniques.
Les écrire ici évite de les redécouvrir à chaque fois.

| | |
|---|---|
| **Commiter** | Le montage qui donne à Claude l'accès au disque **interdit la suppression de fichiers**. Git crée un verrou `.git/index.lock` et doit l'effacer en fin d'opération : il ne peut pas. Le verrou reste, et **toutes les commandes git suivantes échouent** sur « Another git process seems to be running ». C'est arrivé une fois, le 19/08/2026. |
| **Pousser** | La session a un accès **lecture seule** au dépôt GitHub. Claude peut lire l'état du dépôt distant, pas y écrire. |
| **Déployer** | Le `scp` exige la clé SSH du VPS, qui vit sur le poste. Et l'environnement qui voit le disque n'a aucun accès réseau. |

### La conséquence, tenue sans exception

> **Claude ne lance JAMAIS de commande git depuis le montage.** Ni `add`, ni
> `commit`, ni même `status` ou `log` — `status` rafraîchit l'index et pose le
> verrou tout autant.

Pour connaître l'état du dépôt, Claude lit les fichiers, ou interroge GitHub.

**Si le verrou apparaît malgré tout**, un seul geste, depuis Git Bash :

```bash
rm -f .git/index.lock
```

Aucun processus git ne tourne réellement — le verrou est périmé.

---

## Le bloc de publication

À coller dans **Git Bash**, à la racine du dépôt. Claude le fournit rempli ;
ce qui suit en est la forme.

```bash
npm run check

git add -- <la liste exacte, fournie par Claude>
git commit -m "<message fourni par Claude>"
git push

npm run deploy:ouvrir
scp -r dist/. root@164.132.76.117:/home/argon/vitrine/site/
```

Un commit par sujet — c'est la granularité du dépôt, et c'est ce qui rend
l'historique lisible : `git log --oneline` doit se lire comme la liste des
défauts corrigés.

---

## Les six règles invariantes

Chacune vient d'un incident réel, pas d'une précaution théorique.

### 1. Jamais `git add -A`

Le dépôt n'a pas de `.gitattributes`. Vu depuis le montage Linux, 88 fichiers
paraissent modifiés alors que seules leurs fins de ligne diffèrent. Un
`git add -A` commiterait des milliers de lignes de bruit. **Toujours la liste
explicite des fichiers.**

### 2. Commiter depuis Windows, jamais depuis le montage

Sur le poste Windows, `core.autocrlf=true` normalise en LF au moment du `add` :
`git status` ne liste que les vraies modifications. Depuis le montage,
`core.autocrlf` n'est pas défini et git prendrait les CRLF tels quels.

**Le contrôle avant tout commit** : `git status --short` doit lister une
vingtaine de fichiers, pas 88. S'il en liste 88, ne rien commiter.

### 3. `deploy:ouvrir`, et JAMAIS `deploy:build` — EN PRODUCTION

La production est **ouverte aux moteurs** (`<meta name="robots" content="index,
follow">`). `npm run deploy:build` produirait le même site en `noindex` et le
**désindexerait en silence**. Les deux paquets sont identiques à cette seule
balise près : rien dans `dist/` ne signale l'erreur, et elle ne se verrait qu'en
Search Console, des semaines plus tard.

Le jour où le site devrait être refermé, ce serait un acte délibéré, jamais un
effet de bord.

⚠️ **Sur le STAGING, c'est l'inverse : `deploy:build` est le paquet qu'il faut.**
Son `noindex` est la seule chose qui empêche le staging de devenir un duplicata
indexé — le bloc Caddy du staging n'en pose aucun. Voir § « Publier sur le staging ».

### 4. `scp -r dist/.` et jamais `dist/*`

`dist/*` est développé par le shell, qui **ignore les fichiers commençant par un
point** : le `.htaccess` racine ne partirait pas. C'est lui qui porte la
réécriture d'URL, les en-têtes de sécurité et les règles de cache.

`dist/.` emporte le contenu du dossier, fichiers cachés compris.

⚠️ La commande donnée dans `deploy/vps/README.md` utilise `dist/*` : elle a ce
défaut, et se contredit deux lignes plus bas. **Cette règle-ci fait foi.**

### 5. Jamais de synchronisation miroir

Copie et écrasement uniquement. Une synchronisation « avec suppression »
effacerait `argon-config.php`, qui contient les clés Mailjet et ne figure
volontairement dans aucun paquet. Le formulaire mourrait en silence : la page
s'afficherait, l'envoi échouerait sans un mot.

### 6. La bonne cible

La production est sur le **VPS derrière Caddy**, pas sur l'hébergement mutualisé
OVH.

```
www.argon-mobility.com  →  164.132.76.117   production
staging.argon-mobility.com →  37.187.183.209   staging
```

⚠️ `deploy/README.md` décrit un dépôt FTP dans `www/` : **c'est l'ancienne
cible**, conservée d'avant la migration. `deploy/vps/README.md` fait foi.

Le conteneur Apache lit les fichiers à chaque requête : **aucun redémarrage
n'est nécessaire**, c'est en ligne dès la fin du `scp`.

---

## Publier sur le staging

**Établi le 26/08/2026**, le jour où l'on a découvert que le staging était accessible depuis
le début — voir l'entrée 7 du registre de dette, et le § 9 du document d'amorçage.

```bash
npm run check
npm run deploy:build
scp -r dist/. argon@37.187.183.209:/home/argon/vitrine/site/
```

Puis, au navigateur : `https://vitrine-staging.argon-mobility.com/`

### Les quatre différences avec la production, et aucune n'est cosmétique

**1. `deploy:build`, pas `deploy:ouvrir`.** La règle n° 3 ci-dessus interdit `deploy:build` —
elle l'interdit **pour la production**, où il désindexerait le site en silence. Sur le
staging, c'est exactement le paquet qu'il faut : il porte le `noindex` de pré-lancement, et
c'est ce qui empêche le staging de devenir un duplicata indexé du site.

⚠️ **Le bloc Caddy du staging ne pose aucun en-tête `noindex`** (`deploy/vps/vitrine-staging.caddy`,
vérifié le 26/08). Le `noindex` du staging vient donc **uniquement du paquet**. Y envoyer un
paquet ouvert publierait vingt pages en double sous un autre domaine, sans que rien ne le
signale.

**2. `argon@`, pas `root@`.** Le compte du staging est `argon`, et la clé par défaut du poste
suffit. `root@` répond `Permission denied (publickey)` — c'est ce refus, pris pour une porte
fermée, qui a fait croire pendant un jour que le staging était inaccessible.

⚠️ `deploy/vps/README.md` § « Étape 2 » écrit `root@` : **c'est faux**, et c'est probablement
l'origine de l'erreur. Cette section-ci fait foi.

**3. Aucun `chown` n'est nécessaire.** `site/` appartient à `argon`, et le `scp` se fait sous
ce compte : les droits sont bons d'office. Sur la production, où le dépôt se fait en `root`,
il en allait autrement.

**4. Ne jamais toucher `argon-config.php`.** Il est déjà sur le staging, en `www-data:www-data`
et mode 600 — soit l'uid 33 attendu par Apache dans le conteneur. Le `scp` ci-dessus ne vise
que `site/` et ne peut pas l'atteindre. La règle n° 5 — jamais de synchronisation miroir —
vaut ici comme en production.

### Ce que le staging permet, et qui manquait

Le formulaire de démonstration et Turnstile ne fonctionnent qu'en ligne, par construction.
C'est ici qu'on les exerce, en attendant **au moins trois secondes** avant de valider —
sinon la barrière anti-robot renvoie un faux succès sans rien envoyer.

C'est aussi ici que se valide tout changement d'en-tête ou de `.htaccess` : la CSP du Lot 10 a
été déployée directement en production faute d'avoir cherché le bon compte. Cela ne doit plus
se reproduire.

### Deux choses à ne pas « corriger » en voyant le staging

- **Les balises canonical y pointent vers `www.argon-mobility.com`.** C'est voulu : le paquet
  est construit pour la production, et un canonical vers le staging serait pire.
- **Le staging peut être en retard de plusieurs lots.** Au 26/08/2026 il servait encore la
  version du 18/08 : `/tarifs` y répondait 404. Un déploiement staging n'est pas automatique —
  c'est le `scp` ci-dessus, et rien d'autre.

---

## Après la mise en ligne

Le HTML est servi en `max-age=0, must-revalidate` et les fichiers versionnés
portent un hash : **le changement est visible immédiatement**, sans risque de
servir l'ancien CSS avec le nouveau HTML. Un `Ctrl+Shift+R` suffit si le
navigateur s'entête.

```bash
curl -I https://www.argon-mobility.com/solutions
```

Attendu : `HTTP/2 200`, **aucun** `x-robots-tag`, et les en-têtes
`x-content-type-options`, `referrer-policy`, `x-frame-options`,
`strict-transport-security`.

Claude prend le relais ici : il contrôle la production depuis le web et signale
tout écart.

---

## Travailler entre deux publications

```bash
npm run dev          # http://localhost:3000, rechargement à chaud
```

Ne marchent pas en local, et c'est structurel : **le formulaire de démonstration**
(il poste vers `/api/demande.php`, du PHP que `next dev` n'exécute pas) et
**Turnstile** (clé restreinte aux domaines déclarés). Les deux se testent sur
staging, en attendant au moins 3 secondes avant de valider le formulaire — sinon
la barrière anti-robot renvoie un faux succès sans rien envoyer.

⚠️ Le site est en **export statique**. Les blocs `redirects()` et `headers()` de
`next.config.ts` sont **silencieusement ignorés** en production : toute règle de
redirection ou d'en-tête se pose dans `deploy/.htaccess`, unique source.

---

## Le raccourci, si on veut aller plus loin

Tout le bloc de publication tient dans un script npm — `npm run publier` — qui
enchaînerait vérification, commit, push, construction et dépôt. C'est faisable ;
ce n'est pas fait, parce qu'un script qui commite tout seul contredirait la
règle n° 1 s'il était écrit sans soin. À décider un jour où on aura le temps de
le faire bien.
