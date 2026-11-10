import {ShieldCheck,Clock3,FileText,BookOpen,Users,Store,Landmark,Settings,Activity,ClipboardCheck,HeartHandshake} from 'lucide-react';
export function navigationFor(role:string){
 const navigation:Record<string, [string,string,typeof ShieldCheck][]>={
 player:[['/player/dashboard','My Protection',ShieldCheck],['/player/self-exclusion','Start Self-Exclusion',ShieldCheck],['/player/exclusion-status','My Exclusion Period',Clock3],['/player/reports','My Reports',FileText],['/report-shop','Report a Violation',FileText],['/resources','Recovery Resources',HeartHandshake],['/player/account','My Account',Users]],
 shop:[['/shop/dashboard','Check Customer',ShieldCheck],['/shop/enrol','Assisted Self-Exclusion',Users],['/shop/compliance','Verification History',Activity],['/shop/incident','Report an Incident',FileText],['/shop/training','Training',BookOpen]],
 owner:[['/owner/shops','My Outlets',Store],['/owner/attendants','Staff Accounts',Users],['/owner/dashboard','Compliance Overview',ClipboardCheck],['/owner/activity','Verification Activity',Activity]],
 regulator:[['/regulator/dashboard','Jurisdiction Overview',Landmark],['/regulator/shops','Participating Outlets',Store],['/regulator/complaints','Reported Violations',FileText],['/regulator/investigations','Compliance Investigations',ClipboardCheck],['/regulator/audit','Audit History',Activity]],
 admin:[['/admin/dashboard','System Overview',Activity],['/admin/users','User and Role Management',Users],['/admin/outlets','Outlet Management',Store],['/admin/users','Regulator Assignments',Landmark],['/admin/config','Pilot Configuration',Settings],['/admin/audit','Audit Logs',FileText],['/admin/health','System Health',Activity]]};
 return navigation[role]||[];
}
