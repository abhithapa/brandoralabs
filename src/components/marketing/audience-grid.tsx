import { audiences } from "@/content/audiences";

export function AudienceGrid({ detailed = false, headingLevel = 3 }: { detailed?: boolean; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
      {audiences.map((audience) => (
        <li key={audience.id} id={audience.id} className="border-t-2 border-primary pt-5">
          <Heading className="heading-3">{audience.name}</Heading>
          <p className="mt-2 text-ink-muted">{audience.summary}</p>
          {detailed ? (
            <>
              <p className="mt-4 text-[0.9375rem] font-semibold">Often looking for</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-[0.9375rem] text-ink-muted">
                {audience.typicalNeeds.map((need) => (
                  <li key={need}>{need}</li>
                ))}
              </ul>
            </>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
