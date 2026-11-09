import {requestContext} from './mock-env.mjs';
export async function getAppUser(){return requestContext.getStore()?.identity ?? null;}
