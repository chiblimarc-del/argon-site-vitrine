import { ImageResponse } from "next/og";

/**
 * ⚠️ `dynamic = "force-static"` est OBLIGATOIRE avec `output: "export"` :
 * sans lui, le build échoue sur cette route. Il déclare explicitement que le
 * fichier est calculé une fois au build, jamais à la requête.
 */
export const dynamic = "force-static";


/**
 * Image Open Graph par défaut du site (partages LinkedIn, X, Slack…).
 * Générée par code plutôt que stockée en PNG : pas de binaire à maintenir,
 * et elle reste alignée sur la charte si les couleurs évoluent.
 *
 * Une page peut la surcharger en déclarant son propre opengraph-image.
 */
export const alt = "Argon — Logiciel de gestion des interventions terrain";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#050818",
          padding: 80,
          fontFamily: "sans-serif",
        }}
      >
        {/* Marque */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* Tracé officiel de la charte. L'ancien était une reconstruction
              géométrique dont l'entaille détachait la jambe gauche : c'est
              cette marque-là qui partait dans les aperçus LinkedIn et
              WhatsApp. Vérifié en rendant le composant avec Satori, le moteur
              qui compose réellement cette image. */}
          <svg width="52" height="54" viewBox="0 0 84.359 87.418">
            <path fill="#F1C400" fillRule="nonzero" d="M36.453 49.215L42.137 37.414L58.48 71.16L33.043 71.16L25.262 87.418L84.359 87.418L42.137 0L0 87.418L18.008 87.418Z" />
          </svg>
          <div
            style={{
              fontSize: 34,
              fontWeight: 600,
              color: "#F2F4FF",
              letterSpacing: 5,
            }}
          >
            ARGON
          </div>
        </div>

        {/* Accroche */}
        <div
          style={{
            display: "flex",
            fontSize: 62,
            fontWeight: 600,
            color: "#F2F4FF",
            lineHeight: 1.15,
            letterSpacing: -1.5,
            maxWidth: 900,
          }}
        >
          Pilotez vos opérations terrain depuis une seule plateforme.
        </div>

        {/* Filet + sous-titre */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", height: 3, width: 140, background: "#5B5BF5" }} />
          <div style={{ display: "flex", fontSize: 26, color: "#A3AAC9" }}>
            Interventions · Planning · Suivi terrain · Rapports
          </div>
        </div>
      </div>
    ),
    size,
  );
}
