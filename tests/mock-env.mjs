import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {AsyncLocalStorage} from 'node:async_hooks';
export const requestContext=new AsyncLocalStorage();
export const sql=new DatabaseSync(':memory:');
sql.exec("ATTACH DATABASE ':memory:' AS safebet; CREATE TABLE safebet.deployment_guard(singleton boolean PRIMARY KEY,mode text); INSERT INTO safebet.deployment_guard VALUES(true,'production');");
for(const file of readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort())sql.exec(readFileSync(new URL('../drizzle/'+file,import.meta.url),'utf8'));
function prepare(query){let values=[];const s={bind(...a){values=a;return s},async first(){return sql.prepare(query).get(...values)||null},async all(){return {results:sql.prepare(query).all(...values)}},async run(){const r=sql.prepare(query).run(...values);return {success:true,meta:{changes:r.changes}}}};return s}
const files=new Map();export const env={DATA_ENCRYPTION_KEY:'1'.repeat(64),IDENTITY_LOOKUP_PEPPER:'test-only-secret',ADMIN_EMAIL:'admin@example.test',DB:{prepare,async batch(list){sql.exec('BEGIN');try{const r=[];for(const s of list)r.push(await s.run());sql.exec('COMMIT');return r}catch(e){sql.exec('ROLLBACK');throw e}}},BUCKET:{async put(k,v){files.set(k,v)},async get(k){return files.has(k)?{async text(){return files.get(k)}}:null}}};
