#!/usr/bin/env bash
#
# =============================================================================
# Argon — mesure du trafic de la vitrine, et taux de conversion par page.
#
# Se lance depuis le POSTE, en une seule commande, sans rien installer :
#
#   ssh root@164.132.76.117 'bash -s' < deploy/vps/mesure-vitrine.sh
#   ssh root@164.132.76.117 'bash -s' < deploy/vps/mesure-vitrine.sh -- --depuis 720h
#
# ⚠️ CE SCRIPT NE MODIFIE RIEN. Il lit deux journaux Docker, écrit dans un
# dossier temporaire qu'il efface en sortant, et n'installe aucun paquet. Il ne
# touche ni à Caddy, ni à argon-deploy, ni à la configuration du SaaS.
#
# ─────────────────────────────────────────────────────────────────────────────
# POURQUOI LE FILTRAGE À L'ANALYSE, ET PAS UN FICHIER DE JOURNAL SÉPARÉ
#
# Caddy sert trois domaines (app., api., www.) et écrit un seul journal. On
# pourrait lui demander d'en écrire un par domaine — ce serait plus propre, et
# cela supposerait de modifier la configuration Caddy de la PRODUCTION du SaaS.
# Décision du 01/09/2026 : le gain de propreté ne justifie pas ce risque. On
# filtre donc sur `request.host`, ce qui donne exactement le même résultat pour
# un coût nul.
#
# Le jour où le volume ou la rétention l'imposeront, la séparation reste
# possible — `www.argon-mobility.com → /var/log/caddy/vitrine.log` — mais ce
# sera un chantier d'infrastructure à part entière, pas un effet de bord de la
# mesure d'audience.
#
# ─────────────────────────────────────────────────────────────────────────────
# CE QUE CES CHIFFRES VALENT, ET CE QU'ILS NE VALENT PAS
#
# - « Visiteurs » = adresses IP distinctes, robots connus exclus. Ce n'est pas
#   un décompte de personnes : deux salariés derrière la même sortie internet
#   comptent pour un, un abonné mobile qui change d'adresse compte pour deux.
#   L'ordre de grandeur est juste, la précision ne l'est pas.
# - La rétention est celle de Docker : `max-size 10m`, `max-file 3`, partagée
#   avec les journaux des trois domaines. Au 01/09/2026, cela représentait
#   environ cinq jours. **Une fenêtre plus large que la rétention ne rend pas
#   d'erreur : elle rend moins de lignes.** La période réellement couverte est
#   affichée en tête du rapport — c'est elle qui fait foi, jamais le paramètre
#   demandé.
# - Les demandes sont lues dans le journal du conteneur vitrine, jamais dans
#   les visites de /demande-envoyee : cette page est aussi servie aux robots
#   piégés, et la compter gonflerait les conversions de tout le spam écarté.
# =============================================================================

# ⚠️ `set -e` SANS `pipefail`, et c'est délibéré.
#
# Ce rapport est fait de pipelines qui se terminent par `head` : dès que `head`
# a ses vingt lignes, il ferme le tuyau, `sort` reçoit SIGPIPE et rend un code
# non nul. Avec `pipefail`, `set -e` interrompait alors le script — la première
# version s'arrêtait pile après la section des 404, sans le moindre message,
# et le tableau de conversion ne s'affichait jamais. Un rapport tronqué en
# silence est pire qu'un rapport absent : on croit avoir tout lu.
set -eu

FENETRE="168h"
RAPPORT_HTML="non"

while [ $# -gt 0 ]; do
  case "$1" in
    --) shift ;;
    --depuis) FENETRE="${2:?--depuis attend une durée, par exemple 720h}"; shift 2 ;;
    --html)   RAPPORT_HTML="oui"; shift ;;
    *) echo "Paramètre inconnu : $1" >&2; exit 2 ;;
  esac
done

# --- Ce dont le script a besoin -------------------------------------------
for outil in docker jq awk; do
  command -v "$outil" >/dev/null 2>&1 || {
    echo "✗ $outil est introuvable sur ce serveur." >&2
    exit 1
  }
done

# Les noms sont DÉCOUVERTS, jamais codés en dur : un renommage de projet
# Compose casserait autrement le script sans expliquer pourquoi.
CADDY=$(docker ps --format '{{.Names}}' | grep -m1 caddy || true)
VITRINE=$(docker ps --format '{{.Names}}' | grep -m1 vitrine || true)

[ -n "$CADDY" ] || { echo "✗ Aucun conteneur Caddy en cours d'exécution." >&2; exit 1; }
[ -n "$VITRINE" ] || { echo "✗ Aucun conteneur vitrine en cours d'exécution." >&2; exit 1; }

HOTE="www.argon-mobility.com"

TRAVAIL=$(mktemp -d)
trap 'rm -rf "$TRAVAIL"' EXIT

ACCES="$TRAVAIL/acces.jsonl"
HUMAINS="$TRAVAIL/humains.tsv"
PAGES="$TRAVAIL/pages.tsv"

# =============================================================================
# 1. EXTRACTION
# =============================================================================

docker logs --since "$FENETRE" "$CADDY" 2>&1 \
  | grep '"logger":"http.log.access"' \
  | grep "\"host\":\"$HOTE\"" > "$ACCES" || true

LIGNES=$(wc -l < "$ACCES")

if [ "$LIGNES" -eq 0 ]; then
  echo "Aucune requête pour $HOTE sur la fenêtre demandée ($FENETRE)."
  echo "Le journal de $CADDY ne remonte peut-être pas si loin."
  exit 0
fi

# Une ligne par requête : horodatage, adresse, chemin, statut, robot, référent.
#
# ⚠️ Le motif de robot est volontairement LARGE. Un robot classé comme humain
# gonfle les visites et écrase le taux de conversion — l'erreur coûteuse est
# dans ce sens-là, pas dans l'autre.
jq -r '
  [
    (.ts | floor),
    (.request.client_ip // .request.remote_ip // "-"),
    (.request.uri // "-" | split("?")[0]),
    (.status | tostring),
    ((.request.headers["User-Agent"] // ["-"])[0]),
    ((.request.headers["Referer"] // ["-"])[0])
  ] | @tsv
' "$ACCES" > "$TRAVAIL/brut.tsv"

# Robots : marqués, jamais supprimés — on veut aussi savoir combien il y en a.
awk -F'\t' -v OFS='\t' '
  {
    ua = tolower($5)
    robot = (ua ~ /bot|crawl|spider|slurp|facebookexternalhit|preview|monitor|curl|wget|python-requests|go-http|headless|scrapy|semrush|ahrefs|mj12|dotbot|petal|bytespider|gptbot|claudebot|ccbot|perplexity|applebot|yandex|baidu|uptime|pingdom|censys|zgrab/) ? 1 : 0
    # L agent est conservé en 7e colonne : sans lui, nommer les robots
    # obligeait à recoller deux fichiers ligne à ligne, ce qui est fragile.
    print $1, $2, $3, $4, robot, $6, $5
  }
' "$TRAVAIL/brut.tsv" > "$TRAVAIL/marque.tsv"

awk -F'\t' '$5 == 0' "$TRAVAIL/marque.tsv" > "$HUMAINS"

# Les PAGES, par opposition aux ressources : ni /_next/, ni fichier à
# extension. C'est ce décompte-là qu'on rapproche des demandes.
awk -F'\t' -v OFS='\t' '
  $3 !~ /^\/_next\// && $3 !~ /\.(js|css|svg|png|jpg|jpeg|webp|woff2?|ico|txt|xml|map)$/ && $4 ~ /^2/ {
    print $1, $2, $3
  }
' "$HUMAINS" > "$PAGES"

# =============================================================================
# 2. LE RAPPORT
# =============================================================================

titre() { printf '\n\033[1m%s\033[0m\n%s\n' "$1" "$(printf '─%.0s' $(seq 1 ${#1}))"; }

DEBUT=$(awk -F'\t' 'NR==1 || $1<m {m=$1} END {print m}' "$TRAVAIL/marque.tsv")
FIN=$(awk -F'\t' '$1>m {m=$1} END {print m}' "$TRAVAIL/marque.tsv")

echo
echo "════════════════════════════════════════════════════════════════════"
echo " ARGON — trafic de $HOTE"
echo "════════════════════════════════════════════════════════════════════"

titre "Période réellement couverte"
printf '  du %s\n  au %s\n' \
  "$(date -u -d "@$DEBUT" '+%d/%m/%Y %H:%M UTC')" \
  "$(date -u -d "@$FIN" '+%d/%m/%Y %H:%M UTC')"
printf '  (fenêtre demandée : %s ; la rétention Docker peut la raccourcir)\n' "$FENETRE"

titre "Volumes"
TOTAL=$(wc -l < "$TRAVAIL/marque.tsv")
ROBOTS=$(awk -F'\t' '$5 == 1' "$TRAVAIL/marque.tsv" | wc -l)
SCANS=$(awk -F'\t' '$4 == "404" && $3 !~ /__next\./' "$TRAVAIL/marque.tsv" | wc -l)
VUES=$(wc -l < "$PAGES")

# ⚠️ LE DÉNOMINATEUR EST COMPTÉ SUR LES PAGES RÉELLEMENT VUES, pas sur les
# requêtes non identifiées comme robots.
#
# La première version comptait toute adresse dont l'agent n'était pas reconnu :
# elle annonçait 167 visiteurs là où il y en avait 140. Les scanners de failles
# — 4 280 requêtes vers /wp-admin/install.php et consorts sur la première
# mesure — se présentent en « Mozilla/5.0 » et ne sont donc jamais reconnus.
# Un visiteur est ici une adresse qui a obtenu au moins UNE page du site en
# 200 : c'est ce qui distingue quelqu'un qui lit d'un programme qui cherche
# une porte. Compter les seconds gonfle le dénominateur et écrase le taux de
# conversion — l'erreur va toujours dans ce sens-là.
VISITEURS=$(cut -f2 "$PAGES" | sort -u | wc -l)

printf '  Requêtes servies         %8d\n' "$TOTAL"
printf '  dont robots déclarés     %8d  (%d %%)\n' "$ROBOTS" $((ROBOTS * 100 / (TOTAL > 0 ? TOTAL : 1)))
printf '  dont scans de failles    %8d  (404 hors préchargements)\n' "$SCANS"
printf '  Pages vues               %8d\n' "$VUES"
printf '  Visiteurs (IP uniques)   %8d\n' "$VISITEURS"
printf '\n  Une adresse compte comme visiteur si elle a obtenu au moins une page\n'
printf '  en 200. Ce n%st pas un décompte de personnes : voir l%sen-tête.\n' "'es" "'"

titre "Pages les plus consultées"
cut -f3 "$PAGES" | sort | uniq -c | sort -rn | head -20 \
  | awk '{ printf "  %6d  %s\n", $1, $2 }'

titre "Pages d'entrée — la première page vue par chaque visiteur"
sort -k2,2 -k1,1n "$PAGES" \
  | awk -F'\t' '!vu[$2]++ { print $3 }' \
  | sort | uniq -c | sort -rn | head -15 \
  | awk '{ printf "  %6d  %s\n", $1, $2 }'

titre "Référents — d'où viennent les visiteurs"
# ⚠️ Le filtre porte sur « argon-mobility.com » et non sur l'hôte complet : le
# domaine nu redirige vers www, et ses redirections apparaissaient sinon comme
# le premier « référent extérieur » du site — 289 fois sur la première mesure.
EXTERNES=$(awk -F'\t' '$6 != "-" && $6 != "" && $6 !~ /argon-mobility\.com/' "$HUMAINS" | wc -l)
if [ "$EXTERNES" -gt 0 ]; then
  awk -F'\t' '$6 != "-" && $6 != "" && $6 !~ /argon-mobility\.com/ { print $6 }' "$HUMAINS" \
    | awk '{ split($0, p, "/"); print p[3] }' \
    | sort | uniq -c | sort -rn | head -15 \
    | awk '{ printf "  %6d  %s\n", $1, $2 }'
else
  echo "  (aucun référent extérieur transmis sur la période)"
  echo "  Google réduit le référent à son origine, et beaucoup de navigateurs"
  echo "  ne le transmettent plus du tout : cette section reste souvent vide."
fi

titre "404 — ce que l'on cherche et qui n'existe pas"
# Deux familles, à ne jamais confondre : les scans hostiles (WordPress, PHP)
# qui ne coûtent rien, et les préchargements de Next, qui sont du budget de
# crawl dépensé pour rien. Voir le registre de dette, entrée 9.
PRECHARGE=$(awk -F'\t' '$4 == "404" && $3 ~ /__next\./' "$TRAVAIL/marque.tsv" | wc -l)
AUTRES404=$(awk -F'\t' '$4 == "404" && $3 !~ /__next\./' "$TRAVAIL/marque.tsv" | wc -l)
printf '  Préchargements Next (__next.*.txt)  %6d\n' "$PRECHARGE"
printf '  Autres                              %6d\n' "$AUTRES404"
echo
awk -F'\t' '$4 == "404" && $3 !~ /__next\./ { print $3 }' "$TRAVAIL/marque.tsv" \
  | sort | uniq -c | sort -rn | head -12 \
  | awk '{ printf "  %6d  %s\n", $1, $2 }'
[ "$AUTRES404" -gt 0 ] || echo "  (aucune, hors préchargements)"

titre "Robots connus, par identité"
awk -F'\t' '$5 == 1 { print $7 }' "$TRAVAIL/marque.tsv" \
  | sed 's/.*\(Googlebot\|bingbot\|GPTBot\|ClaudeBot\|CCBot\|PerplexityBot\|YandexBot\|Applebot\|AhrefsBot\|SemrushBot\|DotBot\|PetalBot\|Bytespider\|facebookexternalhit\|curl\|python-requests\|Go-http-client\).*/\1/I' \
  | sort | uniq -c | sort -rn | head -12 \
  | awk '{ printf "  %6d  %s\n", $1, $2 }'

# =============================================================================
# 3. LE RAPPROCHEMENT — visites, demandes, taux
# =============================================================================

# Les demandes réellement parties, lues dans le journal du conteneur vitrine.
#
# ⚠️ DEUX FORMATS COEXISTENT. Depuis le 01/09/2026 chaque demande s'écrit
# « resultat=envoye … page=/x » ; avant, elle s'écrivait « Demande transmise a
# Mailjet » et ne portait aucune page. Les anciennes sont donc comptées, mais
# rangées sous « (page inconnue) » — les ignorer ferait croire à une chute des
# demandes le jour du déploiement.
docker logs --since "$FENETRE" "$VITRINE" 2>&1 \
  | grep 'demande-demo' > "$TRAVAIL/demandes.log" || true

awk '
  /resultat=envoye/ {
    page = "(page inconnue)"
    if (match($0, /page=[^ ]+/)) {
      page = substr($0, RSTART + 5, RLENGTH - 5)
      if (page == "-") page = "(page inconnue)"
    }
    print page
    suivant = 1
    next
  }
  /Demande transmise a Mailjet/ { print "(page inconnue)" }
' "$TRAVAIL/demandes.log" | sort | uniq -c | sort -rn > "$TRAVAIL/demandes.tsv" || true

titre "VISITES → DEMANDES → TAUX"

DEMANDES_TOTAL=$(awk '{ s += $1 } END { print s + 0 }' "$TRAVAIL/demandes.tsv")

printf '  %-46s %8s %9s %8s\n' "PAGE" "VISITES" "DEMANDES" "TAUX"
printf '  %s\n' "$(printf '─%.0s' $(seq 1 74))"

# Visiteurs uniques par page : le dénominateur le plus proche d'un taux de
# conversion. Les pages vues gonfleraient le total d'un visiteur qui revient.
cut -f2,3 "$PAGES" | sort -u | cut -f2 | sort | uniq -c | sort -rn > "$TRAVAIL/visites.tsv"

awk -v fichier="$TRAVAIL/demandes.tsv" '
  BEGIN {
    # ⚠️ `uniq -c` rend « <compte> <libellé> », et le libellé peut contenir des
    # espaces — « (page inconnue) ». Découper sur les espaces et prendre le
    # dernier champ affichait « inconnue) » dans le tableau. On coupe donc au
    # PREMIER espace après le nombre, et tout le reste est le libellé.
    while ((getline ligne < fichier) > 0) {
      sub(/^[ \t]+/, "", ligne)
      espace = index(ligne, " ")
      if (espace == 0) continue
      compte = substr(ligne, 1, espace - 1) + 0
      page = substr(ligne, espace + 1)
      demandes[page] = compte
    }
  }
  {
    page = $2
    visites = $1 + 0
    d = (page in demandes) ? demandes[page] : 0
    vu[page] = 1
    taux = (visites > 0) ? sprintf("%.2f %%", d * 100 / visites) : "—"
    printf "  %-46s %8d %9d %8s\n", page, visites, d, taux
  }
  END {
    for (page in demandes) {
      if (!(page in vu)) {
        printf "  %-46s %8s %9d %8s\n", page, "—", demandes[page], "—"
      }
    }
  }
' "$TRAVAIL/visites.tsv" | head -25

printf '  %s\n' "$(printf '─%.0s' $(seq 1 74))"
if [ "$VISITEURS" -gt 0 ]; then
  TAUX_GLOBAL=$(awk -v d="$DEMANDES_TOTAL" -v v="$VISITEURS" 'BEGIN { printf "%.2f %%", d * 100 / v }')
else
  TAUX_GLOBAL="—"
fi
printf '  %-46s %8d %9d %8s\n' "TOTAL" "$VISITEURS" "$DEMANDES_TOTAL" "$TAUX_GLOBAL"

if [ "$DEMANDES_TOTAL" -eq 0 ]; then
  echo
  echo "  Aucune demande sur la période. Si c'est inattendu, vérifier :"
  echo "    docker logs --since $FENETRE $VITRINE 2>&1 | grep demande-demo"
fi

echo
echo "  ⚠️ « (page inconnue) » : demande antérieure au 01/09/2026, ou visiteur"
echo "     arrivé directement sur le formulaire. Ce n'est pas une anomalie."

# =============================================================================
# 4. RAPPORT HTML — optionnel, par conteneur jetable
# =============================================================================

if [ "$RAPPORT_HTML" = "oui" ]; then
  titre "Rapport HTML (GoAccess)"
  # ⚠️ Tire une image (~15 Mo) et la garde en cache. Le conteneur, lui, est
  # supprimé (--rm). Rien n'est installé sur l'hôte.
  if docker run --rm -i allinurl/goaccess:latest \
      --log-format=CADDY --no-global-config -o html - < "$ACCES" \
      > /tmp/vitrine-goaccess.html 2>/dev/null; then
    echo "  Écrit dans /tmp/vitrine-goaccess.html"
    echo "  Rapatrier : scp root@<serveur>:/tmp/vitrine-goaccess.html ."
  else
    echo "  ✗ GoAccess n'a pas pu produire le rapport (image ou format)."
    echo "    Le rapport texte ci-dessus reste la référence."
  fi
fi

echo
