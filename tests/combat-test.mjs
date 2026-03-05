/**
 * Combat System Tests — AI Village RPG
 * Run: node tests/combat-test.mjs
 */

import { createCombatState, calculateTurnOrder, executePlayerAction, livingAllies, livingEnemies } from '../src/combat/index.js';
import { calculateDamage, getElementMultiplier } from '../src/combat/damage-calc.js';
import { StatusEffect, createStatusEffect, isStunned } from '../src/combat/status-effects.js';
import { getAbility, getAbilitiesByClass } from '../src/combat/abilities.js';

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${msg}`);
  } else {
    failed++;
    console.error(`  ❌ FAIL: ${msg}`);
  }
}

// ── Test: Damage Calculation ─────────────────────────────────────────
console.log('\n--- Damage Calculation ---');

const dmg1 = calculateDamage({
  attackerAtk: 10,
  targetDef: 5,
  targetDefending: false,
  element: 'physical',
  targetElement: null,
  rngValue: 0.5,
});
assert(dmg1.damage >= 1, `Basic damage is at least 1 (got ${dmg1.damage})`);
assert(!dmg1.critical, 'Non-critical with rng 0.5');

const dmg2 = calculateDamage({
  attackerAtk: 10,
  targetDef: 5,
  targetDefending: true,
  element: 'physical',
  targetElement: null,
  rngValue: 0.5,
});
assert(dmg2.damage < dmg1.damage || dmg2.damage === 1, `Defending reduces damage (${dmg2.damage} vs ${dmg1.damage})`);

const dmg3 = calculateDamage({
  attackerAtk: 10,
  targetDef: 5,
  rngValue: 0.95,
});
assert(dmg3.critical, 'Critical hit with rng > 0.9');

// ── Test: Elemental Effectiveness ────────────────────────────────────
console.log('\n--- Element System ---');

assert(getElementMultiplier('fire', 'ice') === 2.0, 'Fire vs Ice = 2.0x');
assert(getElementMultiplier('fire', 'earth') === 0.5, 'Fire vs Earth = 0.5x');
assert(getElementMultiplier('light', 'light') === 0.0, 'Light vs Light = immune');
assert(getElementMultiplier('physical', 'fire') === 1.0, 'Physical vs anything = neutral');

// ── Test: Status Effects ─────────────────────────────────────────────
console.log('\n--- Status Effects ---');

const poison = createStatusEffect('poison');
assert(poison !== null, 'Created poison effect');
assert(poison.type === 'poison', 'Poison type correct');
assert(poison.duration === 3, 'Poison duration is 3');
assert(poison.power === 5, 'Poison power is 5');

const stun = createStatusEffect('stun');
const stunnedCombatant = { statusEffects: [stun] };
assert(isStunned(stunnedCombatant), 'Stunned combatant detected');
assert(!isStunned({ statusEffects: [] }), 'Non-stunned combatant not detected');

// ── Test: Abilities ──────────────────────────────────────────────────
console.log('\n--- Abilities ---');

const fireball = getAbility('fireball');
assert(fireball !== null, 'Fireball exists');
assert(fireball.element === 'fire', 'Fireball is fire element');
assert(fireball.mpCost === 6, 'Fireball costs 6 MP');

const warriorAbilities = getAbilitiesByClass('warrior');
assert(warriorAbilities.length >= 3, `Warrior has ${warriorAbilities.length} abilities`);

const mageAbilities = getAbilitiesByClass('mage');
assert(mageAbilities.length >= 3, `Mage has ${mageAbilities.length} abilities`);

// ── Test: Combat State Creation ──────────────────────────────────────
console.log('\n--- Combat State ---');

const party = [
  { id: 'hero', name: 'Hero', hp: 30, maxHp: 30, mp: 20, maxMp: 20, atk: 8, def: 4, spd: 6, abilities: ['power-strike'] },
  { id: 'mage', name: 'Mage', hp: 20, maxHp: 20, mp: 40, maxMp: 40, atk: 10, def: 2, spd: 5, abilities: ['fireball'] },
];
const enemies = [
  { id: 'slime', name: 'Slime', hp: 15, maxHp: 15, mp: 5, maxMp: 5, atk: 5, def: 2, spd: 3, abilities: ['slime-splash'], xpReward: 10, goldReward: 5 },
];

const state = createCombatState(party, enemies, 12345);
assert(state.allCombatants.length === 3, `3 combatants total (got ${state.allCombatants.length})`);
assert(state.phase === 'turn-calc', `Phase is turn-calc (got ${state.phase})`);
assert(livingAllies(state).length === 2, '2 living allies');
assert(livingEnemies(state).length === 1, '1 living enemy');

// ── Test: Turn Calculation ───────────────────────────────────────────
console.log('\n--- Turn Calculation ---');

const afterTurnCalc = calculateTurnOrder(state);
assert(afterTurnCalc.activeCombatantId !== null, `Active combatant set (${afterTurnCalc.activeCombatantId})`);
assert(afterTurnCalc.turn === 1, `Turn is 1 (got ${afterTurnCalc.turn})`);

// The fastest combatant (Hero, spd=6) should go first
const activeName = afterTurnCalc.allCombatants.find(c => c.combatId === afterTurnCalc.activeCombatantId)?.name;
assert(activeName === 'Hero', `Fastest (Hero, spd 6) goes first (got ${activeName})`);
assert(afterTurnCalc.phase === 'choose-action', `Phase is choose-action for ally (got ${afterTurnCalc.phase})`);

// ── Test: Player Attack Action ───────────────────────────────────────
console.log('\n--- Player Attack ---');

const afterAttack = executePlayerAction(afterTurnCalc, {
  type: 'attack',
  targetId: 'enemy-0',
});

const slimeAfterAttack = afterAttack.allCombatants.find(c => c.combatId === 'enemy-0');
assert(slimeAfterAttack.hp < 15, `Slime took damage (hp: ${slimeAfterAttack.hp})`);

// ── Summary ──────────────────────────────────────────────────────────
console.log(`\n========================================`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`========================================`);

if (failed > 0) process.exit(1);
