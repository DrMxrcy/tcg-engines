/**
 * @drmxrcy/tcg-gundam - Gundam Card Game Engine
 *
 * A complete implementation of the Bandai Gundam Card Game using the @drmxrcy/tcg-core framework.
 * This package serves as both a production-ready game engine and a reference implementation
 * for building TCG engines with @drmxrcy/tcg-core.
 *
 * - NO defineMove(), defineZone(), definePhase(), defineCard() helpers
 * - Use GameDefinition<TState, TMoves> type directly
 * - Zones are simple state arrays: Record<PlayerId, CardId[]>
 * - Cards are plain objects in lookup tables
 * - Moves use GameMoveDefinitions with condition and reducer
 * - Flow is optional - use FlowDefinition or simple state tracking
 */

// Re-export core framework types for convenience
export type {
  GameDefinition,
  MoveContext,
  MoveExecutionResult,
  RuleEngine,
  RuleEngineOptions,
} from "@drmxrcy/tcg-core";
// Targeting DSL
// Types should be imported directly from @drmxrcy/tcg-gundam-types
// export * from "@drmxrcy/tcg-gundam-types";
// Engine exports
export { GundamEngine } from "./engine/gundam-engine";

// Type exports
export * from "./types";

// Move enumeration type exports
export type {
  AvailableMoveInfo,
  MoveParameterOptions,
  MoveParamSchema,
  MoveValidationError,
  ParameterInfo,
  ParamFieldSchema,
} from "./types/move-enumeration";
