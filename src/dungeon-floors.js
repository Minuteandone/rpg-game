export const DUNGEON_FLOORS = [
  {
    id: 1,
    name: "Echoing Grotto",
    theme: "cavern",
    description: "Damp tunnels where slimes and bats cling to stone.",
    enemyPool: ["slime", "cave_bat", "goblin"],
    difficultyMultiplier: 1.0,
    encounterRate: 0.3,
    bossFloor: false,
    bossId: null,
    minLevel: 3,
  },
  {
    id: 2,
    name: "Crystal Hollows",
    theme: "cavern",
    description: "Glittering caverns hide skittering fangs and ambushers.",
    enemyPool: ["slime", "cave_bat", "goblin", "giant_spider"],
    difficultyMultiplier: 1.15,
    encounterRate: 0.33,
    bossFloor: false,
    bossId: null,
    minLevel: 4,
  },
  {
    id: 3,
    name: "Goblin Stronghold",
    theme: "goblin_stronghold",
    description: "Barricaded caves echo with drums and goblin war cries.",
    enemyPool: ["goblin", "goblin_chief", "cave_bat"],
    difficultyMultiplier: 1.3,
    encounterRate: 0.36,
    bossFloor: true,
    bossId: "goblin_chief",
    minLevel: 5,
  },
  {
    id: 4,
    name: "Silent Catacombs",
    theme: "crypt",
    description: "Ancient bones and cold mist rise from unmarked graves.",
    enemyPool: ["skeleton", "wraith", "dark-cultist"],
    difficultyMultiplier: 1.45,
    encounterRate: 0.4,
    bossFloor: false,
    bossId: null,
    minLevel: 6,
  },
  {
    id: 5,
    name: "Shattered Mausoleum",
    theme: "crypt",
    description: "Cursed halls where spirits guard forgotten relics.",
    enemyPool: ["skeleton", "wraith", "dark-cultist", "orc"],
    difficultyMultiplier: 1.6,
    encounterRate: 0.44,
    bossFloor: false,
    bossId: null,
    minLevel: 7,
  },
  {
    id: 6,
    name: "Frozen Depths",
    theme: "frozen_depths",
    description: "Ice-choked passages where frost bites through armor.",
    enemyPool: ["ice-spirit", "wolf", "skeleton"],
    difficultyMultiplier: 1.75,
    encounterRate: 0.48,
    bossFloor: true,
    bossId: "ice-spirit",
    minLevel: 8,
  },
  {
    id: 7,
    name: "Ruined Causeway",
    theme: "ruins",
    description: "Broken stone bridges patrolled by hardened raiders.",
    enemyPool: ["stone-golem", "orc", "bandit"],
    difficultyMultiplier: 1.9,
    encounterRate: 0.52,
    bossFloor: false,
    bossId: null,
    minLevel: 9,
  },
  {
    id: 8,
    name: "Forgotten Bastion",
    theme: "ruins",
    description: "Collapsed keeps shelter warbands and ancient sentries.",
    enemyPool: ["stone-golem", "orc", "bandit", "wraith"],
    difficultyMultiplier: 2.05,
    encounterRate: 0.56,
    bossFloor: false,
    bossId: null,
    minLevel: 10,
  },
  {
    id: 9,
    name: "Infernal Gate",
    theme: "inferno",
    description: "Molten chambers blaze with stormfire and winged hunters.",
    enemyPool: ["fire-spirit", "thunder-hawk", "dragon"],
    difficultyMultiplier: 2.2,
    encounterRate: 0.6,
    bossFloor: true,
    bossId: "dragon",
    minLevel: 11,
  },
  {
    id: 10,
    name: "Abyssal Throne",
    theme: "abyss",
    description: "The final descent where every terror gathers.",
    enemyPool: [
      "slime",
      "goblin",
      "goblin_chief",
      "cave_bat",
      "giant_spider",
      "wolf",
      "skeleton",
      "orc",
      "fire-spirit",
      "ice-spirit",
      "dark-cultist",
      "bandit",
      "wraith",
      "stone-golem",
      "thunder-hawk",
      "dragon",
    ],
    difficultyMultiplier: 2.35,
    encounterRate: 0.65,
    bossFloor: true,
    bossId: "abyss_overlord",
    minLevel: 12,
  },
];

const TOTAL_FLOORS = 10;

export function createDungeonState() {
  return {
    currentFloor: 0,
    deepestFloor: 0,
    floorsCleared: [],
    inDungeon: false,
    stairsFound: false,
  };
}

export function enterDungeon(dungeonState) {
  return {
    ...dungeonState,
    inDungeon: true,
    currentFloor: 1,
    stairsFound: false,
  };
}

export function exitDungeon(dungeonState) {
  return {
    ...dungeonState,
    inDungeon: false,
    currentFloor: 0,
    stairsFound: false,
  };
}

export function getFloorData(floorNumber) {
  return DUNGEON_FLOORS.find((floor) => floor.id === floorNumber) || null;
}

export function advanceFloor(dungeonState) {
  const nextFloor = Math.min(dungeonState.currentFloor + 1, TOTAL_FLOORS);
  return {
    ...dungeonState,
    currentFloor: nextFloor,
    deepestFloor: Math.max(dungeonState.deepestFloor, nextFloor),
    stairsFound: false,
  };
}

export function clearFloor(dungeonState) {
  const currentFloor = dungeonState.currentFloor;
  if (!currentFloor) {
    return { ...dungeonState };
  }
  if (dungeonState.floorsCleared.includes(currentFloor)) {
    return { ...dungeonState };
  }
  return {
    ...dungeonState,
    floorsCleared: [...dungeonState.floorsCleared, currentFloor],
  };
}

export function findStairs(dungeonState) {
  return {
    ...dungeonState,
    stairsFound: true,
  };
}

export function canAdvance(dungeonState) {
  if (!dungeonState.stairsFound) {
    return false;
  }
  const floorData = getFloorData(dungeonState.currentFloor);
  if (!floorData) {
    return false;
  }
  const cleared = dungeonState.floorsCleared.includes(dungeonState.currentFloor);
  return cleared || floorData.bossFloor;
}

export function getScaledEnemy(enemy, floorNumber) {
  const floorData = getFloorData(floorNumber);
  if (!floorData || !enemy) {
    return enemy ? { ...enemy } : null;
  }
  const multiplier = floorData.difficultyMultiplier;
  const scale = (value) => Math.max(1, Math.round(value * multiplier));
  return {
    ...enemy,
    hp: scale(enemy.hp),
    maxHp: scale(enemy.maxHp ?? enemy.hp),
    atk: scale(enemy.atk),
    def: scale(enemy.def),
    spd: scale(enemy.spd),
    xpReward: scale(enemy.xpReward),
    goldReward: scale(enemy.goldReward),
  };
}

export function getRandomEncounter(dungeonState, rngSeed) {
  const floorData = getFloorData(dungeonState.currentFloor);
  if (!floorData || !rngSeed) {
    return null;
  }
  const nextSeed = (rngSeed * 16807) % 2147483647;
  const roll = nextSeed / 2147483647;
  if (roll > floorData.encounterRate) {
    return null;
  }
  const poolIndex = Math.floor(roll * floorData.enemyPool.length);
  const enemyId = floorData.enemyPool[poolIndex];
  return { enemyId, seed: nextSeed };
}

export function getDungeonProgress(dungeonState) {
  const floorsCleared = dungeonState.floorsCleared.length;
  const percentComplete = Math.min(
    100,
    Math.round((floorsCleared / TOTAL_FLOORS) * 100)
  );
  return {
    currentFloor: dungeonState.currentFloor,
    deepestFloor: dungeonState.deepestFloor,
    floorsCleared,
    totalFloors: TOTAL_FLOORS,
    percentComplete,
  };
}

export function isFloorCleared(dungeonState, floorNumber) {
  return dungeonState.floorsCleared.includes(floorNumber);
}

export function getFloorTheme(floorNumber) {
  const floorData = getFloorData(floorNumber);
  return floorData ? floorData.theme : null;
}

export function canEnterDungeon(playerLevel) {
  return playerLevel >= 3;
}

export function getBossForFloor(floorNumber) {
  const floorData = getFloorData(floorNumber);
  return floorData ? floorData.bossId : null;
}
