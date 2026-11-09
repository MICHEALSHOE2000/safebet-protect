import {rows} from '../../../lib/live';
export async function GET(){try{return Response.json(await rows('resource'),{headers:{'Cache-Control':'no-store'}})}catch{return Response.json([])}}
