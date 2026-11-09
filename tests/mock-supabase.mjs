import {AsyncLocalStorage} from 'node:async_hooks';
export const verifiedSession=new AsyncLocalStorage();
export async function serverClient(){return {auth:{async getUser(){const v=verifiedSession.getStore();return {data:{user:v?.user??null},error:v?.error??null};}}};}
