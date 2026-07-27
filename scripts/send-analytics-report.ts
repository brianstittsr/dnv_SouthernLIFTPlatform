import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env.local and .env.production
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.production") });

import { generateAndSendReport } from "../lib/analytics-report";

const RECIPIENT = process.argv[2] || "brianstittsr@gmail.com";
const DAYS = parseInt(process.argv[3] || "7", 10);
const PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const ENVIRONMENT = process.env.VERCEL_ENVIRONMENT || "production";

async function main() {
  if (!PROJECT_ID) {
    console.error("VERCEL_PROJECT_ID is not set in .env.local");
    process.exit(1);
  }

  console.log(`Generating analytics report for ${PROJECT_ID} (${ENVIRONMENT})...`);
  console.log(`Recipient: ${RECIPIENT} | Days: ${DAYS}`);

  try {
    const result = await generateAndSendReport([RECIPIENT], DAYS, PROJECT_ID, ENVIRONMENT, {
      includePdf: false,
    });

    console.log("Report sent successfully.");
    console.log("Message ID:", result.messageId || "N/A");
    console.log("Visitors:", result.report.totalVisitors.toLocaleString());
    console.log("Pageviews:", result.report.totalPageviews.toLocaleString());
    console.log("Report range:", result.report.from, "→", result.report.to);
  } catch (error) {
    console.error("Failed to send report:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
