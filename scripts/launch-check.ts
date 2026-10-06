/**
 * Fails (exit 1) while launch inputs are missing. Run in CI before promoting a
 * build to production. Does not need a database or secrets.
 */
import { getLaunchIssues } from "../src/config/site";
import { solutions } from "../src/content/solutions";

const issues = getLaunchIssues();
const draftSolutions = solutions.filter((solution) => solution.status !== "approved").map((solution) => solution.slug);
if (draftSolutions.length > 0) issues.push(`Draft solution content: ${draftSolutions.join(", ")}`);

if (issues.length > 0) {
  console.error("Launch check failed — not ready for production:\n" + issues.map((issue) => `  - ${issue}`).join("\n"));
  process.exit(1);
}
console.info("Launch check passed.");
