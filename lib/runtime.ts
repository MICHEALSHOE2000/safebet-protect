import { createClient } from '@supabase/supabase-js';
import { database } from './postgres';
function storage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw Error('Private evidence storage is not configured.');
  return createClient(url, key, {auth: {persistSession: false, autoRefreshToken: false}}).storage.from('safebet-evidence');
}
export const env = {
  get IDENTITY_PROVIDER_APPROVED() {return process.env.IDENTITY_PROVIDER_APPROVED;},
  get DATA_ENCRYPTION_KEY() { return process.env.DATA_ENCRYPTION_KEY; },
  get IDENTITY_LOOKUP_PEPPER() { return process.env.IDENTITY_LOOKUP_PEPPER; },
  get ADMIN_EMAIL() { return process.env.ADMIN_EMAIL; },
  get IDENTITY_PROVIDER_URL() { return process.env.IDENTITY_PROVIDER_URL; },
  get IDENTITY_PROVIDER_TOKEN() { return process.env.IDENTITY_PROVIDER_TOKEN; },
  DB: database,
  BUCKET: {
    async put(key: string, value: string) {
      const {error} = await storage().upload(key, Buffer.from(value), {contentType: 'application/octet-stream', upsert: false});
      if (error) throw Error('Evidence storage failed.');
    },
    async get(key: string) {
      const {data, error} = await storage().download(key);
      if (error) throw Error('Evidence storage unavailable.');
      return data;
    },
  },
};
