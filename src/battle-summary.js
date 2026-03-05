/**
 * Battle Summary Screen
 * Displays XP gained, gold earned, items looted, and level-ups after a combat victory.
 */

/**
 * Create a battle summary object from the victory state.
 * @param {object} state - The current game state (should be in 'victory' phase)
 * @returns {object} Battle summary data
 */
export function createBattleSummary(state) {
  const xpGained = state.xpGained ?? 0;
  const goldGained = state.goldGained ?? 0;
  const enemyName = state.enemy?.name ?? 'Unknown Enemy';
  const lootedItems = Array.isArray(state.lootedItems) ? [...state.lootedItems] : [];
  const levelUps = Array.isArray(state.pendingLevelUps) ? [...state.pendingLevelUps] : [];

  return {
    xpGained,
    goldGained,
    enemyName,
    lootedItems,
    levelUps,
  };
}

/**
 * Format a battle summary for display.
 * @param {object} summary - The battle summary object from createBattleSummary
 * @returns {object} Display-ready object
 */
export function formatBattleSummary(summary) {
  const levelUpLines = summary.levelUps.map((lu) => {
    const name = lu.memberName ?? lu.name ?? 'Unknown';
    const newLevel = lu.newLevel ?? '?';
    return `${name} reached level ${newLevel}!`;
  });

  const lootLines = summary.lootedItems.length > 0
    ? summary.lootedItems.map((item) => {
        const itemName = typeof item === 'string' ? item : (item.name ?? item.id ?? 'Unknown Item');
        return `Found: ${itemName}`;
      })
    : ['No items looted.'];

  return {
    title: 'Battle Won!',
    enemyLine: `Defeated: ${summary.enemyName}`,
    xpLine: `XP Gained: +${summary.xpGained}`,
    goldLine: `Gold Earned: +${summary.goldGained}`,
    lootLines,
    levelUpLines,
    hasLevelUps: summary.levelUps.length > 0,
    hasLoot: summary.lootedItems.length > 0,
  };
}
