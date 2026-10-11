import type { Account, MaxLevelPlan, summonCharacter, SummonDraw } from '../game/account';
import type { BattleState, BattleEvent, BattleResult } from '../game/battle';
import type { CharacterProgress } from '../content/progression';
import { isStarterId, type StarterId } from '../content/starters';
import type { ActionId } from '../content/combat';
import type { ConduitId } from '../content/conduits';
import type { ElementId, InfusionModeId } from '../content/activities';
import type { WarCharacterId } from '../content/elemental-war';
import type { SummonBannerId } from '../content/summon-banners';
import { bannerMaterialDefinition, bannerDuplicateMaterialAmount } from '../content/banner-materials';
import { onlineClient } from './account-client';
import { validateAccount } from '../game/account';
import type { SaveFile } from '../game/save-file';
import type { MasterConduitId } from '../content/master-conduits';

export type ProfileFrame = 'default' | 'thin-outline' | 'double-outline' | 'corner-brackets';
export interface OnlineProfile {
  username: string;
  displayName: string;
  bio: string;
  icon: 'neutral' | StarterId;
  frame: ProfileFrame;
  ownedFrames: ProfileFrame[];
  createdAt: string;
  totalDraws: number;
  statistics: { storyCompleted: number; ownedBearers: number; capturedCreatures: number; discoveredCreatures: number };
}
export type Activity = { kind: 'training' } | { kind: 'story'; stage: number } |
  { kind: 'dungeon'; element: ElementId; stage: number } |
  { kind: 'infusion'; mode: InfusionModeId; stage: number } |
  { kind: 'war'; character: WarCharacterId; stage: number };
export interface ServerBattleSession {
  state: BattleState;
  log: string[];
  runId: string;
  progress: CharacterProgress;
  teamProgress: Partial<Record<StarterId, CharacterProgress>>;
  stageEvents: BattleEvent[];
  entrancePending?: boolean;
  resultsVisible?: boolean;
}
export type GameOperation =
  | { kind: 'read' }
  | { kind: 'friendRequest'; username: string }
  | { kind: 'acceptFriendRequest' | 'declineFriendRequest' | 'cancelFriendRequest' | 'removeFriend'; userId: string }
  | { kind: 'bootstrap'; starterId: 'ember' | 'tide' | 'sprout' }
  | { kind: 'importSave'; save: SaveFile }
  | { kind: 'setSquad'; ids: string[] }
  | { kind: 'setCharacterLock'; id: string; locked: boolean }
  | { kind: 'summon'; bannerId: SummonBannerId }
  | { kind: 'summonTen'; bannerId: SummonBannerId }
  | { kind: 'sellCurrencyCreature'; id: string; saleOption?: string }
  | { kind: 'purchaseConduit'; id: ConduitId }
  | { kind: 'equipConduit'; character: string; slot: number; conduit: ConduitId | null }
  | { kind: 'openMasterChest'; id: MasterConduitId }
  | { kind: 'equipMasterConduit'; character: StarterId; conduit: MasterConduitId | null }
  | { kind: 'upgradeConduit'; id: ConduitId; expectedLevel: number }
  | { kind: 'upgradeCharacter'; id: StarterId; upgradeKind: 'level' | 'evolve' | 'weapon'; expected: CharacterProgress; fodderIds?: string[] }
  | { kind: 'levelCaptured'; id: string; expectedLevel: number }
  | { kind: 'levelMax'; id: string; expected: MaxLevelPlan }
  | { kind: 'purchaseMaterial'; element: string; quantity: 1 | 5 | 10 }
  | { kind: 'purchaseFrame'; frame: ProfileFrame }
  | { kind: 'updateProfile'; displayName: string; bio: string; icon: 'neutral' | StarterId; frame: ProfileFrame }
  | { kind: 'enter'; activity: Activity }
  | { kind: 'act'; runId: string; actorId: string; action: ActionId; targetId: string }
  | { kind: 'endTurn' | 'continue' | 'retry' | 'quit'; runId: string };
export interface GameRequest {
  requestId: string;
  expectedRevision: number;
  operation: GameOperation;
}
export interface SocialPlayer {
  userId: string; username: string; displayName: string; icon: 'neutral' | StarterId; frame: ProfileFrame;
}
export interface OnlineSocial { friends: SocialPlayer[]; incoming: SocialPlayer[]; outgoing: SocialPlayer[] }
export interface GameResponse {
  revision: number;
  account: Account;
  starterId: StarterId | null;
  profile: OnlineProfile;
  session: ServerBattleSession | null;
  result?: BattleResult;
  summon?: ReturnType<typeof summonCharacter>;
  summons?: SummonDraw[];
  social: OnlineSocial;
}
export class GameOperationError extends Error {
  constructor(message: string, public readonly status?: number) { super(message); }
}
function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function safeCount(value: unknown): boolean {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}
const profileFrames: readonly string[] = ['default', 'thin-outline', 'double-outline', 'corner-brackets'];
function validSummonDraw(draw: unknown): boolean {
  if (!object(draw) || !object(draw.entry) || !['character', 'creature', 'material'].includes(String(draw.entry.kind)) ||
    typeof draw.entry.id !== 'string' || typeof draw.duplicate !== 'boolean' || typeof draw.guarantee !== 'string') return false;
  if (draw.materials !== undefined && (!object(draw.materials) || typeof draw.materials.id !== 'string' ||
    !safeCount(draw.materials.amount) || draw.materials.amount === 0)) return false;
  if (draw.entry.kind === 'material' && !object(draw.materials)) return false;
  if (!object(draw.materials)) return true;
  try {
    const material = bannerMaterialDefinition(String(draw.materials.id));
    return draw.copy === undefined && (draw.duplicate
      ? draw.entry.kind === 'character' && material.rarity === 'Rare' && draw.materials.amount === bannerDuplicateMaterialAmount
      : draw.entry.kind === 'material' && draw.entry.id === material.id &&
        draw.entry.amount === material.amount && draw.materials.amount === material.amount);
  } catch { return false; }
}
function peer(value: unknown): boolean {
  return object(value) && typeof value.userId === 'string' && /^[0-9a-f-]{36}$/i.test(value.userId) &&
    typeof value.username === 'string' && /^[a-z0-9_]{3,16}$/.test(value.username) &&
    typeof value.displayName === 'string' && [...value.displayName].length <= 16 &&
    (value.icon === 'neutral' || isStarterId(value.icon)) && typeof value.frame === 'string' && profileFrames.includes(value.frame);
}
function battleState(value: unknown): boolean {
  return object(value) && ['player', 'cleared', 'defeat'].includes(String(value.phase)) &&
    safeCount(value.wave) && safeCount(value.round) && typeof value.seed === 'number' &&
    Array.isArray(value.allies) && value.allies.length > 0 && value.allies.length <= 3 &&
    Array.isArray(value.enemies) && value.enemies.length > 0 &&
    [...value.allies, ...value.enemies].every(unit => object(unit) && typeof unit.id === 'string' &&
      typeof unit.name === 'string' && typeof unit.hp === 'number' && Number.isFinite(unit.hp) &&
      object(unit.stats) && typeof unit.stats.health === 'number' && Number.isFinite(unit.stats.health));
}
function battleEvents(value: unknown): boolean {
  return Array.isArray(value) && value.every(event => object(event) &&
    ['attack', 'damage', 'heal', 'shield', 'status', 'turn', 'reward'].includes(String(event.kind)) &&
    typeof event.source === 'string' && typeof event.target === 'string' &&
    typeof event.amount === 'number' && Number.isFinite(event.amount) && typeof event.message === 'string');
}
export function validateGameResponse(value: unknown): GameResponse {
  const invalid = () => { throw new GameOperationError('The server returned an incomplete response.'); };
  if (!object(value) || !safeCount(value.revision) ||
    !(value.starterId === null || isStarterId(value.starterId)) ||
    !object(value.profile) || !object(value.social)) return invalid();
  const profile = value.profile;
  if (typeof profile.username !== 'string' || !/^[a-z0-9_]{3,16}$/.test(profile.username) ||
    typeof profile.displayName !== 'string' || [...profile.displayName].length > 16 ||
    typeof profile.bio !== 'string' || [...profile.bio].length > 120 ||
    !(profile.icon === 'neutral' || isStarterId(profile.icon)) || typeof profile.frame !== 'string' || !profileFrames.includes(profile.frame) ||
    !Array.isArray(profile.ownedFrames) || !profile.ownedFrames.every(frame => typeof frame === 'string' && profileFrames.includes(frame)) ||
    !profile.ownedFrames.includes(profile.frame) || typeof profile.createdAt !== 'string' ||
    !Number.isFinite(Date.parse(profile.createdAt)) || !safeCount(profile.totalDraws) ||
    !object(profile.statistics) ||
    !['storyCompleted', 'ownedBearers', 'capturedCreatures', 'discoveredCreatures'].every(key => safeCount(profile.statistics && (profile.statistics as Record<string, unknown>)[key]))) return invalid();
  for (const key of ['friends', 'incoming', 'outgoing']) {
    if (!Array.isArray(value.social[key]) || !(value.social[key] as unknown[]).every(peer)) return invalid();
  }
  if (value.session !== null) {
    const session = value.session;
    if (!object(session) || typeof session.runId !== 'string' || !/^[0-9a-f-]{36}$/i.test(session.runId) ||
      !battleState(session.state) || !Array.isArray(session.log) || !session.log.every(line => typeof line === 'string') ||
      !object(session.progress) || !safeCount(session.progress.level) || !safeCount(session.progress.evolution) ||
      !object(session.teamProgress) || !battleEvents(session.stageEvents)) return invalid();
  }
  if (value.result !== undefined && (!object(value.result) ||
    !battleState(value.result.state) || !battleEvents(value.result.events))) return invalid();
  if (value.summon !== undefined && (!object(value.summon) || !object(value.summon.account) || !validSummonDraw(value.summon))) return invalid();
  if (value.summons !== undefined && (!Array.isArray(value.summons) || value.summons.length !== 10 ||
    !value.summons.every(validSummonDraw))) return invalid();
  try {
    const account = validateAccount(value.account);
    if (value.starterId !== null && !account.characters[value.starterId]) return invalid();
    if (profile.icon !== 'neutral' && !account.characters[profile.icon]) return invalid();
  } catch { return invalid(); }
  return value as unknown as GameResponse;
}

/** Retain requestId and revision when retrying a transport failure. Never resubmit a wallet. */
export async function gameOperation(operation: GameOperation, expectedRevision = 0,
  requestId: string = crypto.randomUUID()): Promise<GameResponse> {
  const { data, error } = await onlineClient().functions.invoke('game-operation', {
    body: { requestId, expectedRevision, operation } satisfies GameRequest,
  });
  if (error) {
    if ('context' in error && error.context instanceof Response) {
      const body = await error.context.json().catch(() => null) as { error?: string } | null;
      throw new GameOperationError(body?.error ?? 'Online operation failed.', error.context.status);
    }
    throw new GameOperationError('Connection failed. Retry the same request ID before issuing another operation.');
  }
  return validateGameResponse(data);
}
