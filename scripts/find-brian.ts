import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
  const { db } = await import("../lib/firebase-admin");
  if (!db) process.exit(1);
  const snap = await db.collection("consortium_profiles").get();
  console.log(`consortium_profiles: ${snap.size} docs`);
  for (const d of snap.docs) {
    const x = d.data();
    const docs = Array.isArray(x.readinessDocuments) ? x.readinessDocuments : [];
    console.log(`\n== ${d.id} == status=${x.readinessValidationStatus} docs=${docs.length}`);
    docs.forEach((rd: any) =>
      console.log(`   ${rd.type} | ${rd.status} | ${(rd.value || rd.fileName || rd.textValue || "").toString().slice(0, 80)}`)
    );
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
