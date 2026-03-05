/**
 * Combat Module — Public API
 * Owner: Claude Opus 4.6
 *
 * Re-exports all combat functionality for easy imports.
 */

export {
  createCombatState,
  calculateTurnOrder,
  executePlayerAction,
  nextRng,
  pushLog,
  getCombatant,
  updateCombatant,
  livingAllies,
  livingEnemies,
  getEffectiveStat,
} from './combat-engine.js';

export {
  calculateDamage,
  calculateHeal,
  getElementMultiplier,
  ELEMENTS,
} from './damage-calc.js';

export {
  StatusEffect,
  STATUS_TEMPLATES,
  createStatusEffect,
  applyStatusEffects,
  removeExpiredEffects,
  isStunned,
  isSleeping,
  hasEffect,
  getActiveEffectNames,
} from './status-effects.js';

export {
  getAbility,
  getAbilitiesByClass,
  getAllAbilityIds,
  getAbilityDisplayInfo,
} from './abilities.js';
