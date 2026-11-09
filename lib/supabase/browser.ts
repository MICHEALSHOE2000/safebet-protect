import { createBrowserClient } from '@supabase/ssr';
export function browserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw Error('Account setup is pending. Please contact the administrator.');
  return createBrowserClient(url, key);
}
