export const runtime='nodejs';
export const dynamic='force-dynamic';
import {get,rows,put,limit,fingerprint,log} from '../../../lib/live';
import {pilotEnabled} from '../../../lib/pilot';
const json=(v:any,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(){try{return json({shops:(await rows('shop')).filter(s=>s.active!==false).map(s=>({id:s.id,name:s.name,state:s.state,jurisdictionId:s.jurisdictionId}))})}catch{return json({error:'Reporting service unavailable.'},503)}}
export async function POST(req:Request){
 try{
  if(req.headers.get('origin')!==new URL(req.url).origin)return json({error:'Invalid origin.'},403);
  const raw=await req.text();if(raw.length>10000)return json({error:'Request too large.'},413);
  const body=JSON.parse(raw);
  // Vercel supplies this header. Shared fallback limits unconfigured deployments too.
  const actor=await fingerprint('public-ip',req.headers.get('x-vercel-forwarded-for')||'shared');
  await limit(actor,'public-complaints',10);
  if(body.action==='track'){
   const c=await get(String(body.reference||''));
   if(!c?.trackingHash||typeof body.secret!=='string'||c.trackingHash!==await fingerprint('tracking',body.secret))return json({error:'Reference or private tracking key is incorrect.'},404);
   return json({reference:c.id,status:c.status,updated:c.updates.at(-1)?.at});
  }
  const shop=await get(String(body.shopId||''));
  if(!shop||shop.kind!=='shop'||shop.active===false||typeof body.description!=='string'||body.description.trim().length<10||body.description.length>3000||!/^\d{4}-\d{2}-\d{2}$/.test(body.incidentDate||''))return json({error:'Choose a shop, incident date and description (10–3000 characters).'},400);
  if(pilotEnabled()&&body.fictional!==true)return json({error:'Confirm that this report uses fictional information.'},400);
  const id='SB-'+crypto.randomUUID(),secret=crypto.randomUUID()+crypto.randomUUID(),at=Date.now();
  await put('complaint',id,'anonymous',shop.state,{shopId:shop.id,shopName:shop.name,location:shop.location,jurisdictionId:shop.jurisdictionId,description:body.description.trim(),incidentDate:body.incidentDate,category:'Public protection concern',confidential:true,status:'Submitted',created:at,evidence:[],trackingHash:await fingerprint('tracking',secret),updates:[{status:'Submitted',at,note:'Platform allegation received; no finding or external notification.'}]});
  await log('anonymous','complaint submitted',id);
  return json({reference:id,secret},201);
 }catch{return json({error:'Unable to complete this request. Please retry later.'},503)}
}
