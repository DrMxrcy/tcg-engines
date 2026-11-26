import { describe, expect, it } from "bun:test";
import { LorcanaMultiplayerTestEngine, PLAYER_ONE, PLAYER_TWO } from "@tcg/lorcana-engine/testing";
import { arielOnHumanLegs, mickeyMouseTrueFriend, simbaProtectiveCub } from "../../001";
import { bestowAGift } from "./060-bestow-a-gift";

/** The two-card answers the engine offers for the pending choice, source first. */
function offeredPairs(testEngine: LorcanaMultiplayerTestEngine): string[][] {
  const enumerated = testEngine.getServerEngine().enumerateAutomatedActionsForCurrentActor({});
  return (enumerated.candidates ?? [])
    .filter((candidate) => candidate.family === "resolveEffect")
    .map((candidate) => [...(candidate.targets ?? [])].map(String));
}

describe("Bestow a Gift", () => {
  it("moves 1 damage counter from the chosen character to the chosen opposing character", () => {
    const testEngine = LorcanaMultiplayerTestEngine.createWithFixture(
      {
        hand: [bestowAGift],
        inkwell: bestowAGift.cost,
        play: [arielOnHumanLegs],
      },
      {
        play: [simbaProtectiveCub],
      },
    );

    testEngine.asServer().manualSetDamage(arielOnHumanLegs, 2);
    expect(
      testEngine.asPlayerOne().playCard(bestowAGift, {
        targets: [arielOnHumanLegs, simbaProtectiveCub],
      }).success,
    ).toBe(true);

    expect(testEngine.asServer().getDamage(arielOnHumanLegs)).toBe(1);
    expect(testEngine.asPlayerTwo().getDamage(simbaProtectiveCub)).toBe(1);
  });

  // "From chosen character" may be an opposing character too, so between two
  // opposing characters the counter can move either way: each way is its own
  // answer, and the first card named is the one it moves from.
  for (const direction of ["simba to mickey", "mickey to simba"] as const) {
    it(`moves a counter between two opposing characters the way chosen (${direction})`, () => {
      const testEngine = LorcanaMultiplayerTestEngine.createWithFixture(
        { hand: [bestowAGift], inkwell: bestowAGift.cost, play: [arielOnHumanLegs] },
        { play: [simbaProtectiveCub, mickeyMouseTrueFriend] },
      );
      const simba = testEngine.findCardInstanceId(simbaProtectiveCub, "play", PLAYER_TWO);
      const mickey = testEngine.findCardInstanceId(mickeyMouseTrueFriend, "play", PLAYER_TWO);
      testEngine.asServer().manualSetDamage(simbaProtectiveCub, 1);
      testEngine.asServer().manualSetDamage(mickeyMouseTrueFriend, 1);

      expect(testEngine.asPlayerOne().playCard(bestowAGift)).toBeSuccessfulCommand();
      const pairs = offeredPairs(testEngine);
      expect(pairs).toContainEqual([simba, mickey]);
      expect(pairs).toContainEqual([mickey, simba]);

      const [from, to] = direction === "simba to mickey" ? [simba, mickey] : [mickey, simba];
      expect(
        testEngine.asPlayerOne().resolvePendingByCard(bestowAGift, { targets: [from, to] }),
      ).toBeSuccessfulCommand();
      expect(testEngine.asPlayerTwo().getDamage(from)).toBe(0);
      expect(testEngine.asPlayerTwo().getDamage(to)).toBe(2);
    });
  }

  it("offers a character of yours and an opposing one only as yours to theirs", () => {
    const testEngine = LorcanaMultiplayerTestEngine.createWithFixture(
      { hand: [bestowAGift], inkwell: bestowAGift.cost, play: [arielOnHumanLegs] },
      { play: [simbaProtectiveCub] },
    );
    const ariel = testEngine.findCardInstanceId(arielOnHumanLegs, "play", PLAYER_ONE);
    const simba = testEngine.findCardInstanceId(simbaProtectiveCub, "play", PLAYER_TWO);

    expect(testEngine.asPlayerOne().playCard(bestowAGift)).toBeSuccessfulCommand();
    expect(offeredPairs(testEngine)).toEqual([[ariel, simba]]);
  });

  it("refuses two characters of yours: the destination must be an opposing character", () => {
    const testEngine = LorcanaMultiplayerTestEngine.createWithFixture(
      {
        hand: [bestowAGift],
        inkwell: bestowAGift.cost,
        play: [arielOnHumanLegs, mickeyMouseTrueFriend],
      },
      { play: [simbaProtectiveCub] },
    );
    testEngine.asServer().manualSetDamage(arielOnHumanLegs, 1);

    expect(testEngine.asPlayerOne().playCard(bestowAGift)).toBeSuccessfulCommand();
    expect(
      testEngine.asPlayerOne().resolvePendingByCard(bestowAGift, {
        targets: [arielOnHumanLegs, mickeyMouseTrueFriend],
      }),
    ).not.toBeSuccessfulCommand();
    expect(testEngine.asPlayerOne().getDamage(arielOnHumanLegs)).toBe(1);
  });
});
