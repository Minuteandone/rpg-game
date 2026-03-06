/**
 * Save Slots UI Tests - AI Village RPG
 * Tests for src/save-slots-ui.js pure rendering functions.
 * Run: node tests/save-slots-ui-test.mjs
 */

import {
  MAX_SAVE_SLOTS,
  formatSaveDate,
  renderSlotCard,
  renderSaveSlotsList,
  getSaveSlotsStyles
} from '../src/save-slots-ui.js';

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    passed++;
    console.log('  PASS: ' + msg);
  } else {
    failed++;
    console.error('  FAIL: ' + msg);
  }
}

function assertIncludes(html, substr, msg) {
  assert(html.includes(substr), msg + ' (should include "' + substr + '")');
}

function assertNotIncludes(html, substr, msg) {
  assert(!html.includes(substr), msg + ' (should NOT include "' + substr + '")');
}

// ========== MAX_SAVE_SLOTS ==========
console.log('\n--- MAX_SAVE_SLOTS ---');
assert(MAX_SAVE_SLOTS === 5, 'MAX_SAVE_SLOTS is 5');
assert(typeof MAX_SAVE_SLOTS === 'number', 'MAX_SAVE_SLOTS is a number');

// ========== formatSaveDate ==========
console.log('\n--- formatSaveDate ---');
assert(formatSaveDate(null) === 'Unknown', 'null returns Unknown');
assert(formatSaveDate(undefined) === 'Unknown', 'undefined returns Unknown');
assert(formatSaveDate('') === 'Unknown', 'empty string returns Unknown');
assert(formatSaveDate('Unknown') === 'Unknown', '"Unknown" returns Unknown');
assert(formatSaveDate('not-a-date') === 'Invalid date', 'invalid date string returns Invalid date');

const testDate = '2026-03-06T10:30:00.000Z';
const formatted = formatSaveDate(testDate);
assert(typeof formatted === 'string', 'formatSaveDate returns string');
assert(formatted.includes('2026'), 'formatted date includes year');
assert(formatted.includes('/'), 'formatted date uses / separator');
assert(formatted.includes(':'), 'formatted time includes colon');
assert(/\d{2}\/\d{2}\/\d{4}/.test(formatted), 'formatted date matches MM/DD/YYYY pattern');

// Edge cases
assert(formatSaveDate('2000-06-15T12:00:00Z').includes('2000'), 'Y2K date works');
assert(typeof formatSaveDate('2099-12-31T23:59:59Z') === 'string', 'future date works');

// ========== renderSlotCard - occupied slot, save mode ==========
console.log('\n--- renderSlotCard (occupied, save mode) ---');
const occupiedSlot = { index: 0, exists: true, savedAt: '2026-03-06T10:00:00Z', playerName: 'TestHero', turn: 42 };

const cardSave = renderSlotCard(occupiedSlot, 'save');
assert(typeof cardSave === 'string', 'returns string');
assertIncludes(cardSave, 'save-slot-card', 'has save-slot-card class');
assertIncludes(cardSave, 'data-slot-index="0"', 'has data-slot-index attribute');
assertIncludes(cardSave, 'Slot 1', 'shows slot number (1-indexed)');
assertIncludes(cardSave, 'TestHero', 'shows player name');
assertIncludes(cardSave, 'Turn 42', 'shows turn number');
assertIncludes(cardSave, 'btn-save-slot', 'has save button class');
assertIncludes(cardSave, 'Overwrite', 'save mode shows Overwrite text');
assertIncludes(cardSave, 'btn-delete-slot', 'has delete button');
assertIncludes(cardSave, 'Delete', 'shows Delete text');
assertNotIncludes(cardSave, 'btn-load-slot', 'no load button in save mode');
assertNotIncludes(cardSave, 'empty-slot', 'occupied slot has no empty-slot class');

// ========== renderSlotCard - occupied slot, load mode ==========
console.log('\n--- renderSlotCard (occupied, load mode) ---');
const cardLoad = renderSlotCard(occupiedSlot, 'load');
assertIncludes(cardLoad, 'btn-load-slot', 'has load button class');
assertIncludes(cardLoad, 'Load', 'load mode shows Load text');
assertIncludes(cardLoad, 'btn-delete-slot', 'has delete button');
assertNotIncludes(cardLoad, 'btn-save-slot', 'no save button in load mode');

// ========== renderSlotCard - empty slot, save mode ==========
console.log('\n--- renderSlotCard (empty, save mode) ---');
const emptySlot = { index: 2, exists: false };
const emptyCardSave = renderSlotCard(emptySlot, 'save');
assertIncludes(emptyCardSave, 'empty-slot', 'has empty-slot class');
assertIncludes(emptyCardSave, 'data-slot-index="2"', 'has correct slot index');
assertIncludes(emptyCardSave, 'Slot 3', 'shows slot 3 (1-indexed)');
assertIncludes(emptyCardSave, 'Empty', 'shows Empty text');
assertIncludes(emptyCardSave, 'btn-save-slot', 'has save button');
assertIncludes(emptyCardSave, 'Save Here', 'save mode shows Save Here');
assertNotIncludes(emptyCardSave, 'btn-delete-slot', 'no delete button for empty slot');

// ========== renderSlotCard - empty slot, load mode ==========
console.log('\n--- renderSlotCard (empty, load mode) ---');
const emptyCardLoad = renderSlotCard(emptySlot, 'load');
assertIncludes(emptyCardLoad, 'btn-load-slot', 'has load button class');
assertIncludes(emptyCardLoad, 'disabled', 'load button is disabled for empty slot');
assertNotIncludes(emptyCardLoad, 'btn-delete-slot', 'no delete button for empty slot');

// ========== renderSlotCard - different indices ==========
console.log('\n--- renderSlotCard (various indices) ---');
for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
  const slot = { index: i, exists: false };
  const card = renderSlotCard(slot, 'save');
  assertIncludes(card, `data-slot-index="${i}"`, `slot ${i} has correct data-slot-index`);
  assertIncludes(card, `Slot ${i + 1}`, `slot ${i} shows Slot ${i + 1}`);
}

// ========== renderSlotCard - XSS protection ==========
console.log('\n--- renderSlotCard (XSS protection) ---');
const xssSlot = { index: 0, exists: true, savedAt: '2026-01-01T00:00:00Z', playerName: '<script>alert("xss")</script>', turn: 1 };
const xssCard = renderSlotCard(xssSlot, 'save');
assertNotIncludes(xssCard, '<script>', 'script tag is escaped');
assertIncludes(xssCard, '&lt;script&gt;', 'script tag is HTML-escaped');

// ========== renderSlotCard - missing playerName ==========
console.log('\n--- renderSlotCard (missing data) ---');
const missingNameSlot = { index: 0, exists: true, savedAt: '2026-01-01T00:00:00Z', playerName: '', turn: 0 };
const missingCard = renderSlotCard(missingNameSlot, 'save');
assertIncludes(missingCard, 'Unknown', 'missing name shows Unknown');

const nullNameSlot = { index: 0, exists: true, savedAt: '2026-01-01T00:00:00Z', playerName: null, turn: 5 };
const nullCard = renderSlotCard(nullNameSlot, 'save');
assertIncludes(nullCard, 'Unknown', 'null name shows Unknown');

// ========== renderSaveSlotsList - save mode ==========
console.log('\n--- renderSaveSlotsList (save mode) ---');
const slots = [
  { index: 0, exists: true, savedAt: '2026-03-06T10:00:00Z', playerName: 'Hero1', turn: 10 },
  { index: 1, exists: false },
  { index: 2, exists: true, savedAt: '2026-03-05T15:30:00Z', playerName: 'Hero2', turn: 25 },
  { index: 3, exists: false },
  { index: 4, exists: false }
];

const listSave = renderSaveSlotsList(slots, 'save');
assert(typeof listSave === 'string', 'returns string');
assertIncludes(listSave, 'save-slots-panel', 'has panel class');
assertIncludes(listSave, 'Save Game', 'shows Save Game title');
assertIncludes(listSave, 'btnModeSave', 'has save mode button');
assertIncludes(listSave, 'btnModeLoad', 'has load mode button');
assertIncludes(listSave, 'btnCloseSaveSlots', 'has close button');
assertIncludes(listSave, 'active-tab', 'save tab is active');
assertIncludes(listSave, 'Hero1', 'shows first hero name');
assertIncludes(listSave, 'Hero2', 'shows second hero name');
assertIncludes(listSave, 'save-slots-list', 'has list container');

// Count slot cards
const cardCount = (listSave.match(/save-slot-card/g) || []).length;
// Each card has class "save-slot-card" in the div, plus empty ones have "save-slot-card empty-slot"
// The actual div count should be 5
const divCardCount = (listSave.match(/class="save-slot-card/g) || []).length;
assert(divCardCount === 5, 'renders all 5 slot cards');

// ========== renderSaveSlotsList - load mode ==========
console.log('\n--- renderSaveSlotsList (load mode) ---');
const listLoad = renderSaveSlotsList(slots, 'load');
assertIncludes(listLoad, 'Load Game', 'shows Load Game title');
// Check tab classes
const saveTabMatch = listLoad.match(/tab-btn\s+([^"]*)" id="btnModeSave"/);
const loadTabMatch = listLoad.match(/tab-btn\s+([^"]*)" id="btnModeLoad"/);
assert(saveTabMatch && !saveTabMatch[1].includes('active-tab'), 'save tab is NOT active in load mode');
assert(loadTabMatch && loadTabMatch[1].includes('active-tab'), 'load tab IS active in load mode');

// ========== renderSaveSlotsList - empty slots array ==========
console.log('\n--- renderSaveSlotsList (empty array) ---');
const emptyList = renderSaveSlotsList([], 'save');
assertIncludes(emptyList, 'save-slots-panel', 'panel renders even with no slots');
assertIncludes(emptyList, 'Save Game', 'title shows even with no slots');
assertIncludes(emptyList, 'btnCloseSaveSlots', 'close button present');

// ========== renderSaveSlotsList - all occupied ==========
console.log('\n--- renderSaveSlotsList (all occupied) ---');
const allOccupied = Array.from({ length: 5 }, (_, i) => ({
  index: i, exists: true, savedAt: '2026-03-06T12:00:00Z', playerName: `Player${i}`, turn: i * 10
}));
const fullList = renderSaveSlotsList(allOccupied, 'save');
for (let i = 0; i < 5; i++) {
  assertIncludes(fullList, `Player${i}`, `shows Player${i}`);
  assertIncludes(fullList, `Turn ${i * 10}`, `shows turn ${i * 10}`);
}
const deleteCount = (fullList.match(/btn-delete-slot/g) || []).length;
assert(deleteCount === 5, 'all 5 slots have delete buttons when occupied');

// ========== getSaveSlotsStyles ==========
console.log('\n--- getSaveSlotsStyles ---');
const styles = getSaveSlotsStyles();
assert(typeof styles === 'string', 'returns string');
assertIncludes(styles, '.save-slots-panel', 'has panel style');
assertIncludes(styles, '.save-slot-card', 'has card style');
assertIncludes(styles, '.slot-header', 'has slot header style');
assertIncludes(styles, '.slot-info', 'has slot info style');
assertIncludes(styles, '.slot-actions', 'has slot actions style');
assertIncludes(styles, '.save-slots-header', 'has header style');
assertIncludes(styles, '.save-slots-tabs', 'has tabs style');
assertIncludes(styles, '.tab-btn', 'has tab button style');
assertIncludes(styles, '.active-tab', 'has active tab style');
assertIncludes(styles, '.save-slots-footer', 'has footer style');
assertIncludes(styles, '.empty-slot', 'has empty slot style');
assertIncludes(styles, '.btn-delete-slot', 'has delete button style');
assert(styles.length > 200, 'styles have substantial content');

// ========== Integration: renderSlotCard inside renderSaveSlotsList ==========
console.log('\n--- Integration ---');
const singleSlot = [{ index: 0, exists: true, savedAt: '2026-06-15T08:45:00Z', playerName: 'IntegrationTest', turn: 99 }];
const intList = renderSaveSlotsList(singleSlot, 'load');
assertIncludes(intList, 'IntegrationTest', 'slot card content appears in full list');
assertIncludes(intList, 'Turn 99', 'turn appears in full list');
assertIncludes(intList, 'btn-load-slot', 'load button appears in full list');

// ========== No Easter Eggs Verification ==========
console.log('\n--- No Easter Eggs ---');
const allExports = [MAX_SAVE_SLOTS, formatSaveDate, renderSlotCard, renderSaveSlotsList, getSaveSlotsStyles];
assert(allExports.every(e => e !== undefined), 'all exports are defined');
const fullOutput = renderSaveSlotsList(allOccupied, 'save') + renderSaveSlotsList(allOccupied, 'load') + getSaveSlotsStyles();
assertNotIncludes(fullOutput.toLowerCase(), 'easter', 'no easter references');
assertNotIncludes(fullOutput.toLowerCase(), 'hidden', 'no hidden references');
assertNotIncludes(fullOutput.toLowerCase(), 'secret', 'no secret references');
assertNotIncludes(fullOutput, '<script', 'no script tags in output');

console.log(`\nSave Slots UI Tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
