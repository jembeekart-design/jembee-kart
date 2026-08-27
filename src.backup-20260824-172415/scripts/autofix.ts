import { applyAstFix } from "@/mission-control/autofix/astAutoFix";

async function main() {
  console.log("==================================");
  console.log(" JembeeKart Auto Fix");
  console.log("==================================");

  try {
    const result = await applyAstFix();

    console.log("");
    console.log("Success :", result.success);
    console.log("Modified:", result.modifiedFiles);
    console.log(result.message);

    process.exit(0);
  } catch (err) {
    console.error("Auto Fix failed:");
    console.error(err);
    process.exit(1);
  }
}

main();
