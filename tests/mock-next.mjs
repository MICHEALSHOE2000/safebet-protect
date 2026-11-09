import {requestContext} from './mock-env.mjs';
export async function headers(){return requestContext.getStore()||new Headers()}
export function redirect(v){throw Error('Redirect '+v)}
