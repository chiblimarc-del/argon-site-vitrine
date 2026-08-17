import { Section, SectionHeading } from "@/components/ui/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSchema } from "@/lib/seo";

/**
 * FAQ d'une page solution.
 *
 * Deux règles, issues du cahier V2 §22 :
 *   1. Les questions doivent correspondre à ce que les gens demandent
 *      réellement, pas être fabriquées pour décrocher un rich snippet.
 *   2. Les réponses doivent correspondre aux fonctionnalités réelles.
 *
 * Le composant émet lui-même le JSON-LD `FAQPage` à partir des mêmes données
 * qu'il affiche : le contenu structuré et le contenu visible ne peuvent pas
 * diverger, ce que Google sanctionne.
 *
 * Balisage `<details>` natif : ouverture sans JavaScript, accessible au
 * clavier, indexable — le contenu des `<details>` fermés est bien lu par
 * Google.
 */
export type QuestionFaq = { question: string; answer: string };

export function SolutionFaq({
  items,
  titre = "Questions fréquentes",
}: {
  items: QuestionFaq[];
  titre?: string;
}) {
  if (!items.length) return null;

  return (
    <Section tone="alt">
      <SectionHeading as="h2" title={titre} className="max-w-2xl" />

      <div className="mt-10 max-w-3xl divide-y divide-line-soft border-y border-line-soft">
        {items.map((item) => (
          <details key={item.question} className="group py-5">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-[16px] font-medium text-ink marker:content-none">
              {item.question}
              <span
                aria-hidden="true"
                className="mt-1 shrink-0 text-ink-muted transition-transform duration-200 group-open:rotate-45"
              >
                <svg viewBox="0 0 16 16" className="h-4 w-4">
                  <path
                    d="M8 3v10M3 8h10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </summary>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
              {item.answer}
            </p>
          </details>
        ))}
      </div>

      <JsonLd data={faqSchema(items)} />
    </Section>
  );
}
