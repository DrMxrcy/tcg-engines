import type { CardInstanceId, MoveExecutionContext, MoveInput } from "#core";
import type { Amount, LorcanaCard } from "@tcg/lorcana-types";
import type {
  LorcanaG,
  PendingActionEffect,
  PendingActionEffectContinuation,
  ReplacementTriggerContext,
} from "../../../types";
import type { DynamicAmountEventSnapshot } from "../../../types/domain-events";
import type { PlayerId } from "#core";
import type { TargetSelectionInput } from "../../../targeting/runtime";
import type { SlottedTargetInput } from "../../../targeting/slotted-targets";

type PlayCardExecutionContext = Pick<
  MoveExecutionContext<MoveInput<unknown>>,
  "G" | "playerId" | "query" | "framework" | "cards"
>;

type ActionResolutionInput = {
  targets?: TargetSelectionInput;
  /**
   * Set on a sequence step whose targets are reused from an earlier step's
   * choice (same chosen-target signature). The choice was made, and checked,
   * once; what the earlier step did to the card since (Dodge! giving it Ward)
   * does not undo it.
   */
  reusedChosenTargets?: boolean;
  /**
   * Structured selections for multi-slot effects (move-damage, shift-and-choose,
   * banish-and-play, etc.). When set, slot-aware resolvers read from this field
   * directly instead of relying on positional `targets` ordering. `targets` is
   * still populated (flattened from slots) for generic consumers that only need
   * an id list. See `targeting/slotted-targets.ts`.
   */
  slottedTargets?: SlottedTargetInput;
  currentTargets?: TargetSelectionInput;
  contextTargets?: TargetSelectionInput;
  targetSelectionResolved?: boolean;
  amount?: Amount;
  namedCard?: string;
  resolveOptional?: boolean;
  enterPlayExerted?: boolean;
  choiceIndex?: number;
  preventAutoResolveTriggeredEffects?: boolean;
  destinations?: { zone: string; cards: CardInstanceId | CardInstanceId[] }[];
  effectType?: "play-card";
  sourceZone?: "discard";
  eventSnapshot?: DynamicAmountEventSnapshot;
  triggerContext?: ReplacementTriggerContext;
  /**
   * The id of the player whose choice is currently being resolved when the
   * effect was reached through an `optional` whose `chooser` was not the
   * controller (e.g. OPPONENT chooser on Chernabog — Unnatural Force's
   * nested "play from discard for free"). Inner resolvers that default a
   * source/destination player to `cardPlayed.playerId` should prefer this
   * id when set. Effects with an explicit `target: "OPPONENT" / "SELF"`
   * etc. must continue to resolve relative to the original controller.
   */
  chooserPlayerId?: PlayerId;
};

export type { ActionResolutionInput, PlayCardExecutionContext };

export type { CardPlayedPayload } from "../../../types";

type ResolvedActionEffect = {
  status: "resolved";
};

type SuspendedActionEffect = {
  status: "suspended";
  pendingEffect: PendingActionEffect;
};

type ActionResolutionResult = ResolvedActionEffect | SuspendedActionEffect;

type ActionEffectResolutionOptions = {
  allowPromptForExistingChosenTargets?: boolean;
  continuation?: PendingActionEffectContinuation;
  sourceAbilityIndex?: number;
  originatesFromOptional?: boolean;
  /**
   * Activated abilities keep a pending target-selection shell even when no
   * candidates exist yet (validation / explicit bad-target rejection).
   * Bag and on-play resolution omit this so mandatory triggers fizzle instead.
   */
  allowSuspendWithZeroTargetCandidates?: boolean;
  /**
   * Targets already chosen for an earlier step of the same sequence, keyed by
   * that step's chosen-target signature. A later step with the same signature
   * reuses them instead of asking again, exactly as it does when the targets
   * were supplied up front (Dodge!: "Chosen character gains Ward and Evasive"
   * is one choice, even when the first step had to prompt for it).
   */
  reusableChosenTargets?: ReadonlyArray<{
    signature: string;
    targets: ReadonlyArray<CardInstanceId | PlayerId>;
  }>;
};

export type {
  ActionEffectResolutionOptions,
  ActionResolutionResult,
  PendingActionEffectContinuation,
};
