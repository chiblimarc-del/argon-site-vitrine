#!/usr/bin/env bash
#
# =============================================================================
# Argon — collecte nocturne de l'audience du site vitrine.
#
# Lit les journaux Caddy de la veille, les agrège, et poste UN relevé au backend.
# Destiné à un cron sur le serveur :
#
#   10 3 * * *  /home/argon/vitrine/collecte-audience.sh >> /var/log/argon-audience.log 2>&1
#
# À la main, pour rattraper ou vérifier :
#   ./collecte-audience.sh              # la veille
#   ./collecte-audience.sh --jour 2026-09-01
#   ./collecte-audience.sh --essai      # agrège et AFFICHE, sans rien envoyer
#
# ─────────────────────────────────────────────────────────────────────────────
# POURQUOI CE SCRIPT EXISTE, ET POURQUOI IL EST URGENT
#
# Les journaux Docker sont plafonnés à 3 × 10 Mo, partagés entre les trois domaines, et les
# scans de failles les remplissent : environ **2,5 jours** de rétention réelle au 01/09/2026.
# Tout ce qui n'est pas collecté cette nuit-là est perdu pour toujours — il n'y a pas de
# rattrapage possible au-delà de la fenêtre. C'est la seule raison pour laquelle ce script
# passe avant l'écran qui affichera ses chiffres.
#
# ─────────────────────────────────────────────────────────────────────────────
# CE QU'IL N'ENVOIE PAS
#
# Aucune adresse IP, aucune empreinte, aucun agent : **des compteurs, jamais des visiteurs**.
# Le site ne pose ni cookie ni script de suivi, et ce script ne doit jamais devenir la raison
# d'en poser un. Ce qui traverse le réseau tient en une quinzaine de nombres et une liste de
# chemins.
#
# ⚠️ IL NE SORT PAS DU SERVEUR. Le backend ne publie aucun port : on résout l'adresse de son
# conteneur à chaque exécution — jamais une adresse écrite en dur, elle change au redémarrage.
# =============================================================================

# `set -e` SANS `pipefail` : les agrégations se terminent par `head`, qui ferme le tuyau et
# fait rendre un code non nul à `sort` (SIGPIPE). Avec `pipefail`, le script s'arrêterait au
# milieu, sans message — c'est exactement ce qui est arrivé à `mesure-vitrine.sh` le
# 31/08/2026, où le rapport se coupait pile après les 404.
set -eu

JOUR=$(date -u -d 'yesterday' '+%Y-%m-%d')
ESSAI="non"

while [ $# -gt 0 ]; do
  case "$1" in
    --) shift ;;
    --jour) JOUR="${2:?--jour attend une date AAAA-MM-JJ}"; shift 2 ;;
    --essai) ESSAI="oui"; shift ;;
    *) echo "Paramètre inconnu : $1" >&2; exit 2 ;;
  esac
done

for outil in docker jq awk curl; do
  command -v "$outil" >/dev/null 2>&1 || { echo "✗ $outil introuvable." >&2; exit 1; }
done

CONFIG="/home/argon/vitrine/argon-config.php"
HOTE="www.argon-mobility.com"

# Les noms sont découverts : un renommage de projet Compose casserait autrement le script
# sans expliquer pourquoi.
CADDY=$(docker ps --format '{{.Names}}' | grep -m1 caddy || true)
BACKEND=$(docker ps --format '{{.Names}}' | grep -m1 backend || true)
[ -n "$CADDY" ] || { echo "✗ Aucun conteneur Caddy en service." >&2; exit 1; }

TRAVAIL=$(mktemp -d)
trap 'rm -rf "$TRAVAIL"' EXIT

# =============================================================================
# 1. EXTRACTION — le jour demandé, et lui seul
# =============================================================================

# `--since`/`--until` bornent au jour civil UTC. Le relevé porte ses bornes réelles : si la
# rétention a rogné le début de la journée, l'écran doit pouvoir le dire plutôt que de laisser
# croire à une chute d'audience.
docker logs --since "${JOUR}T00:00:00Z" --until "${JOUR}T23:59:59Z" "$CADDY" 2>&1 \
  | grep '"logger":"http.log.access"' \
  | grep "\"host\":\"$HOTE\"" > "$TRAVAIL/acces.jsonl" || true

if [ ! -s "$TRAVAIL/acces.jsonl" ]; then
  echo "Aucune requête pour $HOTE le $JOUR — journal trop court, ou journée sans trafic."
  exit 0
fi

jq -r '
  [ (.ts | floor),
    (.request.client_ip // .request.remote_ip // "-"),
    (.request.uri // "-" | split("?")[0]),
    (.status | tostring),
    ((.request.headers["User-Agent"] // ["-"])[0]),
    ((.request.headers["Referer"] // ["-"])[0])
  ] | @tsv
' "$TRAVAIL/acces.jsonl" > "$TRAVAIL/brut.tsv"

# Robot, appareil et source, en une passe.
#
# ⚠️ Le motif de robot est volontairement LARGE : un robot pris pour un humain gonfle les
# visites et écrase le taux de conversion. L'erreur coûteuse est dans ce sens-là.
#
# ⚠️ « non transmise » et non « direct » : Google réduit le référent à son origine et la
# plupart des navigateurs ne l'envoient plus. Sur la première mesure, ZÉRO référent extérieur
# sur 92 visiteurs. Appeler cela « trafic direct » serait une affirmation fausse.
awk -F'\t' -v OFS='\t' -v hote="$HOTE" '
  {
    ua = tolower($5)
    robot = (ua ~ /bot|crawl|spider|slurp|facebookexternalhit|preview|monitor|curl|wget|python-requests|go-http|headless|scrapy|semrush|ahrefs|mj12|dotbot|petal|bytespider|gptbot|claudebot|ccbot|perplexity|applebot|yandex|baidu|uptime|pingdom|censys|zgrab/) ? 1 : 0

    appareil = "inconnu"
    if (ua ~ /mobile|android|iphone|ipad|ipod/) appareil = "mobile"
    else if (ua ~ /windows|macintosh|linux|cros/) appareil = "desktop"

    ref = tolower($6)
    if (ref == "-" || ref == "") source = "non-transmise"
    else if (ref ~ /argon-mobility\.com/) source = "interne"
    else if (ref ~ /google\.|bing\.|duckduckgo|qwant|ecosia|yahoo\./) source = "google"
    else if (ref ~ /linkedin|facebook|twitter|x\.com|instagram|youtube|tiktok/) source = "sociale"
    else source = "referent"

    print $1, $2, $3, $4, robot, appareil, source
  }
' "$TRAVAIL/brut.tsv" > "$TRAVAIL/marque.tsv"

# Les PAGES : ni ressource, ni préchargement, et servies en 2xx. C'est ce décompte que l'on
# rapprochera des demandes.
awk -F'\t' -v OFS='\t' '
  $5 == 0 && $4 ~ /^2/ && $3 !~ /^\/_next\// && $3 !~ /\.(js|css|svg|png|jpg|jpeg|webp|woff2?|ico|txt|xml|map)$/ {
    print $1, $2, $3, $6, $7
  }
' "$TRAVAIL/marque.tsv" > "$TRAVAIL/pages.tsv"

# Un visiteur a UNE source et UN appareil : ceux de sa PREMIÈRE page vue.
#
# ⚠️ Sans cette réduction, on comptait les adresses ayant « au moins une page » avec telle
# source : quelqu'un qui navigue apparaissait dans plusieurs catégories, et surtout ceux dont
# la première page portait un référent INTERNE tombaient dans une cinquième catégorie qui
# n'est jamais envoyée. Constaté à l'essai du 01/09/2026 : 59 visiteurs, 40 dans les sources.
# Une répartition qui ne totalise pas son total est une répartition fausse.
#
# Un référent interne sur la première page vue signifie qu'on n'a pas vu son entrée (page
# sortie du cache, rétention rognée) : il rejoint « non transmise », qui dit exactement cela.
sort -k2,2 -k1,1n "$TRAVAIL/pages.tsv" \
  | awk -F'\t' -v OFS='\t' '!vu[$2]++ {
      source = ($5 == "interne") ? "non-transmise" : $5
      print $2, $4, source
    }' > "$TRAVAIL/visiteurs.tsv"

# =============================================================================
# 2. AGRÉGATION
# =============================================================================

compter() { wc -l < "$1" | tr -d ' '; }

REQUETES=$(compter "$TRAVAIL/marque.tsv")
ROBOTS=$(awk -F'\t' '$5 == 1' "$TRAVAIL/marque.tsv" | wc -l | tr -d ' ')
SCANS=$(awk -F'\t' '$4 == "404" && $3 !~ /__next\./' "$TRAVAIL/marque.tsv" | wc -l | tr -d ' ')
PAGES_VUES=$(compter "$TRAVAIL/pages.tsv")

# ⚠️ Un VISITEUR est une adresse ayant obtenu au moins une page en 200 — pas « toute adresse
# non reconnue comme robot ». Les scanners se présentent en « Mozilla/5.0 » : les compter
# annonçait 167 visiteurs là où il y en avait 92 (mesure du 31/08/2026).
# `visiteurs.tsv` porte exactement une ligne par visiteur : le compter, c'est les compter.
VISITEURS=$(compter "$TRAVAIL/visiteurs.tsv")

# Appareil et source se lisent dans ce même fichier — une valeur par visiteur, décidée à sa
# première page vue. Les compter sur `pages.tsv` ferait peser dix fois quelqu'un qui lit dix
# pages, et le classerait dans plusieurs catégories à la fois.
visiteurs_ou() {
  awk -F'\t' -v col="$1" -v val="$2" '$col == val' "$TRAVAIL/visiteurs.tsv" \
    | wc -l | tr -d ' '
}

MOBILE=$(visiteurs_ou 2 mobile)
DESKTOP=$(visiteurs_ou 2 desktop)
SRC_GOOGLE=$(visiteurs_ou 3 google)
SRC_SOCIALE=$(visiteurs_ou 3 sociale)
SRC_REFERENT=$(visiteurs_ou 3 referent)
SRC_NON_TRANSMISE=$(visiteurs_ou 3 non-transmise)

DEBUT=$(awk -F'\t' 'NR==1 || $1<m {m=$1} END {print m}' "$TRAVAIL/marque.tsv")
FIN=$(awk -F'\t' '$1>m {m=$1} END {print m}' "$TRAVAIL/marque.tsv")

# Les pages, en JSON. `jq -R` lit des lignes brutes : aucun échappement à écrire soi-même,
# donc aucun chemin exotique capable de casser la charge.
# Colonnes de `pages.tsv` : instant, adresse, chemin, appareil, source. Les visiteurs d'une
# page se comptent par couple (adresse, chemin) — sinon dix lectures d'une même page par la
# même personne feraient dix visiteurs.
awk -F'\t' '{ compte[$3]++; if (!(($2 FS $3) in vu)) { vu[$2 FS $3]=1; uniques[$3]++ } }
  END { for (chemin in compte) printf "%s\t%d\t%d\n", chemin, uniques[chemin], compte[chemin] }' \
  "$TRAVAIL/pages.tsv" | sort -k3,3nr | head -500 \
  | jq -R -s 'split("\n") | map(select(length > 0) | split("\t")
      | { chemin: .[0], visiteurs: (.[1] | tonumber), pagesVues: (.[2] | tonumber) })' \
  > "$TRAVAIL/pages.json"

jq -n \
  --arg jour "$JOUR" \
  --argjson visiteurs "$VISITEURS" --argjson pagesVues "$PAGES_VUES" \
  --argjson requetes "$REQUETES" --argjson robots "$ROBOTS" --argjson scans "$SCANS" \
  --argjson mobile "$MOBILE" --argjson desktop "$DESKTOP" \
  --argjson google "$SRC_GOOGLE" --argjson sociale "$SRC_SOCIALE" \
  --argjson referent "$SRC_REFERENT" --argjson nonTransmise "$SRC_NON_TRANSMISE" \
  --arg debut "$(date -u -d "@$DEBUT" '+%Y-%m-%dT%H:%M:%S.000Z')" \
  --arg fin "$(date -u -d "@$FIN" '+%Y-%m-%dT%H:%M:%S.000Z')" \
  --slurpfile pages "$TRAVAIL/pages.json" \
  '{ jour: $jour, visiteurs: $visiteurs, pagesVues: $pagesVues, requetes: $requetes,
     robots: $robots, scans: $scans, mobile: $mobile, desktop: $desktop,
     sourceGoogle: $google, sourceSociale: $sociale, sourceReferent: $referent,
     sourceNonTransmise: $nonTransmise,
     fenetreDebut: $debut, fenetreFin: $fin, pages: $pages[0] }' \
  > "$TRAVAIL/releve.json"

echo "Relevé du $JOUR : $VISITEURS visiteurs, $PAGES_VUES pages vues, "\
"bruit $((ROBOTS + SCANS))/$REQUETES, $(jq 'length' "$TRAVAIL/pages.json") pages."

if [ "$ESSAI" = "oui" ]; then
  jq '.pages = (.pages | length | tostring + " pages (masquées en essai)")' "$TRAVAIL/releve.json"
  exit 0
fi

# =============================================================================
# 3. ENVOI
# =============================================================================

[ -n "$BACKEND" ] || { echo "✗ Aucun conteneur backend en service." >&2; exit 1; }
[ -r "$CONFIG" ] || { echo "✗ $CONFIG illisible : secret introuvable." >&2; exit 1; }

# Le secret vit avec les clés Mailjet, dans le fichier que le site utilise déjà. Une seule
# valeur à poser par serveur, un seul endroit où la chercher.
SECRET=$(grep -oP "'crmSecret'\s*=>\s*'\K[^']+" "$CONFIG" || true)
[ -n "$SECRET" ] || { echo "✗ crmSecret absent de $CONFIG." >&2; exit 1; }

# ⚠️ L'adresse est RÉSOLUE à chaque exécution : celle d'un conteneur change au redémarrage, et
# le backend ne publie aucun port sur l'hôte. Une adresse écrite en dur marcherait jusqu'au
# premier `docker compose up`, puis échouerait toutes les nuits en silence.
IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$BACKEND")
[ -n "$IP" ] || { echo "✗ Adresse du backend introuvable." >&2; exit 1; }

CODE=$(curl -sS -o "$TRAVAIL/reponse.json" -w '%{http_code}' \
  --max-time 30 \
  -X POST "http://${IP}:3000/audience-vitrine" \
  -H 'Content-Type: application/json' \
  -H "X-Argon-Secret: ${SECRET}" \
  --data-binary "@$TRAVAIL/releve.json" || echo "000")

if [ "$CODE" = "200" ]; then
  echo "audience=ok jour=$JOUR $(cat "$TRAVAIL/reponse.json")"
else
  # Un échec ne perd rien d'irrattrapable TANT QUE le journal couvre encore ce jour : la
  # relance est `--jour $JOUR`, et elle écrase proprement. Passé la rétention, c'est perdu —
  # d'où l'intérêt de lire cette sortie, et de la garder dans un fichier.
  echo "audience=echec jour=$JOUR http=$CODE $(head -c 300 "$TRAVAIL/reponse.json" 2>/dev/null)" >&2
  echo "  Relancer avec : $0 --jour $JOUR" >&2
  exit 1
fi
