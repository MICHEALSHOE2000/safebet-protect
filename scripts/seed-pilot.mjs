// Run only against a separate demo Supabase project. Never prints account secrets.
import {createClient} from '@supabase/supabase-js';
import {Pool} from 'pg';
import {createHmac,randomBytes,createCipheriv} from 'node:crypto';
if(process.env.SAFEBET_DEMO_MODE!=='true')throw Error('Set SAFEBET_DEMO_MODE=true in a separate demo environment.');
const emails=JSON.parse(process.env.PILOT_ACCOUNT_EMAILS||'[]');
if(emails.length!==15||new Set(emails.map(e=>e.toLowerCase())).size!==15||emails.some(e=>!/^\S+@\S+\.\S+$/.test(e)))throw Error('PILOT_ACCOUNT_EMAILS must contain 15 distinct controlled email addresses: ten players, two attendants, manager, two officers.');
if(emails.some(e=>e.toLowerCase()===process.env.ADMIN_EMAIL?.toLowerCase()))throw Error('Keep the administrator separate from pilot role accounts.');
const key=process.env.DATA_ENCRYPTION_KEY,pepper=process.env.IDENTITY_LOOKUP_PEPPER;
if(!/^[a-f0-9]{64}$/i.test(key||'')||!pepper)throw Error('Set independent encryption and lookup secrets first.');
const hash=(kind,value)=>createHmac('sha256',pepper).update(kind+':'+value).digest('hex');
function encrypt(data){const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',Buffer.from(key,'hex'),iv);const bytes=Buffer.concat([cipher.update(JSON.stringify(data)),cipher.final(),cipher.getAuthTag()]);return iv.toString('base64')+'.'+bytes.toString('base64');}
const url=new URL(process.env.DATABASE_URL);for(const k of ['sslmode','sslcert','sslkey','sslrootcert'])url.searchParams.delete(k);
const pool=new Pool({connectionString:url.toString(),ssl:{rejectUnauthorized:true,...(process.env.DATABASE_CA_CERT?{ca:process.env.DATABASE_CA_CERT.replace(/\\n/g,'\n')}:{})}});
const client=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
try{
 const guard=await pool.query('SELECT mode FROM safebet.deployment_guard WHERE singleton=true');
 if(guard.rows[0]?.mode!=='demo'||!process.env.SAFEBET_DEMO_PROJECT_REF||new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname!==process.env.SAFEBET_DEMO_PROJECT_REF+'.supabase.co')throw Error('Demo project isolation and database marker are required before seeding.');
 const existing=[];for(let page=1;;page++){const {data,error}=await client.auth.admin.listUsers({page,perPage:1000});if(error)throw error;existing.push(...data.users);if(data.users.length<1000)break;}
 const users=[];for(const email of emails){let user=existing.find(u=>u.email?.toLowerCase()===email.toLowerCase());if(!user){const {data,error}=await client.auth.admin.createUser({email,email_confirm:true});if(error)throw error;user=data.user;}users.push(user);}
 const connection=await pool.connect();
 try{await connection.query('BEGIN');
 const put=async(kind,id,owner,state,data)=>connection.query('INSERT INTO safebet.live_records(id,kind,owner,state,data) VALUES($1,$2,$3,$4,$5) ON CONFLICT(id) DO NOTHING',[id,kind,owner,state,encrypt(data)]);
 const jurisdictionId='pilot-ikeja',state='Lagos',manager='member-'+hash('account',users[12].id);
 await put('jurisdiction',jurisdictionId,'pilot',state,{name:'Fictional Ikeja LGA pilot',parentState:'Lagos',active:true,minimumAge:18});
 await put('organisation','pilot-regulator','pilot',state,{name:'Fictional Pilot Compliance Office',jurisdictionId});
 for(let i=0;i<2;i++)await put('shop','pilot-shop-'+(i+1),manager,state,{name:'Fictional Shop '+(i?'B':'A'),location:'Fictional Ikeja location '+(i+1),licence:'DEMO-ONLY-'+(i+1),operator:'Fictional Pilot Operator',active:true,jurisdictionId});
 for(let i=0;i<users.length;i++){
  const email=emails[i].toLowerCase(),id='member-'+hash('account',users[i].id),role=i<10?'player':i<12?'shop':i===12?'owner':'regulator';
  await put('access','access-'+hash('email',email),'pilot',state,{email,role,jurisdictionId,shopId:i===10?'pilot-shop-1':i===11?'pilot-shop-2':null});
  if(i<10){const credential='DEMO-'+String.fromCharCode(65+i),customerId='pilot-customer-'+(i+1);const today=new Date();today.setUTCFullYear(today.getUTCFullYear()-16);await put('customer',customerId,id,state,{name:'Fictional Player '+String.fromCharCode(65+i),credential,masked:credential,method:'demo',simulated:true,dateOfBirth:i===1?today.toISOString().slice(0,10):'1990-01-01',verifiedAt:Date.now(),jurisdictionId});await connection.query('INSERT INTO safebet.identity_index VALUES($1,$2,$3) ON CONFLICT DO NOTHING',[hash('demo',credential),customerId,'demo']);}
 }
 await connection.query('COMMIT');console.log('Pilot seeded: 10 fictional players, 2 shops, 2 attendants, 1 manager, 2 officers. Sign in with email codes. Existing records were preserved.');
 }catch(e){await connection.query('ROLLBACK');throw e}finally{connection.release()}
}finally{await pool.end()}
