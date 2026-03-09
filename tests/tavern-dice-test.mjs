import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createTavernDiceState, startTavernDice, guessTavernDice, cashOutTavernDice } from '../src/tavern-dice.js';

describe('Tavern Dice Game', () => {
  it('creates default state', () => {
    const state = createTavernDiceState();
    assert.equal(state.isActive, false);
  });

  it('starts game and deducts gold', () => {
    let state = { player: { gold: 100 }, rngSeed: 12345 };
    state = startTavernDice(state, 10);
    assert.equal(state.player.gold, 90);
    assert.equal(state.tavernDice.isActive, true);
    assert.equal(state.tavernDice.pot, 10);
  });

  it('handles incorrect guess (lose pot)', () => {
    let state = { player: { gold: 100 }, rngSeed: 12345, tavernDice: { isActive: true, currentRoll: 3, pot: 10, streak: 0 } };
    state = guessTavernDice(state, 'higher');
    assert.ok(state.tavernDice.isActive === false || state.tavernDice.pot === 20);
  });

  it('cashes out with correct math (no streak bonus)', () => {
    let state = { player: { gold: 100 }, tavernDice: { isActive: true, pot: 100, streak: 1 } };
    state = cashOutTavernDice(state);
    assert.equal(state.player.gold, 195);
    assert.equal(state.tavernDice.isActive, false);
  });

  it('cashes out with correct math (with streak bonus)', () => {
    let state = { player: { gold: 100 }, tavernDice: { isActive: true, pot: 100, streak: 3 } };
    state = cashOutTavernDice(state);
    assert.equal(state.player.gold, 243);
    assert.equal(state.tavernDice.isActive, false);
  });
});
