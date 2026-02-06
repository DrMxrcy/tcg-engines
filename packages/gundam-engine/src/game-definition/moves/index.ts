import type { GameMoveDefinitions } from "@drmxrcy/tcg-core";
import type { GundamCardMeta, GundamGameState, GundamMoves } from "../../types";
import { attackMove } from "./core/attack";
import { concede } from "./core/concede";
import { passMove } from "./core/pass";
import { playCard } from "./core/play-card";

export const gundamMoves: GameMoveDefinitions<
  GundamGameState,
  GundamMoves,
  GundamCardMeta
> = {
  playCard,
  attack: attackMove,
  pass: passMove,
  concede,
};
