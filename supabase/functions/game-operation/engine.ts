import {
  ACCOUNT_KEY, emptyAccount, loadAccount, saveAccount, validateAccount, equippedSquad, ownedCharacters,
  ownedCharacterInstances, ownedProgress, setSquad, setCharacterLock, summonCharacter, summonCharacters, multiSummonCount,
  purchaseExchangeMaterial, type SummonDraw, sellCurrencyCreature,
  purchaseConduit, equipConduit, unequipAllConduits, openMasterChest, openCalamityChest, equipMasterConduit, upgradeConduit, upgradeConduitToMaximum, upgradeCharacter, levelCapturedCharacter,
  levelCharacterToMaximum, saveAccountRewards, unlockedStage, unlockedInfusionStage,
  unlockedWarStage, unlockedStoryStage, type Account,
} from '../../../src/game/account';
import { SAVE_KEY, type ProfileStorage } from '../../../src/game/profile';
import { createBattle, createCalamityBattle, createStoryBattle, createDungeonBattle, createInfusionBattle, createWarBattle,
  actAndAdvanceTurn, endTurn, advanceUnavailableTurns, nextStage, nextWave, actionUnavailable,
  withMasterLoadouts, capCapturedBattleLevels, type BattleResult } from '../../../src/game/battle';
import { validateCapturedCharacters } from '../../../src/game/character-instances';
import type { MasterLoadouts } from '../../../src/content/master-conduits';
import { isStarterId, type StarterId } from '../../../src/content/starters';
import { isActionId } from '../../../src/content/combat';
import { elements } from '../../../src/content/activities';
import { isPlayableDungeon } from '../../../src/content/dungeons';
import { isInfusionMode } from '../../../src/content/infusions';
import { storyRules } from '../../../src/content/story';
import { isWarCharacter } from '../../../src/content/elemental-war';
import { isCalamityActivityId, isCalamityTier, parseCalamityChestId } from '../../../src/content/calamity';
import type { Activity, GameOperation, GameRequest, GameResponse, OnlineProfile, ProfileFrame,
  ProfileActivity, ServerBattleSession, ChatOperation, ChatRequest, FriendProfileResponse } from '../../../src/online/server-game';
import { redactFriendAccount } from '../../../src/game/friend-profile';
import { isProfilePictureId, profilePictureUnlocked } from '../../../src/content/profile-pictures';
// Runtime values stay local: importing server-game would bundle the browser Supabase client.
const chatMessageLength = 500, chatGroupNameLength = 48, chatGroupMembers = 10;
function isProfileIcon(value: unknown): value is OnlineProfile['icon'] {
  return value === 'neutral' || isStarterId(value) || isProfilePictureId(value);
}
export function profileIconUnlocked(account: Account, icon: OnlineProfile['icon']): boolean {
  if (icon === 'neutral') return true;
  return isStarterId(icon) ? ownedCharacters(account).includes(icon) : profilePictureUnlocked(account, icon);
}
import type { CapturedCharacter } from '../../../src/game/character-instances';
import type { ConduitLoadouts, ConduitUpgrades } from '../../../src/content/conduits';
import { getConduit } from '../../../src/content/conduits';
import { assertActivityAccess } from '../../../src/game/activity-access';
import { validateSaveFile } from '../../../src/game/save-file';
import { conduitRulesVersion } from '../../../src/game/conduit-runtime';
export { conduitRulesVersion };
import { atTrainingWave, conduitRestartNotice } from '../../../src/presentation/conduit-compatibility';

export interface DurableRun {
  session: ServerBattleSession;
  activity: Activity;
  roster: string[];
  equipment: ConduitLoadouts;
  captures: CapturedCharacter[];
  upgrades: ConduitUpgrades;
  masters?: MasterLoadouts;
}
export interface DurableGame {
  account: Account;
  starterId: StarterId | null;
  profile: OnlineProfile;
  run: DurableRun | null;
}
export function profileActivityFor(operation: GameOperation, previousStoryCompleted: number,
  resolved: { game: DurableGame; response: GameResponse }, uuid: () => string): Omit<ProfileActivity, 'at'> | null {
  if (operation.kind === 'bootstrap') return {
    id: uuid(), message: 'Starter selected', detail: `${operation.starterId} Element-Bearer`,
  };
  if (operation.kind === 'importSave') return {
    id: uuid(), message: 'Save imported', detail: 'Existing save moved online',
  };
  if (operation.kind === 'summon' || operation.kind === 'summonTen') return {
    id: uuid(), message: 'Summoned',
    detail: `${operation.bannerId === 'roses' ? 'Crimson Roses' : 'Standard'} · ${operation.kind === 'summonTen' ? 10 : 1} draw${operation.kind === 'summonTen' ? 's' : ''}`,
  };
  if (operation.kind === 'purchaseConduit') return {
    id: uuid(), message: 'Conduit purchased', detail: getConduit(operation.id).name,
  };
  if (resolved.response.result?.state.phase === 'cleared' && resolved.game.run?.activity.kind === 'story') {
    const stage = resolved.game.run.activity.stage;
    const completed = resolved.game.account.storyCompleted ?? 0;
    const restoredBeacon = Math.floor(completed / storyRules.regionStages) > Math.floor(previousStoryCompleted / storyRules.regionStages);
    return {
      id: uuid(), message: 'Story stage cleared',
      detail: `${restoredBeacon ? 'Beacon restored · ' : ''}Story · Stage ${stage}`,
    };
  }
  return null;
}
export const frames: ProfileFrame[] = ['default', 'thin-outline', 'double-outline', 'corner-brackets'];
export function freshGame(username: string, createdAt = new Date().toISOString()): DurableGame {
  return { account: emptyAccount(), starterId: null, run: null, profile: {
    username, displayName: username, bio: '', icon: 'neutral', frame: 'default', ownedFrames: ['default'],
    createdAt, totalDraws: 0,
    statistics: { storyCompleted: 0, ownedBearers: 0, capturedCreatures: 0, discoveredCreatures: 0 },
  } };
}
function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
function keys(value: Record<string, unknown>, allowed: string[]): void {
  if (Object.keys(value).some(key => !allowed.includes(key))) throw new Error('Unexpected request field.');
}
function text(value: unknown, maximum = 100): asserts value is string {
  if (typeof value !== 'string' || !value.length || value.length > maximum) throw new Error('Invalid text input.');
}
function integer(value: unknown): asserts value is number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) throw new Error('Invalid integer input.');
}
const operationKeys: Record<GameOperation['kind'], string[]> = {
  friendRequest: ['username', 'friendCode'], acceptFriendRequest: ['userId'], declineFriendRequest: ['userId'],
  cancelFriendRequest: ['userId'], removeFriend: ['userId'],
  read: [], checkpoint: [], bootstrap: ['starterId'], importSave: ['save'], setSquad: ['ids'], setCharacterLock: ['id', 'locked'],
  summon: ['bannerId'], summonTen: ['bannerId'], sellCurrencyCreature: ['id', 'saleOption'], purchaseConduit: ['id'],
  equipConduit: ['character', 'slot', 'conduit'], upgradeConduit: ['id', 'expectedLevel'],
  maxConduit: ['expected'],
  unequipAllConduits: ['character'],
  openMasterChest: ['id'], equipMasterConduit: ['character', 'conduit'],
  openCalamityChest: ['id', 'expectedCount'],
  upgradeCharacter: ['id', 'upgradeKind', 'expected', 'fodderIds'], levelCaptured: ['id', 'expectedLevel'],
  levelMax: ['id', 'expected'], purchaseMaterial: ['element', 'quantity'], purchaseFrame: ['frame'],
  updateProfile: ['displayName', 'bio', 'icon', 'frame'], enter: ['activity'],
  act: ['runId', 'actorId', 'action', 'targetId'], endTurn: ['runId'], continue: ['runId'],
  retry: ['runId'], quit: ['runId'],
};
export function validateRequest(value: unknown): GameRequest {
  if (!record(value)) throw new Error('Request must be an object.');
  keys(value, ['requestId', 'expectedRevision', 'operation']);
  if (typeof value.requestId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.requestId)) {
    throw new Error('A UUID request ID is required.');
  }
  integer(value.expectedRevision);
  if (!record(value.operation) || typeof value.operation.kind !== 'string' ||
      !Object.hasOwn(operationKeys, value.operation.kind)) throw new Error('Unknown game operation.');
  const op = value.operation;
  if (op.kind === 'importSave') validateSaveFile(op.save);
  keys(op, ['kind', ...operationKeys[op.kind as GameOperation['kind']]]);
  if (operationKeys[op.kind as GameOperation['kind']].some(key => key !== 'fodderIds' && key !== 'saleOption' &&
      !(op.kind === 'friendRequest' && (key === 'username' || key === 'friendCode')) && !(key in op))) throw new Error('Missing operation field.');
  for (const field of ['id', 'character', 'runId', 'actorId', 'targetId', 'bannerId', 'starterId', 'element', 'frame', 'upgradeKind', 'action', 'saleOption']) {
    if (field in op) text(op[field]);
  }
  for (const field of ['slot', 'expectedLevel', 'quantity', 'expectedCount']) if (field in op) integer(op[field]);
  if (op.kind === 'openCalamityChest') {
    parseCalamityChestId(op.id as string);
    if ((op.expectedCount as number) < 1) throw new Error('Choose an owned Calamity chest.');
  }
  if ('locked' in op && typeof op.locked !== 'boolean') throw new Error('Invalid lock.');
  for (const field of ['ids', 'fodderIds']) if (field in op) {
    if (!Array.isArray(op[field]) || op[field].length > 3 || !op[field].every(id => typeof id === 'string' && id.length > 0 && id.length <= 100)) throw new Error('Invalid character IDs.');
  }
  if (op.kind === 'upgradeCharacter') {
    if (!record(op.expected)) throw new Error('Invalid expected progress.');
    keys(op.expected, ['level', 'evolution', 'weaponRank']);
    integer(op.expected.level); integer(op.expected.evolution);
    if ('weaponRank' in op.expected) integer(op.expected.weaponRank);
  }
  if (op.kind === 'maxConduit') {
    if (!record(op.expected)) throw new Error('Invalid Conduit Max Level preview.');
    keys(op.expected, ['id', 'currentLevel', 'targetLevel', 'cost']);
    text(op.expected.id);
    for (const field of ['currentLevel', 'targetLevel', 'cost']) integer(op.expected[field]);
  }
  if (op.kind === 'levelMax') {
    if (!record(op.expected) || op.expected.id !== op.id) throw new Error('Invalid Max Level preview.');
    keys(op.expected, ['id', 'currentLevel', 'targetLevel', 'cap', 'cost', 'progressKey']);
    for (const field of ['currentLevel', 'targetLevel', 'cap']) integer(op.expected[field]);
    text(op.expected.progressKey, 8192);
    if (!record(op.expected.cost) || !record(op.expected.cost.materials)) throw new Error('Invalid Max Level cost.');
    keys(op.expected.cost, ['fractalis', 'materials']);
    integer(op.expected.cost.fractalis);
    for (const amount of Object.values(op.expected.cost.materials)) integer(amount);
  }
  if (op.kind === 'enter') {
    if (!record(op.activity) || !['training', 'story', 'dungeon', 'infusion', 'war', 'calamity'].includes(String(op.activity.kind))) throw new Error('Invalid activity.');
    if (op.activity.kind === 'calamity') {
      keys(op.activity, ['kind', 'activity', 'tier']);
      if (!isCalamityActivityId(op.activity.activity) || !isCalamityTier(op.activity.tier)) throw new Error('Invalid Calamity activity or tier.');
    } else {
    keys(op.activity, op.activity.kind === 'training' ? ['kind'] : op.activity.kind === 'story' ? ['kind', 'stage'] :
      ['kind', 'stage', op.activity.kind === 'dungeon' ? 'element' : op.activity.kind === 'infusion' ? 'mode' : 'character']);
    if (op.activity.kind !== 'training') integer(op.activity.stage);
    }
  }
  if (op.kind === 'updateProfile') {
    if (typeof op.displayName !== 'string' || !op.displayName.trim().length || [...op.displayName].length > 16 ||
      typeof op.bio !== 'string' || [...op.bio].length > 120 ||
      /[\u0000-\u001f\u007f]/.test(op.displayName + op.bio) ||
      !isProfileIcon(op.icon)) throw new Error('Invalid profile fields.');
  }
  if (op.kind === 'friendRequest') {
    const hasUsername = typeof op.username === 'string';
    const hasCode = typeof op.friendCode === 'string';
    if (hasUsername === hasCode ||
        (hasUsername && !/^[a-z0-9_]{3,16}$/i.test(op.username as string)) ||
        (hasCode && !/^LL-[0-9A-F]{4}-[0-9A-F]{4}$/i.test(op.friendCode as string))) {
      throw new Error('Enter a valid friend username or friend code.');
    }
  }
  if ('userId' in op && (typeof op.userId !== 'string' || !/^[0-9a-f-]{36}$/i.test(op.userId))) throw new Error('Invalid friend user ID.');
  return value as unknown as GameRequest;
}
const chatKeys: Record<ChatOperation['kind'], { required: string[]; optional?: string[] }> = {
  read: { required: [], optional: ['conversationId', 'before'] }, direct: { required: ['userId'] },
  createGroup: { required: ['name', 'userIds'] }, send: { required: ['conversationId', 'text'] },
  invite: { required: ['conversationId', 'userId'] }, respondInvite: { required: ['conversationId', 'accept'] },
  removeMember: { required: ['conversationId', 'userId'] }, leave: { required: ['conversationId'] },
  preferences: { required: ['conversationId'], optional: ['pinned', 'muted'] },
  block: { required: ['userId'] }, unblock: { required: ['userId'] },
};
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const chatControl = /[\u0000-\u0008\u000b-\u001f\u007f]/;
/** Shape-only validation; Postgres private.chat_operation owns every authorization rule. */
export function validateChatRequest(value: unknown): ChatRequest {
  if (!record(value)) throw new Error('Request must be an object.');
  keys(value, ['requestId', 'chat']);
  if (typeof value.requestId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.requestId)) {
    throw new Error('A UUID request ID is required.');
  }
  const op = value.chat;
  if (!record(op) || typeof op.kind !== 'string' || !Object.hasOwn(chatKeys, op.kind)) throw new Error('Unknown chat operation.');
  const shape = chatKeys[op.kind as ChatOperation['kind']];
  keys(op, ['kind', ...shape.required, ...(shape.optional ?? [])]);
  if (shape.required.some(key => !(key in op))) throw new Error('Missing chat field.');
  for (const key of ['conversationId', 'before', 'userId']) {
    if (key in op && (typeof op[key] !== 'string' || !uuid.test(op[key] as string))) throw new Error('Invalid chat identifier.');
  }
  for (const key of ['accept', 'pinned', 'muted']) if (key in op && typeof op[key] !== 'boolean') throw new Error('Invalid chat option.');
  if ('before' in op && !('conversationId' in op)) throw new Error('Choose a conversation to page.');
  if (op.kind === 'preferences' && !('pinned' in op) && !('muted' in op)) throw new Error('Choose a chat preference.');
  if ('text' in op) {
    const body = typeof op.text === 'string' ? op.text.trim() : '';
    if (!body || [...body].length > chatMessageLength || chatControl.test(body.replace(/\r\n/g, '\n'))) {
      throw new Error(`Messages must be 1-${chatMessageLength} characters of plain text.`);
    }
  }
  if ('name' in op) {
    const name = typeof op.name === 'string' ? op.name.trim() : '';
    if (!name || [...name].length > chatGroupNameLength || /[\u0000-\u001f\u007f]/.test(name)) throw new Error('Invalid group name.');
  }
  if ('userIds' in op && (!Array.isArray(op.userIds) || op.userIds.length > chatGroupMembers - 1 ||
      !op.userIds.every(id => typeof id === 'string' && uuid.test(id)) ||
      new Set(op.userIds.map(id => (id as string).toLowerCase())).size !== op.userIds.length)) {
    throw new Error(`Invite up to ${chatGroupMembers - 1} distinct friends.`);
  }
  return value as unknown as ChatRequest;
}
export interface FriendProfileRequest { requestId: string; friendProfile: { userId: string } }
export function validateFriendProfileRequest(value: unknown): FriendProfileRequest {
  if (!record(value)) throw new Error('Request must be an object.');
  keys(value, ['requestId', 'friendProfile']);
  if (typeof value.requestId !== 'string' || !uuid.test(value.requestId)) throw new Error('A UUID request ID is required.');
  if (!record(value.friendProfile)) throw new Error('Choose a friend.');
  keys(value.friendProfile, ['userId']);
  if (typeof value.friendProfile.userId !== 'string' || !uuid.test(value.friendProfile.userId)) throw new Error('Invalid friend user ID.');
  return value as unknown as FriendProfileRequest;
}
/** Friend view (D-340): the friend's own profile screen, redacted to collection/progress data only. */
export function friendProfileView(row: unknown): FriendProfileResponse {
  if (!record(row) || typeof row.userId !== 'string' || typeof row.username !== 'string' || typeof row.createdAt !== 'string') {
    throw new Error('Friend profile unavailable.');
  }
  const stored = record(row.state) ? row.state as unknown as DurableGame : freshGame(row.username, row.createdAt);
  const account = redactFriendAccount(stored.account);
  const source = record(stored.profile) ? stored.profile : freshGame(row.username, row.createdAt).profile;
  const reference = record(row.reference) ? row.reference : {};
  const icon = isProfileIcon(source.icon) && profileIconUnlocked(account, source.icon) ? source.icon : 'neutral';
  const recent = Array.isArray(reference.recentActivity) ? reference.recentActivity.filter(entry => record(entry) &&
    typeof entry.id === 'string' && typeof entry.message === 'string' && typeof entry.detail === 'string' && typeof entry.at === 'string') : [];
  return {
    userId: row.userId, account,
    profile: {
      username: row.username, createdAt: row.createdAt,
      displayName: typeof source.displayName === 'string' && source.displayName ? source.displayName : row.username,
      bio: typeof source.bio === 'string' ? source.bio : '',
      icon, frame: typeof source.frame === 'string' && frames.includes(source.frame as ProfileFrame) ? source.frame as ProfileFrame : 'default',
      totalDraws: Number.isSafeInteger(source.totalDraws) ? source.totalDraws as number : 0,
      ...(typeof reference.friendCode === 'string' ? { friendCode: reference.friendCode } : {}),
      ...(typeof reference.playerId === 'string' ? { playerId: reference.playerId } : {}),
      ...(Number.isSafeInteger(reference.daysPlayed) ? { daysPlayed: reference.daysPlayed as number } : {}),
      ...(Number.isSafeInteger(reference.playTimeSeconds) ? { playTimeSeconds: reference.playTimeSeconds as number } : {}),
      recentActivity: recent as ProfileActivity[],
    },
  };
}
class VirtualStorage implements ProfileStorage {
  private items = new Map<string, string>();
  constructor(game: DurableGame) {
    this.items.set(ACCOUNT_KEY, JSON.stringify(game.account));
    if (game.starterId) this.items.set(SAVE_KEY, JSON.stringify({ version: 1, starterId: game.starterId }));
  }
  getItem(key: string): string | null { return this.items.get(key) ?? null; }
  setItem(key: string, value: string): void { this.items.set(key, value); }
  removeItem(key: string): void { this.items.delete(key); }
}
/**
 * Pre-v6 Story runs used the 25-stage layout (D-340); pre-v7 runs may hold Heaven/Abyss/Machines stages or
 * captured-copy snapshots on the former 35/100-stage layouts (D-346); pre-v8 Story runs used 18-stage regions
 * (D-347). Those stage numbers no longer exist, so the unfinished run is discarded; per-kill rewards were already saved.
 */
function isLegacyStoryRun(game: DurableGame): boolean {
  const version = (game.account as { version?: unknown }).version;
  return typeof version === 'number' && version < 8 && !!game.run;
}
/** Story clears on the current layout, converting a stored pre-v6 count without writing. */
export function storyCompletedOf(game: DurableGame): number {
  return validateAccount(game.account).storyCompleted ?? 0;
}
export function publicGame(stored: DurableGame, revision: number): GameResponse {
  const game = isLegacyStoryRun(stored) ? { ...stored, run: null } : stored;
  const account = validateAccount(game.account);
  if (game.run) validateRunActivity(game.run);
  const session = game.run ? structuredClone(game.run.session) : null;
  if (session) capCapturedBattleLevels(session.state);
  const profile = { ...game.profile, statistics: {
    storyCompleted: account.storyCompleted ?? 0, ownedBearers: ownedCharacters(account).length,
    capturedCreatures: account.capturedCharacters?.length ?? 0,
    discoveredCreatures: Object.keys(account.creatures).length,
  } };
  return { revision, account: structuredClone(account), starterId: game.starterId, profile,
    session,
    social: { friends: [], incoming: [], outgoing: [] } };
}
function validateRunActivity(run: DurableRun): void {
  validateRequest({ requestId: '00000000-0000-4000-8000-000000000001', expectedRevision: 0,
    operation: { kind: 'enter', activity: run.activity } });
  const calamity = run.session.state.calamity;
  if (run.activity.kind === 'calamity') {
    if (!record(calamity) || !isCalamityActivityId(calamity.activity) || !isCalamityTier(calamity.tier) ||
      calamity.activity !== run.activity.activity || calamity.tier !== run.activity.tier) throw new Error('Unsupported saved Calamity encounter.');
  } else if (calamity !== undefined) throw new Error('Unsupported saved Calamity encounter.');
}
function gate(account: Account, activity: Activity, entering = true): void {
  if (entering) assertActivityAccess(account, activity);
  if (activity.kind === 'calamity') {
    assertActivityAccess(account, activity);
    return;
  }
  if (activity.kind === 'training') return;
  if (!Number.isInteger(activity.stage) || activity.stage < 1) throw new Error('Invalid stage.');
  const maximum = activity.kind === 'story' ? unlockedStoryStage(account) :
    activity.kind === 'dungeon' && isPlayableDungeon(activity.element) ? unlockedStage(account, activity.element) :
    activity.kind === 'infusion' && isInfusionMode(activity.mode) ? unlockedInfusionStage(account, activity.mode) :
    activity.kind === 'war' && isWarCharacter(activity.character) ? unlockedWarStage(account, activity.character) : 0;
  if (activity.stage > maximum) throw new Error('Activity stage is locked or unavailable.');
}
function encounter(game: DurableGame, run: DurableRun, seed: number, trainingWave = 1) {
  const s = run.session;
  if (!game.starterId) throw new Error('Choose a starter first.');
  const teamProgress = s.teamProgress ?? { [game.starterId]: s.progress };
  const masters = run.masters ?? Object.fromEntries((s.state?.allies ?? [])
    .filter(unit => unit.masterConduit).map(unit => [unit.definitionId, unit.masterConduit]));
  const args = [seed, game.starterId, s.progress, run.roster, teamProgress, run.equipment, run.captures, run.upgrades] as const;
  const a = run.activity;
  const state = withMasterLoadouts(a.kind === 'training' ? atTrainingWave(createBattle(seed, run.roster, teamProgress, run.equipment, run.captures, run.upgrades), trainingWave) :
    a.kind === 'calamity' ? createCalamityBattle(a.activity, a.tier, ...args) :
    a.kind === 'story' ? createStoryBattle(a.stage, ...args) :
    a.kind === 'dungeon' ? createDungeonBattle(a.element, a.stage, ...args) :
    a.kind === 'infusion' ? createInfusionBattle(a.mode, a.stage, ...args, s.state ? s.state.infusion?.schedule ?? 'legacy' : 'caps') : createWarBattle(a.character, a.stage, ...args), masters);
  if (state.infusion?.mode === 'machines') state.machineConduits = { ...game.account.conduits };
  return state;
}
export function resolveOperation(previous: DurableGame, operation: GameOperation,
  entropy: { seed(): number; uuid(): string; random(): number }): { game: DurableGame; response: GameResponse } {
  validateRequest({ requestId: '00000000-0000-4000-8000-000000000001', expectedRevision: 0, operation });
  const game = structuredClone(previous);
  if (isLegacyStoryRun(game)) game.run = null;
  game.account = validateAccount(game.account);
  if (game.run) {
    validateRunActivity(game.run);
    game.run.captures = validateCapturedCharacters(game.run.captures);
    capCapturedBattleLevels(game.run.session.state);
  }
  if (game.run && game.run.session.state.conduitRulesVersion !== conduitRulesVersion) {
    const run = game.run;
    if ('runId' in operation && operation.runId !== run.session.runId) throw new Error('This battle run is no longer active.');
    if (operation.kind !== 'quit') {
      const wave = run.session.state.wave;
      run.session.state = encounter(game, run, entropy.seed(), wave);
      run.session.runId = entropy.uuid();
      run.session.stageEvents = [];
      run.session.entrancePending = true;
      run.session.resultsVisible = false;
      run.session.log = [...run.session.log, conduitRestartNotice].slice(-100);
      // A command selected against the historical encounter must not act on its replacement.
      if (operation.kind === 'act' || operation.kind === 'endTurn' || operation.kind === 'continue' || operation.kind === 'retry') {
        return { game, response: publicGame(game, 0) };
      }
    }
  }
  const storage = new VirtualStorage(game);
  let result: BattleResult | undefined;
  let summon: ReturnType<typeof summonCharacter> | undefined;
  let summons: SummonDraw[] | undefined;
  let calamityOpening: GameResponse['calamityOpening'];
  if (operation.kind === 'read' || operation.kind === 'checkpoint') return { game, response: publicGame(game, 0) };
  if (operation.kind === 'bootstrap') {
    if (game.starterId || Object.keys(game.account.characters).length) throw new Error('Starter has already been selected.');
    if (!['ember', 'tide', 'sprout'].includes(operation.starterId)) throw new Error('Invalid initial starter.');
    game.starterId = operation.starterId;
    game.account.characters[operation.starterId] = { level: 0, evolution: 1, weaponRank: 0 };
    game.account.squad = [operation.starterId];
  } else if (operation.kind === 'importSave') {
    if (game.starterId || game.run || Object.keys(game.account.characters).length) throw new Error('Save files can only be imported into a new, unstarted online account.');
    const save = validateSaveFile(operation.save);
    game.account = save.account;
    game.starterId = save.profile.starterId;
  } else if (['friendRequest', 'acceptFriendRequest', 'declineFriendRequest', 'cancelFriendRequest', 'removeFriend'].includes(operation.kind)) {
    // The commit RPC validates and atomically changes the recipient graph.
  } else {
    if (!game.starterId) throw new Error('Choose your first Element-Bearer before playing.');
    switch (operation.kind) {
      case 'setSquad': setSquad(storage, operation.ids); break;
      case 'setCharacterLock': setCharacterLock(storage, operation.id, operation.locked); break;
      case 'summon':
        summon = summonCharacter(storage, entropy.random, operation.bannerId);
        game.profile.totalDraws++;
        if (!Number.isSafeInteger(game.profile.totalDraws)) throw new Error('Draw count overflow.');
        break;
      case 'summonTen':
        summons = summonCharacters(storage, entropy.random, operation.bannerId, multiSummonCount).draws;
        game.profile.totalDraws += multiSummonCount;
        if (!Number.isSafeInteger(game.profile.totalDraws)) throw new Error('Draw count overflow.');
        break;
      case 'sellCurrencyCreature': sellCurrencyCreature(storage, operation.id, operation.saleOption); break;
      case 'purchaseConduit': purchaseConduit(storage, operation.id); break;
      case 'equipConduit': equipConduit(storage, operation.character, operation.slot, operation.conduit); break;
      case 'unequipAllConduits': unequipAllConduits(storage, operation.character); break;
      case 'openMasterChest': openMasterChest(storage, operation.id); break;
      case 'openCalamityChest': {
        const reward = openCalamityChest(storage, operation.id, operation.expectedCount).reward;
        calamityOpening = { id: reward.id, name: reward.name, fractalis: reward.fractalis, lycalis: reward.lycalis,
          materials: reward.materials, conduits: reward.conduits, mechanicalComponents: reward.mechanicalComponents,
          calamiticTokens: reward.calamiticTokens, masterChests: reward.masterChests };
        break;
      }
      case 'equipMasterConduit': equipMasterConduit(storage, operation.character, operation.conduit); break;
      case 'upgradeConduit': upgradeConduit(storage, operation.id, operation.expectedLevel); break;
      case 'maxConduit': upgradeConduitToMaximum(storage, operation.expected); break;
      case 'upgradeCharacter':
        if (!isStarterId(operation.id) || !ownedCharacters(game.account).includes(operation.id)) throw new Error('Choose an owned Element-Bearer.');
        upgradeCharacter(storage, operation.id, operation.upgradeKind, operation.expected, operation.fodderIds); break;
      case 'levelCaptured': levelCapturedCharacter(storage, operation.id, operation.expectedLevel); break;
      case 'levelMax': levelCharacterToMaximum(storage, operation.expected); break;
      case 'purchaseMaterial':
        purchaseExchangeMaterial(storage, operation.element, operation.quantity); break;
      case 'purchaseFrame': {
        if (!frames.includes(operation.frame)) throw new Error('Unknown profile frame.');
        if (game.profile.ownedFrames.includes(operation.frame)) throw new Error('This profile frame is already owned.');
        const account = loadAccount(storage);
        if (account.lycalis < 10) throw new Error('Not enough Null-Prismatica.');
        account.lycalis -= 10; saveAccount(storage, account);
        game.profile.ownedFrames.push(operation.frame); break;
      }
      case 'updateProfile':
        if (!game.profile.ownedFrames.includes(operation.frame)) throw new Error('Choose an owned frame.');
        if (!profileIconUnlocked(game.account, operation.icon)) throw new Error('Choose an owned, unlocked profile picture.');
        Object.assign(game.profile, { displayName: operation.displayName.trim(), bio: operation.bio, icon: operation.icon, frame: operation.frame });
        break;
      case 'enter': {
        if (game.run) throw new Error('Quit the current run before entering another activity.');
        gate(game.account, operation.activity);
        const roster = equippedSquad(game.account);
        const teamProgress = structuredClone(game.account.characters);
        const run: DurableRun = {
          activity: structuredClone(operation.activity), roster,
          equipment: structuredClone(game.account.conduitEquipment ?? {}),
          captures: structuredClone(game.account.capturedCharacters ?? []),
          upgrades: structuredClone(game.account.conduitUpgrades ?? {}),
          masters: structuredClone(game.account.masterEquipment ?? {}),
          session: { state: null!, runId: entropy.uuid(), progress: ownedProgress(game.account, game.starterId),
            teamProgress, log: ['Authoritative encounter ready.'], stageEvents: [], entrancePending: true },
        };
        run.session.state = encounter(game, run, entropy.seed());
        game.run = run;
        result = advanceUnavailableTurns(run.session.state);
        break;
      }
      case 'act': case 'endTurn': case 'continue': case 'retry': case 'quit': {
        const run = game.run;
        if (!run || run.session.runId !== operation.runId) throw new Error('This battle run is no longer active.');
        const state = run.session.state;
        if (operation.kind === 'quit') { game.run = null; break; }
        if (state.infusion?.mode === 'machines') state.machineConduits = { ...game.account.conduits };
        if (operation.kind === 'act') {
          if (!isActionId(operation.action)) throw new Error('Invalid battle action.');
          const actor = state.allies.find(a => a.id === operation.actorId);
          if (!actor || actionUnavailable(state, actor, operation.action)) throw new Error('The selected squad member cannot use that action.');
          const targets = [...state.allies, ...state.enemies];
          if (!targets.some(t => t.id === operation.targetId && t.hp > 0)) throw new Error('Invalid battle target.');
          result = actAndAdvanceTurn(state, operation.actorId, operation.action, operation.targetId);
        } else if (operation.kind === 'endTurn') {
          if (state.phase !== 'player') throw new Error('Battle is not in the player phase.');
          const first = endTurn(state);
          const advanced = advanceUnavailableTurns(first.state);
          result = { state: advanced.state, events: [...first.events, ...advanced.events] };
        } else if (operation.kind === 'continue') {
          if (state.calamity || run.activity.kind === 'calamity') throw new Error('Calamity ends after one boss. Enter the next tier from Play.');
          if (state.phase !== 'cleared') throw new Error('Clear the encounter before continuing.');
          result = state.dungeon || state.infusion || state.war || state.story
            ? nextStage(state, run.session.teamProgress) : nextWave(state);
          if (run.activity.kind !== 'training') run.activity.stage++;
          gate(game.account, run.activity, false);
          run.session.stageEvents = []; run.session.entrancePending = true;
        } else {
          if (state.phase !== 'defeat' && run.activity.kind !== 'calamity' && !(state.phase === 'cleared' && run.activity.kind !== 'training')) {
            throw new Error('Retry requires defeat or a cleared stage.');
          }
          run.session.runId = entropy.uuid();
          run.session.stageEvents = []; run.session.entrancePending = true;
          result = advanceUnavailableTurns(encounter(game, run, entropy.seed()));
        }
        break;
      }
    }
    if (result && game.run) {
      saveAccountRewards(storage, result, game.run.session.runId);
      game.run.session.state = result.state;
      game.run.session.stageEvents.push(...result.events);
      game.run.session.log = [...game.run.session.log, ...result.events.map(e => e.message)].slice(-100);
      game.run.session.resultsVisible = result.state.phase !== 'player';
    }
    game.account = loadAccount(storage);
  }
  game.account = validateAccount(game.account);
  if (!isProfileIcon(game.profile.icon) || !profileIconUnlocked(game.account, game.profile.icon)) game.profile.icon = 'neutral';
  return { game, response: { ...publicGame(game, 0), ...(result ? { result } : {}), ...(summon ? { summon } : {}), ...(summons ? { summons } : {}), ...(calamityOpening ? { calamityOpening } : {}) } };
}
