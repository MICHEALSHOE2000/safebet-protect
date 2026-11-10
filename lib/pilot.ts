import {db, get, rows, put, fingerprint, encrypt, exclusion, log} from './live';
export const pilotEnabled=()=>process.env.SAFEBET_DEMO_MODE==='true';
export function inJurisdiction(user:any, record:any) {
 return user.role==='admin'||(user.state===record.state && (user.jurisdictionId ? user.jurisdictionId===record.jurisdictionId : !pilotEnabled()));
}
export async function pilotEnrol(user:any, consent:boolean) {
 if(!pilotEnabled()||!['player','shop'].includes(user.role)||consent!==true)throw Error('Fictional enrolment requires demo mode and consent.');
 if(user.role==='player'&&(await rows('customer',user.id)).length)throw Error('Already enrolled.');
 const shop=user.role==='shop'?await get(user.shopId||''):null;if(user.role==='shop'&&(!shop||shop.kind!=='shop'||!shop.active||!inJurisdiction(user,shop)))throw Error('Active assigned shop required.');const jurisdiction=shop?await get(shop.jurisdictionId):(await rows('jurisdiction')).find(j=>j.active);
 if(!jurisdiction)throw Error('The pilot has not been seeded.');
 const credential='DEMO-'+crypto.randomUUID().slice(0,8).toUpperCase(),id='customer-'+crypto.randomUUID();
 const data={name:'Fictional demo adult',method:'demo',masked:credential,credential,dateOfBirth:'1990-01-01',verifiedAt:Date.now(),simulated:true,jurisdictionId:jurisdiction.id};
 await db().batch([db().prepare('INSERT INTO identity_index VALUES (?,?,?)').bind(await fingerprint('demo',credential),id,'demo'),db().prepare('INSERT INTO live_records(id,kind,owner,state,data) VALUES (?,?,?,?,?)').bind(id,'customer',user.role==='player'?user.id:id,jurisdiction.state,await encrypt(data))]);
 await log(user.id,'fictional enrolment',id);return {customerId:id,credential};
}
export function eligibility(customer:any,active:boolean,minimumAge:number,now=new Date()) {
 if(!customer?.verifiedAt||!customer.simulated)return 'VERIFICATION REQUIRED';
 const birth=new Date(customer.dateOfBirth+'T00:00:00Z');
 if(!Number.isFinite(birth.getTime())||birth>now)return 'VERIFICATION REQUIRED';
 const age=now.getUTCFullYear()-birth.getUTCFullYear()-Number(now.getUTCMonth()<birth.getUTCMonth()||(now.getUTCMonth()===birth.getUTCMonth()&&now.getUTCDate()<birth.getUTCDate()));
 if(age<minimumAge)return 'UNDERAGE — DO NOT SERVE';
 return active?'EXCLUDED — DO NOT SERVE':'NO ACTIVE EXCLUSION FOUND';
}
export async function pilotCheck(user:any,body:any) {
 if(!pilotEnabled()||user.role!=='shop')throw Error('Demo checks are unavailable for this account.');
 const shop=await get(user.shopId||'');
 if(!shop||shop.kind!=='shop'||shop.active!==true||!inJurisdiction(user,shop))throw Error('An active assigned pilot shop is required.');
 const jurisdiction=await get(shop.jurisdictionId);
 if(jurisdiction?.kind!=='jurisdiction'||!jurisdiction?.active)throw Error('Pilot jurisdiction is unavailable.');
 const credential=String(body.identifier||'').trim().toUpperCase();
 if(!/^DEMO-[A-Z0-9-]{1,40}$/.test(credential))throw Error('Enter a fictional DEMO player ID. Never enter a NIN.');
 const match:any=await db().prepare('SELECT customer_id FROM identity_index WHERE fingerprint=? AND kind=?').bind(await fingerprint('demo',credential),'demo').first();
 const customer=match?await get(match.customer_id):null;
 const matched=!!customer&&customer.jurisdictionId===shop.jurisdictionId;
 const ex=matched?await exclusion(customer.id):null,at=Date.now(),active=!!ex&&ex.end>at;
 const result=body.identityConfirmed===true&&body.consent===true&&matched?eligibility(customer,active,jurisdiction.minimumAge):'VERIFICATION REQUIRED';
 const id=crypto.randomUUID();
 await put('check',id,user.id,shop.state,{customerId:matched?customer.id:null,shopId:shop.id,jurisdictionId:shop.jurisdictionId,at,active,result,method:'fictional ID + attendant confirmation',refused:false,consentAt:body.consent?at:null});
 await log(user.id,result,id);
 return {id,matched,active,result,at,expires:at+60000};
}
