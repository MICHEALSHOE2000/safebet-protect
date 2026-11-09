import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {createDatabase} from '../lib/postgres.ts';
import {env} from './mock-env.mjs';
import {put,get,limit,enroll,exclusion,saveExclusion} from '../lib/live.ts';

test('Postgres migration, encrypted records, atomic enrolment and exclusions',async()=>{
 const pg=new PGlite();
 await pg.exec("CREATE ROLE anon; CREATE ROLE authenticated; CREATE SCHEMA storage; CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);");
 const migration=readFileSync(new URL('../supabase/migrations/001_safebet.sql',import.meta.url),'utf8');
 await pg.exec(migration);
 await pg.exec(migration); // safe to apply again
 const query=async(sql,values)=>{const r=await pg.query(sql,values);return {rows:r.rows,rowCount:r.affectedRows??r.rows.length};};
 const db=createDatabase(()=>({query,connect:async()=>({query,release(){}})}));
 const original=env.DB;env.DB=db;
 const fetchBefore=globalThis.fetch;
 try {
  await put('customer','c1','owner1','Lagos',{name:'Private customer'});
  await put('customer','c1','owner1','Lagos',{name:'Updated private customer'});
  assert.equal((await get('c1')).version,2);
  assert.equal((await get('c1')).name,'Updated private customer');
  const raw=(await pg.query('SELECT data FROM safebet.live_records')).rows[0].data;
  assert.ok(!raw.includes('Private customer'));
  await limit('owner1','check',1);
  await assert.rejects(limit('owner1','check',1),/Too many/);
  const first=await saveExclusion('c1',90,false);
  assert.equal(typeof (await exclusion('c1')).end,'number');
  assert.equal((await saveExclusion('c1',7,true)).end,first.end+7*86400000);
  await assert.rejects(saveExclusion('c1',1,false),/active/);
  // A stale version cannot overwrite a newer exclusion or shorten its period.
  const stale=await db.prepare('INSERT INTO live_exclusions(customer_id,start,end,version) VALUES (?,?,?,1) ON CONFLICT(customer_id) DO UPDATE SET start=excluded.start,end=excluded.end,version=live_exclusions.version+1 WHERE live_exclusions.version=? AND excluded.end>live_exclusions.end').bind('c1',first.start,first.end+20*86400000,1).run();
  assert.equal(stale.meta.changes,0);
  // Any failed statement rolls back all writes in an enrolment transaction.
  await assert.rejects(db.batch([
   db.prepare('INSERT INTO identity_index VALUES (?,?,?)').bind('alias','c1','nin'),
   db.prepare('INSERT INTO identity_index VALUES (?,?,?)').bind('alias','c2','nin'),
  ]));
  assert.equal(await db.prepare('SELECT * FROM identity_index WHERE fingerprint=?').bind('alias').first(),null);
  env.IDENTITY_PROVIDER_APPROVED='true';env.IDENTITY_PROVIDER_URL='https://identity.example.test';env.IDENTITY_PROVIDER_TOKEN='test-only';
  globalThis.fetch=async()=>Response.json({verified:true,adultVerified:true,identityMatched:true,method:'nin',subjectId:'subject-1'});
  const enrolled=await enroll({id:'p1',role:'player'},{kind:'nin',identifier:'12345678901',fullName:'Test Person',dateOfBirth:'1990-01-01',state:'Lagos',consent:true});
  assert.equal((await get(enrolled.customerId)).masked,'NIN ••••8901');
  const indexes=(await pg.query('SELECT * FROM safebet.identity_index')).rows;
  assert.equal(indexes.length,2);
  await assert.rejects(enroll({id:'p2',role:'player'},{kind:'nin',identifier:'12345678901',fullName:'Test Person',state:'Lagos',consent:true}),/already exists/);
  assert.equal((await pg.query("SELECT has_schema_privilege('anon','safebet','USAGE') AS allowed")).rows[0].allowed,false);
 } finally {env.DB=original;globalThis.fetch=fetchBefore;await pg.close();}
});
