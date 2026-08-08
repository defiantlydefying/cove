import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getServerSessionMock,
  transactionMock,
  moduleUpsertMock,
  settingsUpsertMock,
  profileUpsertMock,
} = vi.hoisted(() => ({
  getServerSessionMock: vi.fn(),
  transactionMock: vi.fn(),
  moduleUpsertMock: vi.fn(),
  settingsUpsertMock: vi.fn(),
  profileUpsertMock: vi.fn(),
}));

vi.mock("next-auth", () => ({ getServerSession: getServerSessionMock }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/db", () => ({
  prisma: {
    $transaction: transactionMock,
    moduleSetting: { upsert: moduleUpsertMock },
    userSettings: { upsert: settingsUpsertMock },
    userProfile: { upsert: profileUpsertMock },
  },
}));

import { PATCH } from "./route";

const validBody = {
  modules: {
    "task-manager": true,
    productivity: true,
    "focus-habits": false,
  },
  settings: {
    theme: "light",
    density: "comfortable",
    animationsOn: true,
    companionType: "fox",
  },
  profile: {
    age: null,
    conditions: [],
    medications: [],
    notes: null,
  },
};

function createRequest(body = validBody) {
  return new NextRequest("https://cove.example/api/onboarding", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("onboarding setup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getServerSessionMock.mockResolvedValue({ user: { id: "user-1" } });
    moduleUpsertMock.mockReturnValue({ operation: "module" });
    settingsUpsertMock.mockReturnValue({ operation: "settings" });
    profileUpsertMock.mockReturnValue({ operation: "profile" });
    transactionMock.mockResolvedValue([]);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("requires an authenticated user", async () => {
    getServerSessionMock.mockResolvedValue(null);

    const response = await PATCH(createRequest());

    expect(response.status).toBe(401);
    expect(transactionMock).not.toHaveBeenCalled();
  });

  it("rejects invalid module IDs", async () => {
    const response = await PATCH(
      createRequest({ ...validBody, modules: { unknown: true } })
    );

    expect(response.status).toBe(400);
    expect(transactionMock).not.toHaveBeenCalled();
  });

  it("saves modules, settings, and profile in one transaction", async () => {
    const response = await PATCH(createRequest());

    expect(response.status).toBe(200);
    expect(moduleUpsertMock).toHaveBeenCalledTimes(3);
    expect(settingsUpsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1" },
        update: expect.objectContaining({ companionChosen: true }),
      })
    );
    expect(profileUpsertMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-1" } })
    );
    expect(transactionMock).toHaveBeenCalledOnce();
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("returns a retryable response when the database is unavailable", async () => {
    transactionMock.mockRejectedValue(new Error("database unavailable"));

    const response = await PATCH(createRequest());

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: "Database unavailable" });
  });
});
