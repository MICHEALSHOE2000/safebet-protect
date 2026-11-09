import { auth, db } from "../../../lib/live";
import { workspaceFailure } from "../../../lib/workspace-errors";
import { assertDeploymentMode } from "../../../lib/deployment-mode";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const u = await auth();
    if (u?.role !== "admin")
      return Response.json(
        { error: "Administrator access required." },
        { status: 403 },
      );
    await assertDeploymentMode();
    await db().prepare("SELECT 1 FROM live_records LIMIT 1").all();
    return Response.json(
      {
        checks: {
          "Database and schema": true,
          "Environment boundary": true,
          "Encryption key format": /^[a-f0-9]{64}$/i.test(
            process.env.DATA_ENCRYPTION_KEY || "",
          ),
          "Lookup pepper": !!process.env.IDENTITY_LOOKUP_PEPPER,
          "Administrator email": !!process.env.ADMIN_EMAIL,
          "Supabase email authentication":
            !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
            !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
          "Private evidence storage credentials":
            !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          "Production identity adapter":
            !!process.env.IDENTITY_PROVIDER_URL &&
            !!process.env.IDENTITY_PROVIDER_TOKEN &&
            process.env.IDENTITY_PROVIDER_APPROVED === "true",
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return workspaceFailure(e, "admin_diagnostics");
  }
}
