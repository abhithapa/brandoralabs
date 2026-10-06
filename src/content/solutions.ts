import { z } from "zod";
import { SOLUTION_SLUGS, type SolutionSlug } from "@/features/categories";

/**
 * Typed, validated content for the eight solution pages.
 *
 * STATUS: every entry is DRAFT. The prompt lists the eight categories but the
 * capability lists live in Script.docx, which was not supplied. Replace
 * `capabilities` with the source lists verbatim, then set status to "approved".
 * FAQs are empty until approved answers exist; the section is hidden when empty.
 */

const solutionSchema = z.object({
  slug: z.enum(SOLUTION_SLUGS),
  title: z.string().min(2),
  shortDescription: z.string().min(10).max(160),
  overview: z.string().min(20),
  problems: z.array(z.string()).min(1),
  suitableFor: z.array(z.string()).min(1),
  capabilities: z.array(z.string()).min(1),
  approach: z.string().min(20),
  faqs: z.array(z.object({ question: z.string(), answer: z.string() })),
  related: z.array(z.enum(SOLUTION_SLUGS)).max(3),
  status: z.enum(["draft", "approved"]),
});

export type Solution = z.infer<typeof solutionSchema>;

const data: Solution[] = [
  {
    slug: "business-consulting",
    title: "Business Consulting",
    shortDescription: "Clarity on where your business should go next, and a practical plan to get there.",
    overview:
      "When the direction isn't clear, every other investment is a guess. We help you look at the business as a whole, decide what matters most, and turn that into a plan the team can act on.",
    problems: ["Unclear priorities or too many competing ideas", "Growth has stalled and the cause isn't obvious", "Planning a new market, offer or business model"],
    suitableFor: ["Founders shaping a business model", "Owners planning the next stage of growth", "Leadership teams needing an outside view"],
    capabilities: ["Business and growth strategy", "Market and competitor research", "Process review", "Planning and roadmaps"],
    approach: "We start with conversations and data you already have, then agree a short list of priorities before recommending any further work.",
    faqs: [],
    related: ["digital-transformation", "digital-marketing"],
    status: "draft",
  },
  {
    slug: "digital-marketing",
    title: "Digital Marketing",
    shortDescription: "Reach the right audience online and turn their interest into enquiries.",
    overview:
      "Good marketing starts with knowing who you want to reach and what you want them to do. We plan and run digital activity around those goals and report on what is working.",
    problems: ["Not enough of the right people find you", "Spending on ads without clear results", "Inconsistent presence across channels"],
    suitableFor: ["Businesses launching an offer", "Teams without in-house marketing", "Companies expanding to new audiences"],
    capabilities: ["Marketing strategy", "Search engine optimisation", "Social media marketing", "Paid advertising", "Content marketing", "Performance reporting"],
    approach: "We agree goals and measures first, then plan channels and content around them, reviewing results with you on a regular cycle.",
    faqs: [],
    related: ["branding-creative", "website-software-development"],
    status: "draft",
  },
  {
    slug: "branding-creative",
    title: "Branding & Creative",
    shortDescription: "An identity and creative work that make your business recognisable and credible.",
    overview:
      "Your brand is how people recognise and remember you. We help define how the business looks and sounds, and produce the materials that carry it consistently.",
    problems: ["A new business without a clear identity", "A brand that no longer fits the business", "Inconsistent visuals and messaging"],
    suitableFor: ["Startups preparing to launch", "Businesses repositioning", "Teams needing consistent creative materials"],
    capabilities: ["Brand strategy and positioning", "Logo and visual identity", "Brand guidelines", "Graphic design", "Copywriting", "Marketing collateral"],
    approach: "We begin with who you serve and what makes you different, then develop the identity in reviewed stages before producing final assets.",
    faqs: [],
    related: ["digital-marketing", "website-software-development"],
    status: "draft",
  },
  {
    slug: "website-software-development",
    title: "Website & Software Development",
    shortDescription: "Websites and software built around how your customers and team actually work.",
    overview:
      "Whether you need a first website or a custom application, we plan what it has to do, design it with the people who will use it, and build it to be maintained.",
    problems: ["No website, or one that doesn't generate enquiries", "Manual work that software could handle", "An idea for a product that needs building"],
    suitableFor: ["Businesses needing a professional website", "Teams replacing spreadsheets with software", "Founders building a product"],
    capabilities: ["Business websites", "E-commerce", "Web applications", "Mobile applications", "Custom software", "Maintenance and support"],
    approach: "We agree scope and priorities, design before building, and deliver in reviewable stages so you see progress early.",
    faqs: [],
    related: ["cloud-it-solutions", "ai-automation"],
    status: "draft",
  },
  {
    slug: "ai-automation",
    title: "AI & Automation",
    shortDescription: "Less repetitive work, using automation and AI where they genuinely help.",
    overview:
      "Many teams lose hours to tasks a system could do. We identify where automation or AI would make a real difference, then put it in place carefully alongside the people who use it.",
    problems: ["Staff time spent on repetitive tasks", "Data re-entered across several tools", "Interest in AI without a clear use case"],
    suitableFor: ["Teams with manual, high-volume processes", "Businesses connecting several tools", "Organisations exploring AI responsibly"],
    capabilities: ["Process automation", "Workflow and tool integration", "AI-assisted tools", "Chatbots and assistants", "Data and reporting automation"],
    approach: "We map the current process first, start with a contained use case, and expand only once it works reliably.",
    faqs: [],
    related: ["digital-transformation", "website-software-development"],
    status: "draft",
  },
  {
    slug: "cloud-it-solutions",
    title: "Cloud & IT Solutions",
    shortDescription: "Reliable cloud and IT foundations that grow with your business.",
    overview:
      "Infrastructure should be dependable and sized for what you need. We help plan, move to and run cloud and IT environments, and keep them maintained.",
    problems: ["Systems that are slow, fragile or hard to scale", "Unclear or rising infrastructure costs", "No one responsible for IT day to day"],
    suitableFor: ["Businesses moving to the cloud", "Growing teams outgrowing current systems", "Organisations needing managed IT"],
    capabilities: ["Cloud setup and migration", "Hosting and infrastructure", "Business email and collaboration tools", "Backup and recovery", "Managed IT support"],
    approach: "We review what you run today, agree a target setup and plan, and move in steps that keep the business running.",
    faqs: [],
    related: ["cybersecurity", "website-software-development"],
    status: "draft",
  },
  {
    slug: "cybersecurity",
    title: "Cybersecurity",
    shortDescription: "Practical protection for your systems, data and people.",
    overview:
      "Security works best when it fits how the business operates. We help you understand your risks and put sensible protections in place, starting with the most important.",
    problems: ["Unsure how exposed the business is", "Customer or regulatory security expectations", "No plan for responding to an incident"],
    suitableFor: ["Businesses handling customer data", "Teams adopting cloud services", "Organisations formalising security"],
    capabilities: ["Security assessment", "Access and account protection", "Endpoint and network security", "Security awareness", "Incident response planning"],
    approach: "We start with an assessment, agree priorities by risk, and address the most important gaps first.",
    faqs: [],
    related: ["cloud-it-solutions", "digital-transformation"],
    status: "draft",
  },
  {
    slug: "digital-transformation",
    title: "Digital Transformation",
    shortDescription: "Changing how the business works, with technology that supports it.",
    overview:
      "Transformation is about how work gets done, not only which tools you use. We help plan and coordinate changes across processes, systems and teams.",
    problems: ["Processes that depend on paper or manual steps", "Disconnected systems across departments", "Change programmes that lose momentum"],
    suitableFor: ["SMEs modernising operations", "Growing companies standardising ways of working", "Organisations running multi-part change"],
    capabilities: ["Digital strategy and roadmap", "Process redesign", "Systems selection and integration", "Change coordination across teams"],
    approach: "We agree what success looks like, sequence the change into manageable stages, and coordinate the teams and partners involved.",
    faqs: [],
    related: ["business-consulting", "ai-automation"],
    status: "draft",
  },
];

export const solutions: readonly Solution[] = z.array(solutionSchema).parse(data);

const slugs = new Set(solutions.map((solution) => solution.slug));
if (slugs.size !== SOLUTION_SLUGS.length) {
  throw new Error("solutions.ts must contain exactly one entry per solution slug");
}

export function getSolution(slug: string): Solution | undefined {
  return solutions.find((solution) => solution.slug === slug);
}

export function getSolutionTitle(slug: SolutionSlug): string {
  return getSolution(slug)?.title ?? slug;
}
