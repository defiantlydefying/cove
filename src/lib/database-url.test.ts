import { describe, expect, it } from "vitest";
import { configureRuntimeDatabaseUrl } from "./database-url";

describe("configureRuntimeDatabaseUrl", () => {
  it("configures Prisma for the Supabase transaction pooler", () => {
    const configured = configureRuntimeDatabaseUrl(
      "postgresql://user:password@aws-0-us-west-2.pooler.supabase.com:6543/postgres"
    );
    const url = new URL(configured!);

    expect(url.searchParams.get("pgbouncer")).toBe("true");
    expect(url.searchParams.get("connection_limit")).toBe("1");
    expect(url.searchParams.get("connect_timeout")).toBe("30");
  });

  it("preserves an explicit connection limit", () => {
    const configured = configureRuntimeDatabaseUrl(
      "postgresql://user:password@aws-0-us-west-2.pooler.supabase.com:6543/postgres?connection_limit=2"
    );

    expect(new URL(configured!).searchParams.get("connection_limit")).toBe("2");
  });

  it("leaves direct and non-Supabase database URLs unchanged", () => {
    const direct = "postgresql://user:password@db.example.supabase.co:5432/postgres";
    const other = "postgresql://user:password@database.example.com:6543/postgres";

    expect(configureRuntimeDatabaseUrl(direct)).toBe(direct);
    expect(configureRuntimeDatabaseUrl(other)).toBe(other);
  });

  it("handles a missing or malformed URL without throwing", () => {
    expect(configureRuntimeDatabaseUrl(undefined)).toBeUndefined();
    expect(configureRuntimeDatabaseUrl("not-a-url")).toBe("not-a-url");
  });
});
