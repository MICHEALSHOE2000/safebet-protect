import { serverClient } from './supabase/server';
export async function getAppUser() {
  const client = await serverClient();
  if (!client) return null;
  // Validate with the auth server; never trust identity headers or cookie contents.
  const {data: {user}, error} = await client.auth.getUser();
  if (error || !user?.email || !user.email_confirmed_at) return null;
  return {userId: user.id, email: user.email, displayName: user.email};
}
