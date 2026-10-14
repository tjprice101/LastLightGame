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
import { isProfilePictureId, profilePictureUnlocked, type ProfilePictureId } from '../content/profile-pictures';

export type ProfileFrame = 'default' | 'thin-outline' | 'double-outline' | 'corner-brackets';
/** Legacy 'neutral'/StarterId icons stay loadable; new choices use the 32 ProfilePictureId values. */
export type ProfileIcon = 'neutral' | StarterId | ProfilePictureId;
export function isProfileIcon(value: unknown): value is ProfileIcon {
  return value === 'neutral' || isStarterId(value) || isProfilePictureId(value);
}
/** Authoritative unlock rule shared with the server: legacy starter icons need ownership. */
export function profileIconUnlocked(account: Account, icon: ProfileIcon): boolean {
  if (icon === 'neutral') return true;
  return isStarterId(icon) ? !!account.characters[icon] : profilePictureUnlocked(account, icon);
}
export interface OnlineProfile {
  username: string;
  displayName: string;
  bio: string;
  icon: ProfileIcon;
  frame: ProfileFrame;
  ownedFrames: ProfileFrame[];
  createdAt: string;
  totalDraws: number;
  statistics: { storyCompleted: number; ownedBearers: number; capturedCreatures: number; discoveredCreatures: number };
  friendCode?: string;
  playerId?: string;
  daysPlayed?: number;
  playTimeSeconds?: number;
  recentActivity?: ProfileActivity[];
}
export interface ProfileActivity { id: string; message: string; detail: string; at: string }
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
  | { kind: 'checkpoint' }
  | { kind: 'friendRequest'; username?: string; friendCode?: string }
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
  | { kind: 'updateProfile'; displayName: string; bio: string; icon: ProfileIcon; frame: ProfileFrame }
  | { kind: 'enter'; activity: Activity }
  | { kind: 'act'; runId: string; actorId: string; action: ActionId; targetId: string }
  | { kind: 'endTurn' | 'continue' | 'retry' | 'quit'; runId: string };
export interface GameRequest {
  requestId: string;
  expectedRevision: number;
  operation: GameOperation;
}
export interface SocialPlayer {
  userId: string; username: string; displayName: string; icon: ProfileIcon; frame: ProfileFrame;
  online?: boolean;
  lastSeenAt?: string | null;
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
    isProfileIcon(value.icon) && typeof value.frame === 'string' && profileFrames.includes(value.frame);
}
function friendPresence(value: unknown): boolean {
  if (!object(value)) return false;
  if (value.online !== undefined && typeof value.online !== 'boolean') return false;
  if (value.lastSeenAt !== undefined && value.lastSeenAt !== null &&
    (typeof value.lastSeenAt !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/.test(value.lastSeenAt) ||
      !Number.isFinite(Date.parse(value.lastSeenAt)))) return false;
  return value.online !== true || typeof value.lastSeenAt === 'string';
}
function profileActivity(value: unknown): value is ProfileActivity {
  return object(value) && typeof value.id === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.id) &&
    typeof value.message === 'string' && value.message.length > 0 && value.message.length <= 40 &&
    typeof value.detail === 'string' && value.detail.length <= 120 &&
    !/[\u0000-\u001f\u007f]/.test(value.message + value.detail) &&
    typeof value.at === 'string' && Number.isFinite(Date.parse(value.at));
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
    !isProfileIcon(profile.icon) || typeof profile.frame !== 'string' || !profileFrames.includes(profile.frame) ||
    !Array.isArray(profile.ownedFrames) || !profile.ownedFrames.every(frame => typeof frame === 'string' && profileFrames.includes(frame)) ||
    !profile.ownedFrames.includes(profile.frame) || typeof profile.createdAt !== 'string' ||
    !Number.isFinite(Date.parse(profile.createdAt)) || !safeCount(profile.totalDraws) ||
    !object(profile.statistics) ||
    !['storyCompleted', 'ownedBearers', 'capturedCreatures', 'discoveredCreatures'].every(key => safeCount(profile.statistics && (profile.statistics as Record<string, unknown>)[key]))) return invalid();
  if (profile.friendCode !== undefined && (typeof profile.friendCode !== 'string' ||
      !/^LL-[0-9A-F]{4}-[0-9A-F]{4}$/i.test(profile.friendCode))) return invalid();
  if (profile.playerId !== undefined && (typeof profile.playerId !== 'string' ||
      !/^[0-9A-F]{4}-[0-9A-F]{4}$/i.test(profile.playerId))) return invalid();
  if (profile.friendCode !== undefined && profile.playerId !== undefined &&
      profile.friendCode.slice(3).toUpperCase() !== profile.playerId.toUpperCase()) return invalid();
  if (profile.daysPlayed !== undefined && !safeCount(profile.daysPlayed)) return invalid();
  if (profile.playTimeSeconds !== undefined && !safeCount(profile.playTimeSeconds)) return invalid();
  if (profile.recentActivity !== undefined && (!Array.isArray(profile.recentActivity) ||
      profile.recentActivity.length > 8 || !profile.recentActivity.every(profileActivity))) return invalid();
  for (const key of ['friends', 'incoming', 'outgoing']) {
    if (!Array.isArray(value.social[key]) || !(value.social[key] as unknown[]).every(entry =>
      peer(entry) && (key === 'friends' ? friendPresence(entry) :
        object(entry) && !('online' in entry) && !('lastSeenAt' in entry)))) return invalid();
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
    if (!profileIconUnlocked(account, profile.icon as ProfileIcon)) return invalid();
  } catch { return invalid(); }
  return value as unknown as GameResponse;
}

/** Retain requestId and revision when retrying a transport failure. Never resubmit a wallet. */
export async function gameOperation(operation: GameOperation, expectedRevision = 0,
  requestId: string = crypto.randomUUID()): Promise<GameResponse> {
  const { data, error } = await onlineClient().functions.invoke('game-operation', {
    body: { requestId, expectedRevision, operation } satisfies GameRequest,
    timeout: 30_000,
  });
  if (error) {
    if ('context' in error && error.context instanceof Error && error.context.name === 'AbortError') {
      throw new GameOperationError('The server did not respond within 30 seconds. Your action may already be saved. Retry the same request before continuing.');
    }
    if ('context' in error && error.context instanceof Response) {
      const body = await error.context.json().catch(() => null) as { error?: string } | null;
      throw new GameOperationError(body?.error ?? 'Online operation failed.', error.context.status);
    }
    throw new GameOperationError('Connection failed. Retry the same request ID before issuing another operation.');
  }
  return validateGameResponse(data);
}

export const chatMessageLength = 500;
export const chatGroupNameLength = 48;
export const chatGroupMembers = 10;
export const chatPageSize = 30;
/** Chat never carries expectedRevision and never changes the gameplay aggregate. */
export type ChatOperation =
  | { kind: 'read'; conversationId?: string; before?: string }
  | { kind: 'direct'; userId: string }
  | { kind: 'createGroup'; name: string; userIds: string[] }
  | { kind: 'send'; conversationId: string; text: string }
  | { kind: 'invite'; conversationId: string; userId: string }
  | { kind: 'respondInvite'; conversationId: string; accept: boolean }
  | { kind: 'removeMember'; conversationId: string; userId: string }
  | { kind: 'leave'; conversationId: string }
  | { kind: 'preferences'; conversationId: string; pinned?: boolean; muted?: boolean }
  | { kind: 'block'; userId: string }
  | { kind: 'unblock'; userId: string };
export interface ChatRequest { requestId: string; chat: ChatOperation }
export interface ChatPeer { userId: string; username: string; displayName: string; icon: ProfileIcon; frame: ProfileFrame }
export interface ChatMessage { id: string; senderId: string; senderName: string; text: string; createdAt: string }
export interface ChatConversation {
  id: string; kind: 'direct' | 'group'; name: string; ownerId: string | null;
  members: ChatPeer[]; invited: ChatPeer[]; unread: number; pinned: boolean; muted: boolean;
  lastMessage: ChatMessage | null; createdAt: string;
}
export interface ChatInvitation { conversationId: string; name: string; inviter: ChatPeer; memberCount: number; createdAt: string }
export interface ChatResponse {
  selfUserId: string;
  conversations: ChatConversation[];
  /** Conversation whose page is in messages: requested, created, opened or sent to; otherwise null. */
  conversationId: string | null;
  /** Ascending page of at most 30 messages, newest page unless before was supplied. */
  messages: ChatMessage[];
  hasMore: boolean;
  invitations: ChatInvitation[];
  blocked: ChatPeer[];
  unreadTotal: number;
}
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function timestamp(value: unknown): boolean {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}
function chatPeer(value: unknown): value is ChatPeer {
  return peer(value) && Object.keys(value as object).length === 5;
}
function chatMessage(value: unknown): value is ChatMessage {
  return object(value) && typeof value.id === 'string' && uuidPattern.test(value.id) &&
    typeof value.senderId === 'string' && uuidPattern.test(value.senderId) &&
    typeof value.senderName === 'string' && typeof value.text === 'string' &&
    [...value.text].length >= 1 && [...value.text].length <= chatMessageLength && timestamp(value.createdAt);
}
function chatConversation(value: unknown): value is ChatConversation {
  return object(value) && typeof value.id === 'string' && uuidPattern.test(value.id) &&
    (value.kind === 'direct' || value.kind === 'group') && typeof value.name === 'string' &&
    (value.ownerId === null || typeof value.ownerId === 'string' && uuidPattern.test(value.ownerId)) &&
    Array.isArray(value.members) && value.members.length <= chatGroupMembers && value.members.every(chatPeer) &&
    Array.isArray(value.invited) && value.invited.every(chatPeer) &&
    value.members.length + value.invited.length <= chatGroupMembers && safeCount(value.unread) &&
    typeof value.pinned === 'boolean' && typeof value.muted === 'boolean' &&
    (value.lastMessage === null || chatMessage(value.lastMessage)) && timestamp(value.createdAt);
}
export function validateChatResponse(value: unknown): ChatResponse {
  const invalid = () => { throw new GameOperationError('The server returned an incomplete chat response.'); };
  if (!object(value) || typeof value.selfUserId !== 'string' || !uuidPattern.test(value.selfUserId) ||
    !Array.isArray(value.conversations) || !value.conversations.every(chatConversation) ||
    !(value.conversationId === null || typeof value.conversationId === 'string' && uuidPattern.test(value.conversationId)) ||
    !Array.isArray(value.messages) || !value.messages.every(chatMessage) || typeof value.hasMore !== 'boolean' ||
    !Array.isArray(value.invitations) || !value.invitations.every(invite => object(invite) &&
      typeof invite.conversationId === 'string' && uuidPattern.test(invite.conversationId) &&
      typeof invite.name === 'string' && chatPeer(invite.inviter) && safeCount(invite.memberCount) && timestamp(invite.createdAt)) ||
    !Array.isArray(value.blocked) || !value.blocked.every(chatPeer) || !safeCount(value.unreadTotal)) return invalid();
  return value as unknown as ChatResponse;
}

/** Reuse requestId when retrying a transport failure; sends and all chat mutations are idempotent per ID. */
export async function chatOperation(operation: ChatOperation,
  requestId: string = crypto.randomUUID()): Promise<ChatResponse> {
  const { data, error } = await onlineClient().functions.invoke('game-operation', {
    body: { requestId, chat: operation } satisfies ChatRequest,
  });
  if (error) {
    if ('context' in error && error.context instanceof Response) {
      const body = await error.context.json().catch(() => null) as { error?: string } | null;
      throw new GameOperationError(body?.error ?? 'Chat request failed.', error.context.status);
    }
    throw new GameOperationError('Connection failed. Retry the same chat request ID.');
  }
  return validateChatResponse(data);
}