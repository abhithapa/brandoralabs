import Link from "next/link";
import { challenges } from "@/content/company";
import { getSolutionTitle } from "@/content/solutions";

/** "What are you trying to do?" — each need leads to the closest solution. */
export function ChallengeList() {
  return (
    <ul className="divide-y divide-line rounded-panel border border-line bg-surface">
      {challenges.map((challenge) => (
        <li key={challenge.need} className="grid gap-2 p-5 md:grid-cols-[1fr_auto] md:items-center md:gap-8 md:p-6">
          <div>
            <h3 className="heading-3">{challenge.need}</h3>
            <p className="mt-1 text-ink-muted">{challenge.detail}</p>
          </div>
          <Link href={`/solutions/${challenge.solution}`} className="text-link whitespace-nowrap font-medium">
            See {getSolutionTitle(challenge.solution)}
          </Link>
        </li>
      ))}
    </ul>
  );
}
