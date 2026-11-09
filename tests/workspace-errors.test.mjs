import {test} from 'node:test';
import assert from 'node:assert/strict';
import {classifyWorkspaceError,workspaceFailure} from '../lib/workspace-errors.ts';
import {assertDeploymentMode} from '../lib/deployment-mode.ts';
import {sql,env} from './mock-env.mjs';
import {GET} from '../app/api/protect/route.ts';
import {requestContext} from './mock-env.mjs';
test('workspace errors classify failures and never serialize secrets',async()=>{
 for(const [error,code] of [[{code:'42P01'},'DATABASE_SCHEMA_MISSING'],[{code:'ECONNREFUSED'},'DATABASE_UNAVAILABLE'],[{code:'42501'},'PERMISSION_DENIED'],[{message:'Secure storage is not configured.'},'CONFIGURATION_INCOMPLETE'],[{name:'OperationError'},'CONFIGURATION_INCOMPLETE'],[{},'UNEXPECTED_SERVER_ERROR']])assert.equal(classifyWorkspaceError(error),code);
 const old=console.error,logs=[];console.error=v=>logs.push(v);
 try{const r=workspaceFailure({code:'42P01',message:'secret-database-password',stack:'private NIN'},'load_workspace','test-ref');assert.equal(r.status,503);const body=await r.json();assert.equal(body.requestId,'test-ref');assert.equal(body.code,'DATABASE_SCHEMA_MISSING');assert.ok(!JSON.stringify([body,logs]).includes('secret-database-password'));assert.ok(!JSON.stringify([body,logs]).includes('private NIN'));}finally{console.error=old}
});
test('demo flag cannot open a production registry, and demo project reference must match',async()=>{
 process.env.SAFEBET_DEMO_MODE='true';
 try{await assert.rejects(assertDeploymentMode(),{code:'CONFIGURATION_INCOMPLETE'});sql.exec("UPDATE safebet.deployment_guard SET mode='demo'");await assert.rejects(assertDeploymentMode(),{code:'CONFIGURATION_INCOMPLETE'});process.env.SAFEBET_DEMO_PROJECT_REF='demo-test';process.env.NEXT_PUBLIC_SUPABASE_URL='https://demo-test.supabase.co';await assertDeploymentMode();}finally{delete process.env.SAFEBET_DEMO_MODE;delete process.env.SAFEBET_DEMO_PROJECT_REF;delete process.env.NEXT_PUBLIC_SUPABASE_URL;sql.exec("UPDATE safebet.deployment_guard SET mode='production'")}
});
test('bootstrap database failure returns safe diagnostic rather than successful fake data',async()=>{
 const original=env.DB;env.DB={prepare(){throw Object.assign(Error('SQL with confidential data'),{code:'42P01'})}};
 const h=new Headers();h.identity={userId:'bootstrap-failure',email:'fixture@example.test',displayName:'Fixture'};
 try{const r=await requestContext.run(h,()=>GET());assert.equal(r.status,503);const body=await r.json();assert.equal(body.code,'DATABASE_SCHEMA_MISSING');assert.equal(body.user,undefined);assert.ok(body.requestId);assert.ok(!body.error.includes('SQL'));}finally{env.DB=original}
});
