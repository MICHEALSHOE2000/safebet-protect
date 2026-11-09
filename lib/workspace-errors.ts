export type WorkspaceCode =
  | "AUTHENTICATION_REQUIRED"
  | "ACCOUNT_SETUP_INCOMPLETE"
  | "DATABASE_UNAVAILABLE"
  | "DATABASE_SCHEMA_MISSING"
  | "PERMISSION_DENIED"
  | "CONFIGURATION_INCOMPLETE"
  | "UNEXPECTED_SERVER_ERROR";
const messages: Record<WorkspaceCode, string> = {
  AUTHENTICATION_REQUIRED:
    "Your session could not be confirmed. Sign in again to continue.",
  ACCOUNT_SETUP_INCOMPLETE:
    "Your account setup needs attention. Ask the pilot administrator to check your assignment.",
  DATABASE_UNAVAILABLE:
    "We cannot reach the protection registry. Please retry. Shop staff must not proceed without verification.",
  DATABASE_SCHEMA_MISSING:
    "The protection registry needs a database update. Contact the pilot administrator with this reference.",
  PERMISSION_DENIED: "Your account does not have access to this operation.",
  CONFIGURATION_INCOMPLETE:
    "This environment is not ready yet. Ask the administrator to check its secure configuration.",
  UNEXPECTED_SERVER_ERROR:
    "We could not complete this request. Please retry or share this reference with the administrator.",
};
export function classifyWorkspaceError(error: unknown): WorkspaceCode {
  const e = error as { code?: string; message?: string; name?: string };
  if (e?.code && e.code in messages) return e.code as WorkspaceCode;
  if (["42P01", "3F000", "42703"].includes(e?.code || ""))
    return "DATABASE_SCHEMA_MISSING";
  if (["42501", "28000", "28P01"].includes(e?.code || ""))
    return "PERMISSION_DENIED";
  if (
    /^(08|53|57P)/.test(e?.code || "") ||
    ["ECONNREFUSED", "ENOTFOUND", "ETIMEDOUT", "ECONNRESET"].includes(
      e?.code || "",
    ) ||
    /connection|timeout|certificate|TLS/i.test(e?.message || "")
  )
    return "DATABASE_UNAVAILABLE";
  if (
    /not configured|Secure storage|Secure lookup|deployment mode|project isolation/i.test(
      e?.message || "",
    ) ||
    e?.name === "OperationError"
  )
    return "CONFIGURATION_INCOMPLETE";
  return "UNEXPECTED_SERVER_ERROR";
}
export function workspaceFailure(
  error: unknown,
  operation: string,
  requestId = crypto.randomUUID(),
) {
  const code = classifyWorkspaceError(error);
  const diagnostic = (error as { code?: string })?.code;
  // Never serialize exceptions: pg errors can contain SQL, identifiers and values.
  console.error(
    JSON.stringify({
      event: "workspace_failure",
      requestId,
      operation,
      code,
      diagnostic:
        diagnostic && /^[A-Z0-9_]{2,40}$/.test(diagnostic)
          ? diagnostic
          : undefined,
    }),
  );
  return Response.json(
    {
      error: messages[code],
      code,
      requestId,
      retryable:
        code === "DATABASE_UNAVAILABLE" || code === "UNEXPECTED_SERVER_ERROR",
    },
    {
      status:
        code === "AUTHENTICATION_REQUIRED"
          ? 401
          : code === "PERMISSION_DENIED"
            ? 403
            : 503,
      headers: { "Cache-Control": "no-store", "X-Request-ID": requestId },
    },
  );
}
