#!/usr/bin/env node

import { ENEMIES, getEnemy } from '../src/data/enemies.js';
import { getAllClasses, getClassDefinition } from '../src/characters/classes.js';
import { calculateDamage } from '../src/combat/damage-calc.js';
import { getAbility } from '../src/combat/abilities.js';
import { xpToNextLevel } from '../src/characters/stats.js';

const CLASS_PREFERRED_ABILITIES = {
  warrior: 'power-strike',
  rogue: 'power-strike',
  mage: 'fireball',
  cleric: 'smite',
};

function createRng(seed = 1337) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) % 0x100000000;
    return state / 0x100000000;
  };
}

function pickAbility(classId, currentMp) {
  const abilityId = CLASS_PREFERRED_ABILITIES[classId];
  if (!abilityId) return null;
  const ability = getAbility(abilityId);
  if (!ability) return null;
  if (currentMp < ability.mpCost) return null;
  return ability;
}

function takeTurn({ attacker, target, ability, rngValue }) {
  const abilityPower = ability?.power ?? 1.0;
  const element = ability?.element ?? 'physical';
  const { damage } = calculateDamage({
    attackerAtk: attacker.atk,
    targetDef: target.def,
    targetElement: target.element || null,
    rngValue,
    abilityPower,
  });
  return damage;
}

export function simulateBattle(classId, enemyId, seed = 99) {
  const classDef = getClassDefinition(classId);
  if (!classDef) throw new Error(`Unknown class: ${classId}`);
  const enemy = getEnemy(enemyId);
  if (!enemy) throw new Error(`Unknown enemy: ${enemyId}`);

  const hero = {
    hp: classDef.baseStats.hp,
    mp: classDef.baseStats.mp,
    atk: classDef.baseStats.atk,
    def: classDef.baseStats.def,
    spd: classDef.baseStats.spd,
    element: null,
  };

  const foe = {
    hp: enemy.hp,
    mp: enemy.mp,
    atk: enemy.atk,
    def: enemy.def,
    spd: enemy.spd,
    element: enemy.element ?? null,
  };

  const rng = createRng(seed + classId.length * 17 + enemyId.length * 31);
  let turns = 0;

  while (hero.hp > 0 && foe.hp > 0 && turns < 200) {
    turns += 1;

    const ability = pickAbility(classId, hero.mp);
    const heroAttack = takeTurn({ attacker: hero, target: foe, ability, rngValue: rng() });
    if (ability) {
      hero.mp = Math.max(0, hero.mp - ability.mpCost);
    }
    foe.hp -= heroAttack;

    if (foe.hp <= 0) break;

    const enemyAttack = takeTurn({ attacker: foe, target: hero, ability: null, rngValue: rng() });
    hero.hp -= enemyAttack;
  }

  return {
    win: hero.hp > 0 && foe.hp <= 0,
    turns,
    remainingHp: Math.max(0, Math.floor(hero.hp)),
  };
}

function runMatrix() {
  const classes = getAllClasses();
  const enemies = Object.values(ENEMIES);
  const warnings = [];

  console.log('=== Balance Matrix (Lvl 1) ===');
  console.log(['Class/Enemy', ...enemies.map((e) => e.name)].join('\t'));

  classes.forEach((cls) => {
    const row = [cls.name];
    enemies.forEach((enemy) => {
      const result = simulateBattle(cls.id, enemy.id);
      row.push(result.win ? `W:${result.turns}` : `L:${result.turns}`);

      if (!result.win && (enemy.id === 'slime' || enemy.id === 'goblin')) {
        warnings.push(`${cls.name} loses to a ${enemy.name} (Lvl 1)`);
      }
      if (result.win && enemy.id === 'dragon') {
        warnings.push(`${cls.name} beats a Dragon at Lvl 1 (unexpected)`);
      }
    });
    console.log(row.join('\t'));
  });

  if (warnings.length) {
    console.log('\nWarnings:');
    warnings.forEach((msg) => console.warn(` - ${msg}`));
  }
}

function printXpToLevel2() {
  const xpNeeded = xpToNextLevel(0);
  const slimeXp = ENEMIES.slime?.xpReward ?? 1;
  const slimesNeeded = Math.ceil(xpNeeded / slimeXp);

  console.log('\n=== XP to Level 2 ===');
  console.log(`XP required: ${xpNeeded}`);
  console.log(`Slimes needed: ${slimesNeeded} (at ${slimeXp} XP each)`);
}

function main() {
  runMatrix();
  printXpToLevel2();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
