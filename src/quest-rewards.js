/**
 * Quest Rewards System — AI Village RPG
 * Owner: Claude Sonnet 4.6
 *
 * Handles processing quest completions and applying rewards
 * (XP, gold, items) to the player state. Integrates with
 * quest-integration.js and the exploration flow.
 */

import { applyQuestRewards } from './quest-integration.js';

/**
 * Process completed quests from a quest integration result,
 * returning a list of pending rewards to show the player.
 *
 * @param {Array} completedQuests - Array of { questId, questName, rewards } from quest integration
 * @returns {Array} pendingRewards - Array of { questId, questName, rewards } to display
 */
function buildPendingRewards(completedQuests) {
  if (!completedQuests || completedQuests.length === 0) return [];
  return completedQuests
    .filter(q => q && q.questId)
    .map(q => ({
      questId: q.questId,
      questName: q.questName || q.questId,
      rewards: q.rewards || { experience: 0, gold: 0, items: [] }
    }));
}

/**
 * Get a summary of total rewards across all pending completions.
 *
 * @param {Array} pendingRewards - Array of pending reward objects
 * @returns {Object} { totalXp, totalGold, allItems }
 */
function getPendingRewardsTotal(pendingRewards) {
  if (!pendingRewards || pendingRewards.length === 0) {
    return { totalXp: 0, totalGold: 0, allItems: [] };
  }
  let totalXp = 0;
  let totalGold = 0;
  const allItems = [];
  for (const pending of pendingRewards) {
    const r = pending.rewards || {};
    totalXp += (r.experience || 0);
    totalGold += (r.gold || 0);
    if (Array.isArray(r.items)) {
      for (const item of r.items) {
        allItems.push(item);
      }
    }
  }
  return { totalXp, totalGold, allItems };
}

/**
 * Apply all pending quest rewards to the player state.
 * Returns updated player state and log messages.
 *
 * @param {Object} playerState - Current player state
 * @param {Array} pendingRewards - Array of pending rewards to apply
 * @returns {Object} { playerState, messages }
 */
function claimAllQuestRewards(playerState, pendingRewards) {
  if (!pendingRewards || pendingRewards.length === 0) {
    return { playerState, messages: [] };
  }

  let currentPlayer = { ...playerState };
  const allMessages = [];

  for (const pending of pendingRewards) {
    const questName = pending.questName || pending.questId;
    const rewards = pending.rewards || {};

    if (!rewards.experience && !rewards.gold && (!rewards.items || rewards.items.length === 0)) {
      allMessages.push('Quest completed: ' + questName);
      continue;
    }

    const result = applyQuestRewards(currentPlayer, rewards);
    currentPlayer = result.playerState;
    allMessages.push('Quest Completed: ' + questName);
    for (const msg of result.messages) {
      allMessages.push('  ' + msg);
    }
  }

  return { playerState: currentPlayer, messages: allMessages };
}

/**
 * Check if any pending rewards exist.
 * @param {Array} pendingRewards
 * @returns {boolean}
 */
function hasPendingRewards(pendingRewards) {
  return Array.isArray(pendingRewards) && pendingRewards.length > 0;
}

/**
 * Format a reward item name for display (convert snake_case to Title Case).
 * @param {string} itemId
 * @returns {string}
 */
function formatRewardItemName(itemId) {
  if (!itemId) return '';
  return itemId
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export {
  buildPendingRewards,
  getPendingRewardsTotal,
  claimAllQuestRewards,
  hasPendingRewards,
  formatRewardItemName
};
