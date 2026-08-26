# Déployer le site vitrine sur le VPS, derrière Caddy

Le site vitrine tourne dans **son propre projet Docker**, à côté de la pile du
SaaS. Caddy, déjà en place, lui envoie le trafic de son domaine et gère le
certificat TLS automatiquement.

```
Internet ──▶ Caddy (80/443) ──┬──▶ frontend:3001   (SaaS)
                              ├──▶ backend:3000    (API)
                              └──▶ vitrine:80      (site vitrine)  ← ajout
```

Le SaaS n'est modifié en rien : ni son image, ni sa base, ni ses variables.
Deux lignes sont ajoutées à sa configuration Caddy, c'est tout.

---

## ⚠️ Deux modifications appartiennent au dépôt `argon-deploy`

Elles doivent être faites **dans le dépôt**, pas seulement sur le serveur.
Une modification appliquée à la main sur `/home/argon/argon-deploy/` serait
écrasée au prochain déploiement, et le site vitrine disparaîtrait sans que rien
ne l'explique.

### 1. `Caddyfile` — une ligne, à la fin

```caddy
# Blocs additionnels propres à cet environnement (site vitrine…).
# Un motif qui ne correspond à aucun fichier n'est PAS une erreur pour Caddy :
# un environnement sans conf.d/ ignore simplement cette ligne. C'est ce qui
# permet de garder un seul Caddyfile pour staging et production.
import /etc/caddy/conf.d/*.caddy
```

### 2. `docker-compose.yml` — un volume sur le service `caddy`

```yaml
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - ./conf.d:/etc/caddy/conf.d:ro        # ← ajout
      - caddy_data:/data
      - caddy_config:/config
```

Puis créer le dossier `deploy/conf.d/` avec un `.gitkeep`, pour qu'il existe
dans les deux environnements même vide.

---

## Procédure — STAGING d'abord

### Étape 1 — DNS

Ajouter dans la zone `argon-mobility.com` un enregistrement **A** :

```
vitrine-staging  →  37.187.183.209
```

⚠️ **Avant tout le reste.** Caddy ne peut pas obtenir de certificat pour un
domaine qui ne mène pas encore à lui : la validation ACME échoue, et Caddy
réessaie en boucle en consommant le quota Let's Encrypt.

Vérifier avant de continuer :

```bash
dig +short vitrine-staging.argon-mobility.com    # doit renvoyer 37.187.183.209
```

### Étape 2 — Déposer le site sur le serveur de staging

> ⚠️ **Corrigé le 26/08/2026 : le compte est `argon`, jamais `root`.**
> Cette section écrivait `root@37.187.183.209`. Ce refus, pris pour une porte fermée,
> a fait inscrire au registre de dette une entrée 7 « le staging est hors d'atteinte »
> qui était fausse, et a fait valider la CSP du Lot 10 directement en production.
> La clé par défaut du poste suffit ; aucun `-i` n'est nécessaire.

Depuis votre poste, dans le dossier du projet vitrine :

```bash
scp -r dist/          argon@37.187.183.209:/home/argon/vitrine/site
scp deploy/vps/docker-compose.yml argon@37.187.183.209:/home/argon/vitrine/
scp deploy/vps/apache-vitrine.conf argon@37.187.183.209:/home/argon/vitrine/
scp argon-config.php  argon@37.187.183.209:/home/argon/vitrine/
scp deploy/vps/vitrine-staging.caddy argon@37.187.183.209:/home/argon/argon-deploy/conf.d/
```

⚠️ `argon-config.php` contient les clés Mailjet. Il est déposé dans
`/home/argon/vitrine/`, **jamais** dans `site/` : le conteneur le monte hors de
la racine web, donc aucune URL ne peut y mener.

#### Droits du fichier de clés : `chown 33:33`, pas `argon:argon`

Sur le serveur, immédiatement après le `scp` :

```bash
chown 33:33 /home/argon/vitrine/argon-config.php
chmod 600   /home/argon/vitrine/argon-config.php
```

⚠️ **Le propriétaire n'est pas `argon`.** Le fichier n'est pas lu par un compte
du serveur mais par Apache **à l'intérieur du conteneur**, où il tourne sous
`www-data` — uid 33. Un `chown argon:argon` accompagné d'un mode 600 rend donc
le fichier illisible pour le seul processus qui en a besoin.

Le symptôme ne dit pas « permission refusée » : PHP ne trouve simplement aucune
configuration exploitable, le formulaire répond « erreur », et les clés
semblent en cause alors qu'elles sont correctes.

Le mode 600 reste le bon choix — il fallait seulement l'accorder au bon
utilisateur. L'uid est écrit en chiffres parce que le nom `www-data` n'existe
pas forcément côté hôte : c'est l'uid, pas le nom, que le noyau compare.

Vérification :

```bash
docker exec argon-vitrine-vitrine-1 php -r "var_dump(is_readable('/config/argon-config.php'));"
```

### Étape 3 — Démarrer le conteneur

Sur le serveur :

```bash
cd /home/argon/vitrine
RESEAU_ARGON=argon-staging_default docker compose up -d
docker compose ps          # doit afficher « healthy » après ~30 s
```

À ce stade **rien n'est encore exposé** : le conteneur tourne, Caddy ne le
connaît pas. Aucun risque pour le SaaS.

Vérifier qu'il sert bien, depuis l'intérieur du réseau :

```bash
docker exec argon-staging-caddy-1 wget -qO- http://vitrine/solutions | head -3
```

Une réponse HTML confirme que le conteneur répond **et** que le `.htaccess` est
pris en compte — `/solutions` n'existe que par réécriture.

### Étape 4 — Recharger Caddy

L'étape sensible, et la seule. Toujours valider avant :

```bash
cd /home/argon/argon-deploy
docker compose exec caddy caddy validate --config /etc/caddy/Caddyfile
```

Si la configuration est refusée, **ne pas continuer** : corriger d'abord. Une
configuration invalide chargée rendrait aussi le SaaS injoignable.

Si elle est acceptée :

```bash
docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile
```

`reload` et non `restart` : le rechargement est à chaud, sans coupure, et Caddy
conserve l'ancienne configuration si la nouvelle est refusée.

### Étape 5 — Vérifier

```bash
curl -I https://vitrine-staging.argon-mobility.com/solutions
```

Attendu :

| | |
|---|---|
| `HTTP/2 200` | le site répond, avec un certificat valide |
| `x-robots-tag: noindex, nofollow` | fermeture aux moteurs active |
| `x-content-type-options`, `referrer-policy`, `x-frame-options` | en-têtes de sécurité |

Puis, dans un navigateur : l'accueil, quelques pages, une URL inexistante (404
du site), et **le formulaire en réel** — en attendant au moins 3 secondes avant
de valider, sinon la barrière anti-robot renvoie un faux succès sans rien
envoyer.

⚠️ Sur staging, les balises canonical pointent vers `www.argon-mobility.com` :
c'est normal, le paquet déployé est **exactement** celui de production. Aucune
indexation n'est possible, toutes les pages portent `noindex`.

---

## Passage en production

Identique, avec trois différences :

1. DNS : `argon-mobility.com` **et** `www.argon-mobility.com` doivent pointer
   vers `164.132.76.117` (aujourd'hui `195.135.0.65`, qui ne sert rien).
2. Déposer `vitrine-production.caddy` au lieu de `vitrine-staging.caddy`.
3. `RESEAU_ARGON=argon-production_default`.

---

## Mettre à jour le site plus tard

```bash
npm run deploy:build                                   # sur le poste
scp -r dist/* root@164.132.76.117:/home/argon/vitrine/site/
```

Aucun redémarrage n'est nécessaire : le conteneur lit les fichiers à chaque
requête. Le jour de l'ouverture au référencement, `npm run deploy:ouvrir`
remplace la première commande — et il faut alors bien re-déposer **tout** le
dossier, `.htaccess` compris, puisque le bloc noindex y change.
