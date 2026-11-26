import { describe, it, expect } from "vitest";
import { resolvePath } from "../src/navigators/routes";
import {
  createSecureStorage,
  type SecureStorePort,
} from "../src/platform/secureStorage";
import { cn } from "../src/lib/utils";
import { getWardrobeCap } from "../src/config/wardrobe-limits";
function memory() {
  const data = new Map<string, string>();
  const store: SecureStorePort = {
    getItemAsync: async (key) => data.get(key) ?? null,
    setItemAsync: async (key, value) => {
      expect(Buffer.byteLength(value, "utf8")).toBeLessThan(2048);
      data.set(key, value);
    },
    deleteItemAsync: async (key) => {
      data.delete(key);
    },
  };
  return { data, storage: createSecureStorage(store) };
}
describe("Navigation from the PWA", () => {
  it.each([
    ["/home", "HomeTab", "Home"],
    ["/wardrobe", "WardrobeTab", "Wardrobe"],
    ["/generate", "GenerateTab", "Generate"],
    ["/saved", "SavedTab", "Saved"],
    ["/settings", "SettingsTab", "Settings"],
    ["/profile", "SettingsTab", "Profile"],
    ["/body-profile", "SettingsTab", "BodyProfile"],
    ["/subscription", "SettingsTab", "Subscription"],
  ])("%s keeps its destination", (path, tab, name) => {
    expect(resolvePath(path)).toMatchObject({ tab, name });
  });
  it("keeps generated outfit state through the result route", () => {
    const state = { outfit: { id: "generation-42" } } as Parameters<
      typeof resolvePath
    >[1];
    expect(resolvePath("/outfit-result", state).params?.state).toBe(state);
  });
  it("preserves public outfit and user links", () => {
    expect(resolvePath("/outfit/abc-42")).toEqual({
      name: "PublicOutfit",
      public: true,
      params: { id: "abc-42" },
    });
    expect(resolvePath("/u/patrick")).toMatchObject({
      name: "PublicProfile",
      params: { username: "patrick" },
    });
  });
  it("keeps authentication and fallback routes separate", () => {
    expect(resolvePath("/reset-password")).toMatchObject({
      name: "ResetPassword",
      public: true,
    });
    expect(resolvePath("/profile-setup")).toEqual({ name: "ProfileSetup" });
    expect(resolvePath("/bad")).toMatchObject({ name: "NotFound" });
  });
});
describe("Persistent native auth", () => {
  it("round trips long sessions with non-ASCII metadata without exceeding entry limits", async () => {
    const { storage } = memory();
    const session = JSON.stringify({
      token: "x".repeat(8000),
      name: "Patrick 👔".repeat(500),
    });
    await storage.setItem("session", session);
    expect(await storage.getItem("session")).toBe(session);
  });
  it("serializes overlapping writes and removes every fragment on logout", async () => {
    const { storage, data } = memory();
    await Promise.all([
      storage.setItem("session", "a".repeat(9000)),
      storage.setItem("session", "latest"),
    ]);
    expect(await storage.getItem("session")).toBe("latest");
    await storage.removeItem("session");
    expect(data.size).toBe(0);
    expect(await storage.getItem("session")).toBeNull();
  });
  it("never returns a truncated session after an interrupted write", async () => {
    const { storage, data } = memory();
    await storage.setItem("session", "a".repeat(2000));
    data.delete("session.1");
    expect(await storage.getItem("session")).toBeNull();
  });
});
it("preserves custom typography alongside foreground and background tokens", () => {
  const result = cn("text-foreground text-body", "text-primary");
  expect(result).toContain("text-body");
  expect(result).toContain("text-primary");
  expect(result).not.toContain("text-foreground");
});
it("preserves the original limited-account rule without imposing it on other users", () => {
  expect(getWardrobeCap(undefined)).toBeNull();
  expect(
    getWardrobeCap("other@example.com", '{"limited@example.com":10}'),
  ).toBeNull();
  expect(
    getWardrobeCap("limited@example.com", '{"limited@example.com":10}'),
  ).toBe(15);
  expect(
    getWardrobeCap("LIMITED@example.com", '{"limited@example.com":0}'),
  ).toBe(5);
  expect(getWardrobeCap("other@example.com", "")).toBe(0);
  expect(getWardrobeCap("other@example.com", "invalid")).toBe(0);
  expect(getWardrobeCap("other@example.com", "{}")).toBeNull();
});
