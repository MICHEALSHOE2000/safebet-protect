import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const records = sqliteTable('records', { id: text('id').primaryKey(), kind: text('kind').notNull(), owner: text('owner').notNull(), state: text('state').notNull(), data: text('data').notNull() });
export const sessions = sqliteTable('sessions', { id: text('id').primaryKey(), userId: text('user_id').notNull(), expires: integer('expires').notNull() });
export const audit = sqliteTable('audit', { id: text('id').primaryKey(), actor: text('actor').notNull(), action: text('action').notNull(), at: integer('at').notNull(), detail: text('detail').notNull(), hash: text('hash').notNull() });
export const liveRecords = sqliteTable('live_records',{id:text('id').primaryKey(),kind:text('kind').notNull(),owner:text('owner').notNull(),state:text('state').notNull(),data:text('data').notNull(),version:integer('version').notNull().default(1)});
export const identityIndex = sqliteTable('identity_index',{fingerprint:text('fingerprint').primaryKey(),customerId:text('customer_id').notNull(),kind:text('kind').notNull()});
export const liveExclusions = sqliteTable('live_exclusions',{customerId:text('customer_id').primaryKey(),start:integer('start').notNull(),end:integer('end').notNull(),version:integer('version').notNull().default(1)});
export const liveAudit = sqliteTable('live_audit',{id:text('id').primaryKey(),actor:text('actor').notNull(),action:text('action').notNull(),at:integer('at').notNull(),target:text('target').notNull(),digest:text('digest').notNull()});
export const rateLimits = sqliteTable('rate_limits',{id:text('id').primaryKey(),count:integer('count').notNull(),expires:integer('expires').notNull()});
