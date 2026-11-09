export const workspaceRoutes: Record<string,string> = {player:'/player/dashboard',shop:'/shop/dashboard',owner:'/owner/dashboard',regulator:'/regulator/dashboard',admin:'/admin/dashboard'};
export function workspaceHome(role: string) { return workspaceRoutes[role] || '/signin'; }
