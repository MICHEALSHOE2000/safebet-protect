import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';
test('PostgreSQL refuses fictional identities in production and locks nonempty environments',async()=>{
 const pg=new PGlite();
 try{
 await pg.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE SCHEMA storage; CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);');
 for(const file of ['001_safebet.sql','002_environment_boundary.sql','002_environment_boundary.sql'])await pg.exec(readFileSync(new URL('../supabase/migrations/'+file,import.meta.url),'utf8'));
 await assert.rejects(pg.query("INSERT INTO safebet.identity_index VALUES('demo-fingerprint','fictional','demo')"),/mismatch/);
 await pg.exec("UPDATE safebet.deployment_guard SET mode='demo'; INSERT INTO safebet.identity_index VALUES('demo-fingerprint','fictional','demo')");
 await assert.rejects(pg.exec("INSERT INTO safebet.identity_index VALUES('real-fingerprint','real','nin')"),/mismatch/);
 await assert.rejects(pg.exec("UPDATE safebet.deployment_guard SET mode='production'"),/Cannot change/);
 await assert.rejects(pg.exec('DELETE FROM safebet.deployment_guard'),/Cannot change/);
 assert.equal((await pg.query("SELECT has_table_privilege('anon','safebet.deployment_guard','SELECT') AS allowed")).rows[0].allowed,false);
 }finally{await pg.close()}
});
