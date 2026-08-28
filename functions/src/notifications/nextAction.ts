import type { NextAction, NextActionContext } from "../../../src/core/engines/nextAction";
import { nextAction as coreNextAction } from "../../../src/core/engines/nextAction";

export function evaluateNextAction(ctx: NextActionContext): NextAction | null {
  return coreNextAction(ctx);
}
