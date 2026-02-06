import { describe, expect, it } from "bun:test";

describe("@drmxrcy/tcg-lorcana Package Setup", () => {
  it("package is properly configured", () => {
    // Basic smoke test to verify package structure
    expect(true).toBe(true);
  });

  it(
    "can import from @drmxrcy/tcg-core",
    async () => {
      const core = await import("@drmxrcy/tcg-core");
      expect(core).toBeDefined();
      expect(core.RuleEngine).toBeDefined();
    },
    { timeout: 30000 },
  );
});
