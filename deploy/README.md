# Mise en ligne du site Argon sur OVH

Le site est un **export statique** : `npm run build` produit des fichiers HTML,
CSS et JS purs. Aucun processus Node ne tourne en production. Le seul élément
dynamique est le formulaire de démonstration, traité par `api/demande.php`.

## Pourquoi ce choix

L'hébergement mutualisé OVH classique n'exécute que PHP. L'offre Cloud Web
propose bien un runtime Node.js, mais OVH n'en documente pas la version, et
Next.js 16 exige Node ≥ 20.9 — impossible de s'engager dessus. Or les 16 pages
étaient déjà toutes pré-générées : seul le formulaire réclamait un serveur.

Le site tourne donc sur n'importe quelle offre OVH, y compris la moins chère.

## Construire le paquet

```bash
npm run deploy:build     # site FERMÉ aux moteurs — état de pré-lancement
npm run deploy:ouvrir    # site OUVERT — le jour du lancement, une seule fois
```

Les deux forcent `NEXT_PUBLIC_SITE_URL=https://www.argon-mobility.com`,
construisent l'export, puis assemblent `dist/` = export + `.htaccess` + `api/`.

### Fermé ≠ Disallow

Tant que les pages légales ne sont pas publiées, le site est déployé sur son
domaine définitif mais tenu hors de Google. Deux mécanismes indépendants :

| | Fermé (défaut) | Ouvert |
|---|---|---|
| En-tête HTTP | `X-Robots-Tag: noindex, nofollow` sur tout | aucun |
| Balise meta de chaque page | `noindex, follow` | `index, follow` |
| robots.txt | `Allow: /`, sans sitemap | `Allow: /` + sitemap |

⚠️ robots.txt autorise volontairement l'exploration en mode fermé. Un
`Disallow: /` serait **contre-productif** : il empêche d'explorer, pas
d'indexer — Google peut faire figurer dans ses résultats une URL qu'il n'a
jamais lue, et comme il n'a pas le droit de lire la page, il n'y verrait
jamais l'ordre de ne pas l'indexer. On l'autorise donc à venir lire le
`noindex`. C'est la méthode recommandée par Google.

Le bloc correspondant du `.htaccess` est **réécrit automatiquement** à partir
du même drapeau que le build : l'en-tête HTTP et les balises meta ne peuvent
pas se contredire. Le script vérifie ensuite les deux sur le paquet produit et
refuse de livrer en cas de divergence.

Le script **refuse** de produire un paquet si :

- `robots.txt` interdit l'exploration (mauvaise URL de build) ;
- les balises canonical ne portent pas le domaine de production ;
- `.htaccess` ou `api/demande.php` manquent ;
- un fichier `config.php` traîne dans le dépôt (risque de fuite des clés).

## Déposer sur le serveur

1. Téléverser **le contenu** de `dist/` dans le dossier `www/` de
   l'hébergement (pas le dossier `dist` lui-même).
2. Vérifier que les fichiers `.htaccess` ont bien été transférés — la plupart
   des clients FTP masquent les fichiers commençant par un point. Il y en a
   **deux** : à la racine, et dans `api/`.
3. Déposer le fichier de configuration Mailjet. **Emplacement recommandé :
   `argon-config.php`, au-dessus de `www/`** — hors du dossier servi par
   Apache, donc impossible à télécharger quoi qu'il arrive au `.htaccess`.
   Repli accepté : `www/api/config.php`. Voir `MAILJET.md`, étape 4.
   Ce fichier ne doit jamais être versionné ni figurer dans le paquet.

## Ce que fait `.htaccess`

| Règle | Effet |
|---|---|
| HTTPS + www | Une seule URL canonique, tout le reste en 301 |
| `DirectorySlash Off` + réécriture | `/contact` sert `contact.html` — URLs sans extension, identiques aux canonical |
| Redirection | `/secteurs/intervention-terrain` → `/solutions/gestion-interventions` |
| `ErrorDocument` | La page 404 du site |
| En-têtes | Ceux que servait `next.config.ts`, plus HSTS |
| Cache | Un an sur les fichiers versionnés, revalidation sur le HTML |

## Vérifications après mise en ligne

- [ ] En-tête `X-Robots-Tag: noindex` présent sur une page au hasard
      (`curl -I https://www.argon-mobility.com/solutions`) — tant que le site
      est fermé
- [ ] `https://www.argon-mobility.com/robots.txt` affiche `Allow: /`
- [ ] `https://www.argon-mobility.com/sitemap.xml` liste **16** URLs
- [ ] `http://argon-mobility.com` redirige en 301 vers `https://www.…`
- [ ] Une URL inexistante affiche la page 404 du site
- [ ] `https://www.argon-mobility.com/api/config.php` renvoie **404** —
      le fichier n'est pas là, il est au-dessus de `www/`. Un **403** signifie
      que vous avez utilisé le repli ; un **200** est une fuite, à corriger
      immédiatement.
- [ ] Envoi réel du formulaire → e-mail reçu sur `contact@argon-mobility.com`,
      avec l'adresse du prospect en *Répondre à*
- [ ] Sitemap soumis dans la Search Console — **seulement après ouverture**

## Mettre à jour le site plus tard

Le contenu vit dans le dépôt, pas sur le serveur. On modifie, on relance
`npm run deploy:build`, on re-téléverse `dist/`. Le fichier de configuration
reste en place : ne pas l'écraser.

## Le jour de l'ouverture

Dans cet ordre, et pas avant que les mentions légales et la politique de
confidentialité ne soient publiées :

1. `npm run deploy:ouvrir`
2. Téléverser `dist/` (le `.htaccess` change : le bloc noindex disparaît)
3. Vérifier que `X-Robots-Tag` a bien disparu des réponses
4. Vérifier que `robots.txt` annonce désormais le sitemap
5. Soumettre le sitemap dans la Search Console
