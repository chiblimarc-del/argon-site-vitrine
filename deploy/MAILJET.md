# Configurer Mailjet pour le formulaire Argon

Dernier élément technique avant le test de bout en bout. Rien à modifier dans
le code : tout se passe dans l'interface Mailjet, dans la zone DNS OVH, et dans
un seul fichier sur le serveur.

---

## Ce que le site fait déjà

| Élément | Valeur |
|---|---|
| Expéditeur (`From`) | `contact@argon-mobility.com` — seule adresse validée à ce jour. Bascule vers `no-reply@` possible une fois le domaine authentifié (étape 3). |
| Destinataire (`To`) | `contact@argon-mobility.com` |
| `Reply-To` | l'adresse du prospect — répondre depuis la boîte lui écrit directement |
| Objet | `Démo Argon — <Entreprise> (<Activité>)` |
| API | Send v3.1, appel cURL direct, authentification Basic, délai max 10 s |

Les clés ne sont lues que par `api/demande.php`, depuis `argon-config.php`
placé **au-dessus** de `www/` (voir étape 4).
**Vérifié sur le paquet livré : aucun fichier servi au navigateur (HTML, JS,
CSS, XML, SVG) ne contient la moindre trace de clé, du mot « mailjet » ou d'un
en-tête d'authentification.** Le seul fichier PHP présent est `demande.php` ;
le fichier de clés n'est pas dans le paquet et se dépose séparément.

---

## Étape 1 — Récupérer les deux clés

Dans Mailjet : **Account settings → REST API → API Key Management**.

Deux valeurs : `API Key` (publique) et `Secret Key` (privée). La Secret Key
n'est affichée qu'à la création — la noter tout de suite.

⚠️ Ne jamais coller ces valeurs dans un e-mail, un ticket, une capture d'écran
ou un fichier du dépôt. Elles vont uniquement dans `argon-config.php`, sur le
serveur, au-dessus de la racine web.

---

## Étape 2 — Choisir l'adresse expéditrice

**Cible retenue : `no-reply@argon-mobility.com`.** L'expéditeur n'est pas le
destinataire : c'est l'adresse au nom de laquelle Mailjet envoie. Utiliser
`contact@` pour les deux fonctionne, mais brouille la lecture — chaque demande
apparaît comme envoyée par vous-même. Et comme le `Reply-To` est l'adresse du
prospect, personne n'écrit jamais à l'expéditeur : d'où le `no-reply`.

**État actuel : `contact@argon-mobility.com`**, parce que c'est la seule adresse
validée dans Mailjet aujourd'hui. Mettre `no-reply@` avant qu'elle ne soit
acceptée ferait échouer chaque envoi (code 400) — et l'échec est invisible pour
le visiteur, qui verrait juste un message d'erreur générique.

⚠️ **Le piège du `no-reply` :** valider une adresse seule suppose de cliquer un
lien envoyé À cette adresse. Si la boîte `no-reply@` n'existe pas — ce qui est
le cas habituel — cette voie est fermée. La bonne voie est l'authentification du
domaine (étape 3) : une fois SPF et DKIM en place, **toutes** les adresses
`@argon-mobility.com` deviennent utilisables sans validation individuelle, y
compris une adresse sans boîte.

Ordre pratique : authentifier le domaine → basculer `from` sur `no-reply@` →
relancer `tester-mailjet.sh` pour confirmer avant de compter dessus.

---

## Étape 3 — Valider l'expéditeur : deux niveaux

### Niveau minimal — valider une seule adresse

Mailjet → **Senders & Domains → Add a sender**, saisir l'adresse, puis cliquer
le lien du courriel de confirmation reçu à cette adresse.

Suffisant pour que l'envoi fonctionne. Mais les messages partent sans
authentification du domaine : une partie finira en indésirables.

### Niveau recommandé — authentifier le domaine (SPF + DKIM)

Mailjet → **Senders & Domains → Add a domain** → `argon-mobility.com`.
Mailjet affiche alors deux enregistrements à créer dans la zone DNS OVH
(**Espace client OVH → Noms de domaine → argon-mobility.com → Zone DNS**) :

| Type | Nom / sous-domaine | Valeur |
|---|---|---|
| TXT | *(racine, laisser vide)* | `v=spf1 include:spf.mailjet.com ?all` |
| TXT | `mailjet._domainkey` | `k=rsa; p=…` — **clé unique, à copier depuis Mailjet** |

⚠️ **Un seul enregistrement SPF par domaine.** S'il en existe déjà un (courriel
OVH, Google Workspace…), il ne faut pas en ajouter un second : il faut insérer
`include:spf.mailjet.com` dans celui qui existe. Deux SPF sur un même domaine
invalident l'authentification au lieu de la renforcer.

La valeur DKIM est propre à votre compte : elle ne peut pas être écrite ici à
l'avance, elle se copie depuis l'interface Mailjet.

Compter jusqu'à 24 h de propagation DNS, puis revenir dans Mailjet et lancer la
vérification. Tant que le statut n'est pas au vert, l'envoi fonctionne quand
même — la délivrabilité est simplement moins bonne.

---

## Étape 4 — Déposer le fichier de configuration

Deux emplacements possibles. `demande.php` cherche le premier, puis le second.

### Recommandé — **au-dessus** de la racine web

Déposer le fichier sous le nom **`argon-config.php`**, au même niveau que le
dossier `www/`, pas dedans :

```
/argon-config.php     ← ici
/www/
    index.html
    api/demande.php
```

Un fichier situé hors du dossier servi par Apache **ne peut pas être
téléchargé**, quoi qu'il advienne du `.htaccess`. Il n'y a aucune règle à faire
respecter, donc aucune règle qui puisse être perdue au transfert.

### Solution de repli — dans `api/`

Sous le nom `config.php`, dans `www/api/`. Fonctionne, mais la protection
repose alors sur le `.htaccess` du dossier — un fichier que les clients FTP
masquent et que l'hébergeur doit autoriser à surcharger la configuration.

Dans ce cas, `https://www.argon-mobility.com/api/config.php` **doit** renvoyer
**403**. Si ce n'est pas le cas : ne pas bricoler le `.htaccess`, déplacer
simplement le fichier vers l'emplacement recommandé ci-dessus.

### Contenu

```php
<?php
return [
    'apiKey'    => 'votre_api_key',
    'secretKey' => 'votre_secret_key',
    'from'      => 'contact@argon-mobility.com',
    // 'from'   => 'no-reply@argon-mobility.com',  ← après authentification du domaine
    'to'        => 'contact@argon-mobility.com',
];
```

---

## Étape 5 — Test de bout en bout

1. Remplir le formulaire sur le site avec une vraie adresse.
2. Attendre au moins **3 secondes** avant de valider — en dessous, la barrière
   anti-robot considère la soumission comme automatique et renvoie un succès
   **sans rien envoyer**. C'est voulu, et c'est le piège classique du test :
   un envoi trop rapide donne l'impression que tout marche alors que rien
   n'est parti.
3. Attendu : redirection vers `/demande-envoyee`, et un courriel dans
   `contact@argon-mobility.com` avec l'adresse du prospect en *Répondre à*.
4. Vérifier aussi le dossier indésirables : y atterrir est le symptôme d'un
   domaine non authentifié (étape 3).

### Si rien n'arrive

Le visiteur ne voit jamais la cause technique — elle est dans le **journal
d'erreurs**, consultable depuis l'espace client OVH. Trois messages possibles,
qui pointent chacun vers une cause différente :

| Message dans le journal | Cause | Correction |
|---|---|---|
| `Aucun fichier de configuration trouvé` | fichier absent des deux emplacements | étape 4 |
| `config.php incomplet — clés vides : …` | une valeur manque | étape 4 |
| `Requête sortante impossible : …` | la requête n'est jamais partie (DNS, pare-feu sortant de l'hébergement) | à voir avec le support OVH — rien à corriger dans Mailjet |
| `Mailjet a répondu 401` / `403` | clés refusées | étape 1 |
| `Mailjet a répondu 400` | expéditeur non validé | étape 3 |

---

## Ce qui n'a pas pu être testé ici

Les six chemins d'échec ont été vérifiés (méthode GET, piège à miel, délai trop
court, e-mail invalide, téléphone invalide, configuration incomplète), ainsi que
la panne réseau. **Le chemin de succès ne peut pas l'être sans clés réelles** :
il reste le seul comportement du formulaire jamais exécuté pour de vrai. C'est
précisément l'objet du test de l'étape 5.
