import {test} from 'node:test';import assert from 'node:assert/strict';
import {GET,POST} from '../app/api/protect/route.ts';import {env,sql,requestContext} from './mock-env.mjs';import {encrypt,decrypt,exclusion} from '../lib/live.ts';
const origin='https://app.example.test';
const admin={id:'owner',email:'admin@example.test'},player={id:'person',email:'person@example.test'},staff={id:'staff',email:'staff@example.test'},lagos={id:'lagos',email:'lagos@example.test'},oyo={id:'oyo',email:'oyo@example.test'};
function headers(u){const h=new Headers();h.identity=u?{userId:u.id,email:u.email,displayName:u.email}:null;return h;}
async function post(u,action,data={},o=origin){const h=headers(u);if(o)h.set('Origin',o);h.set('Content-Type','application/json');return requestContext.run(h,async()=>{const r=await POST(new Request(origin+'/api/protect',{method:'POST',headers:h,body:JSON.stringify({action,...data})}));return {status:r.status,data:await r.json()}})}
async function state(u){return requestContext.run(headers(u),async()=>{const r=await GET();assert.equal(r.status,200);return r.json()})}
test('signed-in identity, provider gates, private lookup, exclusions and state case boundaries',async()=>{
assert.equal((await state()).user,null);assert.equal((await post(null,'exclude',{days:90,consent:true})).status,401);
assert.equal((await post(player,'login',{role:'admin'})).status,410);assert.equal((await state(player)).user.role,'player');assert.equal((await post(player,'assign',{email:player.email,role:'admin',state:'Lagos'})).status,400);
assert.equal((await post(admin,'addShop',{name:'Fixture outlet',location:'Test location',state:'Lagos',licence:'TEST'})).status,200);const shop=(await state(admin)).shops[0];
for(const [u,role,stateName] of [[staff,'shop','Lagos'],[lagos,'regulator','Lagos'],[oyo,'regulator','Oyo']])assert.equal((await post(admin,'assign',{email:u.email,role,state:stateName,shopId:shop.id})).status,200);
const nin='12345678901',enrol={kind:'nin',identifier:nin,fullName:'Fixture Person',dateOfBirth:'1990-01-01',state:'Lagos',consent:true};
const blocked=await post(player,'enrol',enrol);assert.equal(blocked.status,400);assert.match(blocked.data.error,/not connected/);assert.equal((await state(player)).customer,null);
env.IDENTITY_PROVIDER_URL='https://identity.example.test';env.IDENTITY_PROVIDER_TOKEN='test-only';const oldFetch=globalThis.fetch;globalThis.fetch=async()=>Response.json({verified:true,identityMatched:true,method:'nin',subjectId:'provider-fixture-person'});
try{assert.equal((await post(player,'enrol',enrol)).status,200);const p=await state(player);assert.equal(p.customer.masked,'NIN ••••8901');assert.equal(p.customer.identifier,undefined);const stored=JSON.stringify(sql.prepare('SELECT * FROM live_records').all())+JSON.stringify(sql.prepare('SELECT * FROM identity_index').all());assert.ok(!stored.includes(nin));assert.ok(!stored.includes('Fixture Person'));
const start=await post(player,'exclude',{days:90,consent:true,end:1});assert.equal(start.status,200);assert.ok(start.data.end>Date.now()+89*86400000);
assert.equal((await post(staff,'exclude',{days:1,consent:true})).status,400);assert.equal((await post(admin,'extend',{days:30,consent:true})).status,400);
const checked=await post(staff,'verify',{kind:'nin',identifier:nin,consent:true,identityConfirmed:true});assert.equal(checked.data.active,true);assert.equal(checked.data.customerId,undefined);assert.equal((await post(staff,'refuse',{id:checked.data.id})).status,200);
const sd=await state(staff);assert.equal(sd.assessment,undefined);assert.equal(sd.complaints,undefined);assert.equal(sd.checks[0].customerId,undefined);
const extended=await post(staff,'extend',{checkId:checked.data.id,days:30,consent:true});assert.equal(extended.data.end,start.data.end+30*86400000);
const unknown=await post(staff,'verify',{kind:'nin',identifier:'99999999999',consent:true,identityConfirmed:true});assert.equal(unknown.data.matched,false);assert.equal(unknown.data.active,undefined);
const report=await post(player,'report',{state:'Lagos',shopName:'Fixture outlet',location:'Fixture location',description:'Test allegation',incidentDate:'2026-11-09T08:00',category:'Privacy concern'});assert.equal(report.status,200);assert.ok((await state(lagos)).complaints.some(c=>c.id===report.data.id));assert.equal((await state(oyo)).complaints.length,0);
assert.equal((await post(oyo,'updateCase',{id:report.data.id,status:'Resolved'})).status,403);assert.equal((await post(lagos,'updateCase',{id:report.data.id,status:'Under Review'})).status,200);assert.equal((await state(player)).complaints[0].status,'Under Review');
assert.equal((await post(admin,'reset')).status,410);assert.equal((await post(player,'exclude',{days:1,consent:true})).status,400);
const before=await exclusion(p.customer.id);await Promise.all([post(player,'extend',{days:180,consent:true}),post(player,'extend',{days:7,consent:true})]);assert.ok((await exclusion(p.customer.id)).end>before.end);
}finally{globalThis.fetch=oldFetch}});
test('cross-origin requests and rejected identity responses fail closed',async()=>{assert.equal((await post(player,'exclude',{},'https://attacker.test')).status,403);assert.equal((await post(player,'exclude',{},null)).status,403);const old=globalThis.fetch;globalThis.fetch=async()=>Response.json({verified:false});try{const r=await post({id:'new',email:'new@example.test'},'enrol',{kind:'nin',identifier:'11111111111',fullName:'Test Rejected',state:'Lagos',consent:true});assert.equal(r.status,400);assert.match(r.data.error,/could not be confirmed/)}finally{globalThis.fetch=old}});
test('encrypted evidence-sized payload round trip',async()=>{const v={content:'x'.repeat(2*1024*1024)},cipher=await encrypt(v);assert.ok(!cipher.includes('x'.repeat(100)));assert.deepEqual(await decrypt(cipher),v)});

test('evidence remains private to the reporter and their state regulator',async()=>{
 const {POST:upload,GET:download}=await import('../app/api/evidence/route.ts');
 const c=(await state(player)).complaints[0];
 const form=new FormData();form.set('caseId',c.id);form.set('file',new File(['private evidence fixture'],'fixture.pdf',{type:'application/pdf'}));
 const h=headers(player);h.set('Origin',origin);
 const result=await requestContext.run(h,()=>upload(new Request(origin+'/api/evidence',{method:'POST',headers:h,body:form})));
 assert.equal(result.status,200);
 const evidence=(await state(player)).complaints[0].evidence[0];
 const url=origin+'/api/evidence?case='+encodeURIComponent(c.id)+'&key='+encodeURIComponent(evidence.key);
 async function read(u){return requestContext.run(headers(u),()=>download(new Request(url)));}
 assert.equal((await read(staff)).status,403);
 assert.equal((await read(oyo)).status,403);
 assert.equal((await read(null)).status,403);
 const ownerDownload=await read(player);assert.equal(ownerDownload.status,200);assert.equal(ownerDownload.headers.get('Cache-Control'),'no-store');
 assert.equal(await ownerDownload.text(),'private evidence fixture');
 assert.equal((await read(lagos)).status,200);
});
