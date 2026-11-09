import { db } from "./live";
export async function assertDeploymentMode() {
  const expected =
    process.env.SAFEBET_DEMO_MODE === "true" ? "demo" : "production";
  const marker = await db()
    .prepare("SELECT mode FROM safebet.deployment_guard WHERE singleton=true")
    .first<{ mode: string }>();
  if (marker?.mode !== expected)
    throw Object.assign(
      Error("Database deployment mode does not match this application."),
      { code: "CONFIGURATION_INCOMPLETE" },
    );
  if (expected === "demo") {
    const ref = process.env.SAFEBET_DEMO_PROJECT_REF;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!ref || !url || new URL(url).hostname !== `${ref}.supabase.co`)
      throw Object.assign(Error("Demo project isolation is not configured."), {
        code: "CONFIGURATION_INCOMPLETE",
      });
  }
}
