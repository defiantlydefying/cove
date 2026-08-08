import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { queryRawMock } = vi.hoisted(() => ({
  queryRawMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    $queryRaw: queryRawMock,
  },
}));

import { GET } from "./route";

const originalCronSecret = process.env.CRON_SECRET;

function createRequest(secret?: string) {
  return new NextRequest("https://cove.example/api/cron/database-health", {
    headers: secret ? { authorization: `Bearer ${secret}` } : undefined,
  });
}

describe("database health cron", () => {
  beforeEach(() => {
    process.env.CRON_SECRET = "test-cron-secret";
    queryRawMock.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalCronSecret === undefined) {
      delete process.env.CRON_SECRET;
    } else {
      process.env.CRON_SECRET = originalCronSecret;
    }
  });

  it("rejects requests without the cron secret", async () => {
    const response = await GET(createRequest());

    expect(response.status).toBe(401);
    expect(queryRawMock).not.toHaveBeenCalled();
  });

  it("rejects requests with the wrong cron secret", async () => {
    const response = await GET(createRequest("wrong-secret"));

    expect(response.status).toBe(401);
    expect(queryRawMock).not.toHaveBeenCalled();
  });

  it("queries the database for an authorized request", async () => {
    queryRawMock.mockResolvedValue([{ "?column?": 1 }]);

    const response = await GET(createRequest("test-cron-secret"));

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(queryRawMock).toHaveBeenCalledOnce();
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("returns unavailable when the database cannot be reached", async () => {
    queryRawMock.mockRejectedValue(new Error("database unavailable"));

    const response = await GET(createRequest("test-cron-secret"));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ ok: false });
  });
});
