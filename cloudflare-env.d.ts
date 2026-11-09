declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
DATA_ENCRYPTION_KEY?:string;
IDENTITY_LOOKUP_PEPPER?:string;
ADMIN_EMAIL?:string;
IDENTITY_PROVIDER_URL?:string;
IDENTITY_PROVIDER_TOKEN?:string;
    BUCKET?: R2Bucket;
  }
}
