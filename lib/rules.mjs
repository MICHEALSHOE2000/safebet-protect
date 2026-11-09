export const durations = [1,7,30,90,180,365,1825];
export const roles = ['player','shop','owner','regulator','admin'];
export function isActive(exclusion, now = Date.now()) { return !!exclusion && exclusion.end > now; }
export function endDate(days, now = Date.now()) { if(!durations.includes(Number(days))) throw new Error('Choose a supported duration.'); return now+Number(days)*86400000; }
export function extendDate(exclusion, days, now = Date.now()) { if(!isActive(exclusion, now)) throw new Error('Start a new exclusion after completion.'); return endDate(days, exclusion.end); }
export function allow(role, allowed) { if(!allowed.includes(role)) throw new Error('This action is not available to your role.'); }
export function jurisdictionAllowed(user, state) { return user.role === 'admin' || (user.role === 'regulator' && user.state === state); }
