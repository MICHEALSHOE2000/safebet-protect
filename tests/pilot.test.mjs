import {PGlite} from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';
import {createDatabase} from '../lib/postgres.ts';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {GET,POST} from '../app/api/protect/route.ts';
import {POST as complaint} from '../app/api/complaints/route.ts';
import {requestContext,sql,env} from './mock-env.mjs';
import {put,get,fingerprint,db,saveExclusion} from '../lib/live.ts';
import {eligibility} from '../lib/pilot.ts';
const origin='https://pilot.example.test';
const player={id:'player-a',email:'a@example.test'},staffA={id:'staff-a',email:'staff-a@example.test'},staffB={id:'staff-b',email:'staff-b@example.test'},officer={id:'officer',email:'officer@example.test'},outsider={id:'outsider',email:'outsider@example.test'};
function context(user){const h=new Headers({'Origin':origin});h.identity=user?{userId:user.id,email:user.email,displayName:user.email}:null;return h;}
async function call(user,body,handler=POST){const h=context(user);return requestContext.run(h,async()=>{const r=await handler(new Request(origin+'/api/protect',{method:'POST',headers:h,body:JSON.stringify(body)}));return {status:r.status,data:await r.json()}})}
async function state(user){return requestContext.run(context(user),async()=>{const r=await GET();assert.equal(r.status,200);return r.json()})}
test('persisted pilot: two shops, underage refusal, anonymous tracking and LGA isolation',async()=>{
 process.env.SAFEBET_DEMO_MODE='true';process.env.SAFEBET_DEMO_PROJECT_REF='test-project';process.env.NEXT_PUBLIC_SUPABASE_URL='https://test-project.supabase.co';sql.exec("UPDATE safebet.deployment_guard SET mode='demo'");
 const pg=new PGlite();await pg.exec("CREATE ROLE anon; CREATE ROLE authenticated; CREATE SCHEMA storage; CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);");
 for(const file of ['001_safebet.sql','002_environment_boundary.sql'])await pg.exec(readFileSync(new URL('../supabase/migrations/'+file,import.meta.url),'utf8'));
 await pg.exec("UPDATE safebet.deployment_guard SET mode='demo'");
 const originalDb=env.DB;const query=async(sql,values)=>{const r=await pg.query(sql,values);return {rows:r.rows,rowCount:r.affectedRows??r.rows.length}};env.DB=createDatabase(()=>({query,connect:async()=>({query,release(){}})}));
 try{
 await put('jurisdiction','pilot-ikeja','pilot','Lagos',{name:'Fictional Ikeja',active:true,minimumAge:18});
 for(const [u,role,shopId,jurisdictionId] of [[player,'player',null,'pilot-ikeja'],[staffA,'shop','shop-a','pilot-ikeja'],[staffB,'shop','shop-b','pilot-ikeja'],[officer,'regulator',null,'pilot-ikeja'],[outsider,'regulator',null,'pilot-other']])await put('access','access-'+await fingerprint('email',u.email),'pilot','Lagos',{email:u.email,role,shopId,jurisdictionId});
 for(const id of ['shop-a','shop-b'])await put('shop',id,'manager','Lagos',{name:id,location:'Fictional address',active:true,jurisdictionId:'pilot-ikeja'});
 const owner='member-'+await fingerprint('account',player.id);
 for(const [id,credential,birth] of [['customer-a','DEMO-A','1990-01-01'],['customer-b','DEMO-B','2015-01-01']]){await put('customer',id,id==='customer-a'?owner:id,'Lagos',{name:'Fictional only',simulated:true,dateOfBirth:birth,verifiedAt:Date.now(),jurisdictionId:'pilot-ikeja'});await db().prepare('INSERT INTO identity_index VALUES (?,?,?)').bind(await fingerprint('demo',credential),id,'demo').run()}
 const check=(u,id='DEMO-A',identityConfirmed=true)=>call(u,{action:'verify',identifier:id,identityConfirmed,consent:true});
 assert.equal((await check(player)).status,400);
 assert.equal((await check(staffA)).data.result,'NO ACTIVE EXCLUSION FOUND');
 assert.equal((await call(player,{action:'exclude',days:180,consent:true})).status,200);
 for(const user of [staffA,staffB]){const r=await check(user);assert.equal(r.data.result,'EXCLUDED — DO NOT SERVE');assert.equal(r.data.customerId,undefined);assert.equal((await call(user,{action:'refuse',id:r.data.id})).status,200)}
 assert.equal((await state(player)).exclusion.end>(Date.now()+179*86400000),true);
 const minor=await check(staffB,'DEMO-B');assert.equal(minor.data.result,'UNDERAGE — DO NOT SERVE');assert.equal((await call(staffB,{action:'refuse',id:minor.data.id})).status,200);
 assert.equal((await check(staffA,'DEMO-UNKNOWN')).data.result,'VERIFICATION REQUIRED');
 assert.equal((await check(staffA,'DEMO-A',false)).data.result,'VERIFICATION REQUIRED');
 assert.equal((await state(outsider)).checks.length,0);assert.equal((await state(outsider)).stats.active,0);
 const visible=await state(officer);assert.equal(visible.checks.length,6);assert.equal(new Set(visible.checks.map(c=>c.shopId)).size,2);
 const report=await call(null,{shopId:'shop-b',description:'Fictional allegation for integration testing.',incidentDate:'2026-11-09',fictional:true},complaint);assert.equal(report.status,201);
 assert.equal((await state(officer)).complaints.length,1);assert.equal((await state(outsider)).complaints.length,0);
 assert.equal((await call(outsider,{action:'updateCase',id:report.data.reference,status:'Resolved'})).status,403);
 assert.equal((await call(officer,{action:'updateCase',id:report.data.reference,status:'Under Review',assignedTo:'access-'+await fingerprint('email',officer.email)})).status,200);
 const tracked=await call(null,{action:'track',...report.data},complaint);assert.equal(tracked.data.status,'Under Review');assert.deepEqual(Object.keys(tracked.data).sort(),['reference','status','updated']);
 assert.equal((await call(null,{action:'track',reference:report.data.reference,secret:'wrong'},complaint)).status,404);
 assert.equal((await call(player,{action:'enrol',kind:'nin',identifier:'12345678901'})).status,400);
 const indefinite=await call(player,{action:'extend',days:0,consent:true});assert.equal(indefinite.data.end,253402300799000);assert.equal((await call(player,{action:'extend',days:1,consent:true})).status,400);
 await put('shop','shop-a','manager','Lagos',{name:'shop-a',active:false,jurisdictionId:'pilot-ikeja'});assert.equal((await check(staffA)).status,400);
 }finally{env.DB=originalDb;await pg.close();delete process.env.SAFEBET_DEMO_MODE}
});
test('age decision uses the birthday and rejects unverified identities',()=>{
 const c={simulated:true,verifiedAt:1,dateOfBirth:'2008-11-10'};
 assert.equal(eligibility(c,false,18,new Date('2026-11-09')),'UNDERAGE — DO NOT SERVE');
 assert.equal(eligibility(c,false,18,new Date('2026-11-10')),'NO ACTIVE EXCLUSION FOUND');
 assert.equal(eligibility({...c,simulated:false},false,18),'VERIFICATION REQUIRED');
});
