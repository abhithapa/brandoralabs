import { advantages } from "@/content/company";

export function AdvantageList() {
  return (
    <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
      {advantages.map((item) => (
        <div key={item.title}>
          <dt className="heading-3">{item.title}</dt>
          <dd className="mt-2 text-ink-muted">{item.detail}</dd>
        </div>
      ))}
    </dl>
  );
}
