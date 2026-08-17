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
          <svg width="52" height="52" viewBox="0 0 100 100">
            <mask id="og-mark">
              <path fill="#fff" d="M50 3 L98 96 L2 96 Z" />
              <path fill="#000" d="M50 38 L76 90 L24 90 Z" />
              <path fill="#000" d="M28 46 L53 96 L42 96 L22 55 Z" />
            </mask>
            <rect width="100" height="100" fill="#F2C200" mask="url(#og-mark)" />
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
