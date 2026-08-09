const SUPABASE_TRANSACTION_POOLER_PORT = "6543";

export function configureRuntimeDatabaseUrl(databaseUrl: string | undefined): string | undefined {
  if (!databaseUrl) return undefined;

  try {
    const url = new URL(databaseUrl);
    const isSupabaseTransactionPooler =
      url.port === SUPABASE_TRANSACTION_POOLER_PORT &&
      url.hostname.endsWith(".pooler.supabase.com");

    if (!isSupabaseTransactionPooler) return databaseUrl;

    // Supavisor transaction mode does not support prepared statements.
    // Keep serverless instances conservative with database connections and
    // allow a resumed database enough time to accept the first connection.
    url.searchParams.set("pgbouncer", "true");
    if (!url.searchParams.has("connection_limit")) {
      url.searchParams.set("connection_limit", "1");
    }
    if (!url.searchParams.has("connect_timeout")) {
      url.searchParams.set("connect_timeout", "30");
    }

    return url.toString();
  } catch {
    return databaseUrl;
  }
}
