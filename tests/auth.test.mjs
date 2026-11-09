import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getAppUser} from '../lib/auth-user.ts';
import {verifiedSession} from './mock-supabase.mjs';
import {requestContext} from './mock-env.mjs';
test('forged host identity headers do not authenticate a Vercel request', async()=>{
 const headers=new Headers({'oai-authenticated-user-id':'owner','oai-authenticated-user-email':'admin@example.test'});
 assert.equal(await requestContext.run(headers,()=>getAppUser()),null);
});
test('only a confirmed server-validated email authenticates',async()=>{
 const user={id:'real-id',email:'member@example.test',user_metadata:{role:'admin'}};
 assert.equal(await verifiedSession.run({user},()=>getAppUser()),null);
 assert.equal(await verifiedSession.run({user:{...user,email_confirmed_at:'2026-01-01'},error:new Error('revoked')},()=>getAppUser()),null);
 const valid=await verifiedSession.run({user:{...user,email_confirmed_at:'2026-01-01'}},()=>getAppUser());
 assert.deepEqual(valid,{userId:'real-id',email:user.email,displayName:user.email});
});
