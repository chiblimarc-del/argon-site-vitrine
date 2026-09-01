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

### ⚠️ Une seule ligne à poser sur le staging, sans quoi le test du formulaire ment

Avant tout essai du formulaire sur le staging, `argon-config.php` doit y déclarer **son
propre domaine** :

```php
'origines' => ['https://vitrine-staging.argon-mobility.com'],
```

Sans cette ligne, la liste retombe sur le domaine de production : le staging est alors une
origine étrangère, la demande est **refusée**, et le journal l'écrit
(`resultat=refuse motif=origine`). Depuis le 31/08/2026 le visiteur voit une **erreur** — ce
qui est le comportement voulu — mais aucun mail ne part, et le test ne prouve rien.

⚠️ **Jusqu'au 31/08/2026, ce même cas répondait « succès »** : le testeur voyait la page de
confirmation alors qu'aucun message n'avait été envoyé. Tout test du formulaire mené sur le
staging avant cette date est à refaire.

⚠️ **Ne pas ajouter le staging à la liste de la production** : ce serait autoriser un autre
site à poster sur le formulaire de production.

### Le raccord CRM — deux clés à poser, dans cet ordre

Depuis le 01/09/2026, une demande peut **aussi** devenir une fiche prospect dans Argon. Ce
raccord est facultatif : sans lui, le formulaire fonctionne exactement comme avant.

⚠️ **L'e-mail reste la garantie de livraison.** L'appel à l'API a lieu APRÈS l'envoi Mailjet,
avec deux secondes de patience, et son échec n'est jamais lu autrement que pour écrire une
ligne de journal. Une panne du SaaS ne peut ni perdre une demande, ni afficher une erreur au
visiteur.

**1. Côté backend** — `DEMANDES_SITE_SECRET` dans l'environnement du conteneur.
⚠️ Non posée, la route **refuse tout** : c'est voulu, un oubli de déploiement ferme la route
au lieu de l'ouvrir. Un secret différent par environnement.

**2. Côté site** — deux clés dans `argon-config.php` :

```php
'crmUrl'    => 'http://backend:3000/demandes-site',
'crmSecret' => '<la même valeur que DEMANDES_SITE_SECRET, dans CE serveur>',
```

⚠️ `http://backend:3000` et non une URL publique : les deux conteneurs partagent le réseau
Docker, l'appel **ne sort pas du serveur**. Vérifié le 01/09/2026 —
`docker exec argon-vitrine-vitrine-1 php -r 'file_get_contents("http://backend:3000/health")'`
répond. Aucune route nouvelle n'est exposée sur internet.

**3. Précondition, une seule fois par environnement** — l'entreprise éditrice doit exister,
sinon le service refuse (`crm=echec motif=plateforme-absente`). Elle se crée depuis l'espace
Super-administrateur, badge **ARGON** → **« Mon entreprise »**. Contrôle :

```sql
SELECT count(*) FROM companies WHERE est_plateforme;   -- attendu : 1
```

Ce qu'on lit ensuite dans le journal du conteneur vitrine :

```
crm=ok      statut=creee         la fiche est créée
crm=ok      statut=deja-traitee  rejeu d'une clé connue, aucune fiche de plus
crm=echec   http=… | reseau=…    la fiche manque — l'e-mail, lui, est parti
crm=inactif                      crmUrl/crmSecret absents : aucun appel
```

### La collecte d'audience — un cron, à poser une fois

⚠️ **C'est le geste le plus urgent du lot, et le seul qui ne se rattrape pas.** Les journaux
Docker tiennent environ **2,5 jours** : ce qui n'est pas collecté cette nuit-là est perdu
définitivement. Chaque jour sans cron est un jour absent de l'historique, pour toujours.

⚠️ **Ce serveur n'a pas de `crontab`** — constaté le 01/09/2026. Les tâches périodiques y sont
des **timers systemd** (`argon-factures-recurrentes.timer` existait déjà). Ne pas chercher à
installer cron : suivre la convention de la machine.

```bash
scp deploy/vps/collecte-audience.sh root@164.132.76.117:/home/argon/vitrine/
ssh root@164.132.76.117 'chmod +x /home/argon/vitrine/collecte-audience.sh'
```

Les deux unités `argon-audience-vitrine.{service,timer}` sont posées dans
`/etc/systemd/system/`. Elles reprennent le patron du timer voisin, y compris
`OnFailure=argon-alerte@%n.service` : **un échec de collecte part par mail**, parce qu'il est
irrattrapable passé la rétention. `Persistent=true` rattrape au démarrage si le serveur était
éteint à l'heure dite.

```bash
ssh root@164.132.76.117 'systemctl list-timers argon-audience-vitrine.timer'
ssh root@164.132.76.117 'journalctl -u argon-audience-vitrine.service -n 20 --no-pager'
```

Heure retenue : **03:10 UTC** — après minuit (la veille est complète), avant la sauvegarde de
03:30. Ne pas l'éloigner de minuit : la rétention des journaux ne pardonne pas le retard.

Essai à blanc avant de brancher quoi que ce soit — agrège et affiche, **sans rien envoyer** :

```bash
ssh root@164.132.76.117 '/home/argon/vitrine/collecte-audience.sh --essai'
```

Rattraper un jour manqué (tant qu'il est encore dans le journal) :

```bash
ssh root@164.132.76.117 '/home/argon/vitrine/collecte-audience.sh --jour 2026-09-01'
```

L'envoi est **idempotent** : rejouer un jour écrase son relevé au lieu d'en créer un second.

⚠️ Le script lit le secret dans `crmSecret` d'`argon-config.php` — le même que le raccord CRM,
un seul appelant, un seul secret. Il résout l'adresse du backend à chaque exécution : le
conteneur ne publie aucun port, et son adresse change à chaque redémarrage.

### Ce que le staging permet, et qui manquait

Le formulaire de démonstration et Turnstile ne fonctionnent qu'en ligne, par construction.
C'est ici qu'on les exerce, en attendant **au moins trois secondes** avant de valider —
sinon la barrière anti-robot renvoie un faux succès sans rien envoyer.

Contrôle de ce qui s'est réellement passé, quel que soit ce qu'affiche le navigateur :

```bash
ssh -l argon 37.187.183.209 'docker logs --since 10m argon-vitrine-vitrine-1 2>&1 | grep demande-demo'
```

Une ligne, une demande : `resultat=envoye` (parti), `resultat=refuse` (le visiteur a vu une
erreur), `resultat=silence` (robot écarté, réponse « succès » volontaire). **C'est le seul
décompte fiable** — la page `/demande-envoyee` est aussi servie aux robots piégés.

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
npm run dev          # http://localhost:3002, rechargement à chaud
```

Ne marchent pas en local, et c'est structurel : **le formulaire de démonstration**
(il poste vers `/api/demande.php`, du PHP que `next dev` n'exécute pas) et
**Turnstile** (clé restreinte aux domaines déclarés). Les deux se testent sur
staging, en attendant au moins 3 secondes avant de valider le formulaire — sinon
la barrière anti-robot renvoie un faux succès sans rien envoyer.

En revanche, **les décisions du formulaire se vérifient sans serveur** : origines
autorisées, validation, signaux de robot et provenance sont des fonctions pures,
éprouvées par `npm run test:php`. ⚠️ Ce contrôle **ne tourne pas sur le poste** — il n'y a
ni PHP ni Docker sur la machine de développement. Il s'exécute en CI, à chaque push : ne
pas déployer le formulaire avant que la vérification GitHub soit verte.

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
