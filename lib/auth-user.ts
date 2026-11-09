import { serverClient } from './supabase/server';
export async function getAppUser() {
  const client = await serverClient();
  if (!client) throw Object.assign(Error('Authentication is not configured.'),{code:'CONFIGURATION_INCOMPLETE'});
  // Validate with the auth server; never trust identity headers or cookie contents.
  const {data: {user}, error} = await client.auth.getUser();
  if(error && error.name!=='AuthSessionMissingError')throw Object.assign(Error('Authentication could not be confirmed.'),{code:'AUTHENTICATION_REQUIRED'});
  if (!user?.email || !user.email_confirmed_at) return null;
  return {userId: user.id, email: user.email, displayName: user.email};
}
