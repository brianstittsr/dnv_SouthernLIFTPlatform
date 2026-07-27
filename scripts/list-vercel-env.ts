import * as dotenv from "dotenv";
import * as path from "path";

function loadAndList(filePath: string) {
  const result = dotenv.config({ path: filePath });
  if (result.error) {
    console.log(`Could not load ${filePath}:`, result.error.message);
    return;
  }

  const keys = Object.keys(process.env).filter((k) => k.startsWith("VERCEL")).sort();
  console.log(`\n${filePath}: ${keys.length} VERCEL_* keys found`);
  for (const key of keys) {
    const value = process.env[key];
    console.log(`  ${key}: ${value ? "set" : "empty"} (${value ? value.length : 0} chars)`);
  }
}

loadAndList(path.resolve(process.cwd(), ".env.local"));
loadAndList(path.resolve(process.cwd(), ".env.vercel"));
loadAndList(path.resolve(process.cwd(), ".env.production"));
