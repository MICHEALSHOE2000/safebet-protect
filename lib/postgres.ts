import { Pool, type PoolClient } from 'pg';
// Only these fixed application tables are translated. User values remain parameters.
export function postgresQuery(sql: string) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`)
    .replace(/\b(FROM|INTO|UPDATE) (live_records|identity_index|live_exclusions|live_audit|rate_limits)\b/gi, '$1 safebet.$2')
    .replace(/\bend\b/g, '"end"');
}
let pool: Pool | undefined;
function connection() {
  if (!process.env.DATABASE_URL) throw Error('Database is not configured.');
  if (!pool) {
    const url = new URL(process.env.DATABASE_URL);
    // pg connection-string SSL parameters otherwise override explicit TLS settings.
    for (const key of ['sslmode', 'sslcert', 'sslkey', 'sslrootcert']) url.searchParams.delete(key);
    pool = new Pool({connectionString: url.toString(), max: 3,
      idleTimeoutMillis: 10000, connectionTimeoutMillis: 10000,
      ssl: {rejectUnauthorized: true, ...(process.env.DATABASE_CA_CERT ? {ca: process.env.DATABASE_CA_CERT.replace(/\\n/g, '\n')} : {})}});
    pool.on('error', () => console.error('Idle database connection failed.'));
  }
  return pool;
}
// Millisecond timestamps are bigint in Postgres; convert only known timestamp fields.
function row(value: Record<string, unknown>) {
  for (const name of ['start', 'end', 'at', 'expires']) {
    if (typeof value[name] === 'string' && /^\d+$/.test(value[name] as string)) value[name] = Number(value[name]);
  }
  return value;
}
export function createDatabase(connect = connection) {
class Statement {
  readonly sql: string;
  readonly values: unknown[];
  constructor(sql: string, values: unknown[] = []) {this.sql=sql; this.values=values;}
  bind(...values: unknown[]) { return new Statement(this.sql, values); }
  async query(client?: PoolClient) { return (client ?? connect()).query(postgresQuery(this.sql), this.values); }
  async first<T = Record<string, unknown>>(): Promise<T | null> { const r = await this.query(); return r.rows.length ? row(r.rows[0]) as T : null; }
  async all<T = Record<string, unknown>>(): Promise<{results: T[]}> { return {results: (await this.query()).rows.map(row) as T[]}; }
  async run() { return {meta: {changes: (await this.query()).rowCount ?? 0}}; }
}
return {
  prepare(sql: string) { return new Statement(sql); },
  async batch(list: Statement[]) {
    const client = await connect().connect();
    try {
      await client.query('BEGIN');
      const results = [];
      for (const s of list) results.push(await s.query(client));
      await client.query('COMMIT');
      return results;
    } catch (error) { await client.query('ROLLBACK'); throw error; }
    finally { client.release(); }
  },
};

}
export const database = createDatabase();
