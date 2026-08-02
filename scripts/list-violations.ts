
import { governanceEngine } from "@/jembee-governance";

async function main() {
  const report = await governanceEngine.run();
  console.log("\n--- CRITICAL VIOLATIONS (TOP 20) ---\n");
  const criticals = report.violations.filter(v => v.severity === "CRITICAL");
  criticals.slice(0, 20).forEach((v, i) => {
    console.log(`${i+1}. [${v.category}] ${v.title}`);
    console.log(`   File: ${v.filePath}`);
    console.log(`   Description: ${v.description}`);
    console.log(`   Actual: ${v.actualValue}`);
    console.log(`   Recommendation: ${v.recommendation}`);
    console.log("");
  });
}

main().catch(console.error);
