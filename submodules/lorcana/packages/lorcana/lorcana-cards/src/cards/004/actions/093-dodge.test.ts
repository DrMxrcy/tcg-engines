import { describe, expect, it } from "bun:test";
import { LorcanaMultiplayerTestEngine, PLAYER_TWO } from "@tcg/lorcana-engine/testing";
import { simbaProtectiveCub } from "../../001";
import { dodge } from "./093-dodge";

describe("Dodge!", () => {
  it("gives the chosen character Ward and Evasive until the start of your next turn", () => {
    const testEngine = LorcanaMultiplayerTestEngine.createWithFixture({
      hand: [dodge],
      inkwell: dodge.cost,
      play: [simbaProtectiveCub],
    });

    expect(testEngine.hasKeyword(simbaProtectiveCub, "Ward")).toBe(false);
    expect(testEngine.hasKeyword(simbaProtectiveCub, "Evasive")).toBe(false);
    expect(
      testEngine.asPlayerOne().playCard(dodge, {
        targets: [simbaProtectiveCub],
      }).success,
    ).toBe(true);

    expect(testEngine.hasKeyword(simbaProtectiveCub, "Ward")).toBe(true);
    expect(testEngine.hasKeyword(simbaProtectiveCub, "Evasive")).toBe(true);
  });

  // One choice: the character chosen when Dodge! asks gains both keywords. The
  // Evasive step reuses that choice instead of asking again, and the Ward the
  // first step just gave does not stop an opposing character from getting
  // Evasive.
  for (const side of ["yours", "opposing"] as const) {
    it(`asks once when played without targets and gives ${side} chosen character both keywords`, () => {
      const testEngine = LorcanaMultiplayerTestEngine.createWithFixture(
        { hand: [dodge], inkwell: dodge.cost, play: side === "yours" ? [simbaProtectiveCub] : [] },
        { play: side === "opposing" ? [simbaProtectiveCub] : [] },
      );

      expect(testEngine.asPlayerOne().playCard(dodge)).toBeSuccessfulCommand();
      expect(testEngine.asPlayerOne().getPendingEffects()).toHaveLength(1);
      expect(
        testEngine.asPlayerOne().resolvePendingByCard(dodge, { targets: [simbaProtectiveCub] }),
      ).toBeSuccessfulCommand();

      expect(testEngine.asPlayerOne().getPendingEffects()).toHaveLength(0);
      expect(testEngine.hasKeyword(simbaProtectiveCub, "Ward")).toBe(true);
      expect(testEngine.hasKeyword(simbaProtectiveCub, "Evasive")).toBe(true);
    });
  }

  it("gives an opposing character chosen up front both keywords", () => {
    const testEngine = LorcanaMultiplayerTestEngine.createWithFixture(
      { hand: [dodge], inkwell: dodge.cost },
      { play: [simbaProtectiveCub] },
    );
    const opposing = testEngine.findCardInstanceId(simbaProtectiveCub, "play", PLAYER_TWO);

    expect(
      testEngine.asPlayerOne().playCard(dodge, { targets: [opposing] }),
    ).toBeSuccessfulCommand();

    expect(testEngine.hasKeyword(simbaProtectiveCub, "Ward")).toBe(true);
    expect(testEngine.hasKeyword(simbaProtectiveCub, "Evasive")).toBe(true);
  });
});
