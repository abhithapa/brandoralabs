import Link from "next/link";
import { solutions } from "@/content/solutions";

/** All eight solutions as a two-column index rather than a wall of cards. */
export function SolutionIndex({ headingLevel = 3 }: { headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <ul className="grid border-t border-line md:grid-cols-2 md:gap-x-12">
      {solutions.map((solution) => (
        <li key={solution.slug} className="border-b border-line">
          <Link href={`/solutions/${solution.slug}`} className="group block py-6">
            <Heading className="heading-3 group-hover:text-primary group-hover:underline group-hover:underline-offset-4">
              {solution.title}
            </Heading>
            <p className="mt-2 text-ink-muted">{solution.shortDescription}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
