/**
 * Injecte un bloc de données structurées JSON-LD.
 *
 * On utilise <script type="application/ld+json"> plutôt que next/script :
 * le bloc doit être présent dans le HTML initial pour être lu par les
 * robots sans exécution de JavaScript.
 *
 * `null` est accepté et ne rend rien, ce qui permet d'écrire directement
 * <JsonLd data={breadcrumbSchema(path)} /> sans test préalable.
 */
export function JsonLd({ data }: { data: object | null }) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      // Le contenu est généré côté serveur à partir du registre de routes,
      // jamais à partir d'une saisie utilisateur.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
