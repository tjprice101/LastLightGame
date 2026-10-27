import './style.css';
import { showStatusToast } from './presentation/status-toast';
import './sanctuary.css';
import './neutral-theme.css';
import './character-screen.css';
import './presentation/settings-panel.css';
import { settingsPanel } from './presentation/settings-panel';
import './creature-glossary.css';
import './sanctuary-polish.css';
import './interface.css';
import { bindInformation, information } from './presentation/information';
import { bindSelectionPanels } from './presentation/selection-panel';
import { bindStageLoot } from './presentation/stage-loot';
import { maxLevelPreview } from './presentation/max-level';
import { levelCharacterToMaximum, type MaxLevelPlan } from './game/account';
import './numeric-layout.css';
import './sanctuary-layout.css';
import './ambient-background.css';
import { ambientBackground, type AmbientScreen } from './presentation/ambient-background';
import { bindCreatureGlossary } from './presentation/creature-glossary';
import { archives, bindArchives } from './presentation/archives';
import { getStarter, isStarterId, type StarterId } from './content/starters';
import { characterCopyManagement, squadHub, summonHub, bindSquadPreview, bindSummonRates } from './presentation/roster';
import { Journey } from './game/flow';
import { SAVE_KEY } from './game/profile';
import { portrait, portraitAttributes, characterFacing } from './presentation/portrait';
import { conduitStore, updateConduitStore } from './presentation/conduit-store';
import { conduitUpgradeMenu, bindConduitUpgrades, updateConduitUpgradeMenu } from './presentation/conduit-upgrade';
import { getConduit, isConduitId, conduitEffect } from './content/conduits';
import { purchaseConduit, setMachineLootFocus, equipConduit, setCharacterLock, ownedCharacterInstances, levelCapturedCharacter } from './game/account';
import { bindMachineLootFocus } from './presentation/machine-loot-focus';
import { openMasterChest, openCalamityChest, equipMasterConduit, unequipAllConduits } from './game/account';
import { calamiticTokenPrice, isCalamiticConduitId } from './content/calamitic-conduits';
import { parseCalamityChestId, calamityChest } from './content/calamity';
import { bindActivityDifficulties, bindCalamityEntries, calamityOpeningReward } from './presentation/calamity';
import { getMasterConduit, isMasterConduitId } from './content/master-conduits';
import { chooseMasterConduit } from './ui/master-choice-dialog';
import { masterReward } from './presentation/master-conduits';
import { characterName } from './content/character-art';
import { uiIcon } from './presentation/ui-icon';
import { currencyIcon } from './presentation/currency-icon';
import { applyBattleSpeed, battleSpeeds, loadBattleSpeed, parseBattleSpeed, saveBattleSpeed, type BattleSpeed } from './presentation/battle-speed';
import { celebrateUpgrade } from './presentation/upgrade-celebration';
import { rarityFeedback } from './presentation/rarity-feedback';
import { presentUpgrade } from './presentation/upgrade-result';
import { activityTransitionPending, transitionActivity } from './presentation/activity-transition';
import { checkForUpdate } from './presentation/update-check';
import { bindArtworkLoading } from './presentation/artwork-loading';
import { detectAvif } from './presentation/image-format';
import { createBackdrop } from './presentation/backdrop';
import { applyMotion, loadMotion, saveMotion, reducedMotion, type MotionPreference } from './presentation/settings';
import { commands, defaultBindings, loadBindings, saveBindings, validateBindings } from './game/hotkeys';
import { BattleView, createSession, type BattleSession, type BattleAuthority, type BattleAuthorityResponse } from './presentation/battle-view';
import { restartHistoricalConduitSession } from './presentation/conduit-compatibility';
import { assertActivityAccess } from './game/activity-access';
import { characterHub, characterInformation, homeHub, inventoryHub, isCharacterTab, updateCharacterTab, updateEvolutionSelection, changeEvolutionPage } from './presentation/hub';
import { bindInventory, defaultInventorySections, defaultInventoryFilters, inventorySections, inventoryFilters, type InventoryFilters, type InventorySections, type InventoryTab } from './presentation/inventory';
import { loadAccount, ownedProgress, equippedSquad, ownedCharacters, setSquad, summonCharacter, summonCharacters, multiSummonCount, purchaseExchangeMaterial, saveAccountRewards, unlockedStage, unlockedInfusionStage, upgradeCharacter, evolutionFodderOptions, creatureSaleOffer, sellCurrencyCreature, type Account, type SummonDraw } from './game/account';
import { getCreature } from './content/creatures';
import { getSummonBanner, isSummonBannerId, type SummonBannerId } from './content/summon-banners';
import { isInfusionMode } from './content/infusions';
import { isPlayableDungeon } from './content/dungeons';
import { isWarCharacter } from './content/elemental-war';
import { unlockedWarStage } from './game/account';
import { characterLevelCost, characterEvolutionCost, evolutionRarity } from './content/progression';
import { materialName } from './content/dungeon-art';
import { capturedProgress } from './game/character-instances';
import { gameplayHub, bindGameplayNavigation } from './presentation/gameplay';
import { bindEnemyStrength } from './presentation/enemy-strength';
import { storyCampaign, bindStoryNavigation } from './presentation/story';
import { storyEncounter, storyRules } from './content/story';
import { unlockedStoryStage } from './game/account';
import { roseEvent } from './presentation/rose-event';
import { isMenuPage, sanctuaryHeader, sanctuaryContext, sanctuaryDock, sanctuaryDestination, type MenuPage, type TeamArea } from './presentation/sanctuary';
import { MenuHistory } from './presentation/menu-history';
import { gameChoose, gameConfirm, gameDialogPending, escapeDialogText } from './presentation/game-dialog';
import { bindCreatureBulkSale } from './presentation/creature-bulk-sale';
import { creatureBatchSaleOffer, sellCurrencyCreatures } from './game/account';
import { saleItems } from './presentation/creature-sale';
import { itemShowcase } from './presentation/item-showcase';
import { capturedRarity } from './presentation/owned-companion';
import { rarities, type Rarity } from './content/rarity';
import { exchangeCategory, exchangeProduct, exchangeProducts, isExchangeQuantity, eventMaterialWarning, eventMaterialWarningHidden, hideEventMaterialWarning } from './content/material-exchange';
import { presentReward } from './presentation/reward-screen';
import { summonReward, summonTenReward } from './presentation/summon-presentation';
import { conduitReward } from './presentation/conduit-presentation';
import './sanctuary-reference.css';
import { openOnlineAccount as showOnlineAccount } from './presentation/online-account';
import { onlineStores, onlineProfile, friendProfileScreen, bindProfileEditor, refreshProfileTracking, refreshFriendPresence, type OnlineProfileDisplay, type SocialDisplay } from './presentation/online-store-profile';
import { gameOperation, friendProfile, GameOperationError, type GameOperation, type GameResponse, type Activity, type FriendProfileResponse } from './online/server-game';
import { onlineClient, onlineUsername } from './online/account-client';
import { saveOfflineProgress } from './game/save-file';
import { startAutosave, showAutosaveNotice } from './presentation/autosave';
import { isProfilePictureId } from './content/profile-pictures';
import { profilePicture } from './presentation/profile-picture';
import { chooseProfilePicture } from './presentation/profile-picture-browser';
import { bindFriendChat, onlineChatTransport, type ChatUiState } from './presentation/friend-chat';
import './presentation/mono-reference.css';
import { referenceHome } from './presentation/reference-home';
import { bindCaptureTabs, referenceTeam, type ReferenceTeamView } from './presentation/reference-team';
import './presentation/reference-layout.css';
import './presentation/leader-theme.css';
import './presentation/button-style.css';
import { installButtonStyle } from './presentation/button-style';
import { applyLeaderTheme, leaderElement } from './presentation/leader-theme';
import { mountTitle, mountPlayerInfo, mountStarterSelection, unmountTitle, type OnlineSaveRequest } from './ui/mount';
import type { OfflineChange } from './ui/offline-save-panel';
import { DebugProfileStorage, bindDebugPhrase } from './game/debug-profile';
import './presentation/debug-profile.css';
import './presentation/conduit-loadout.css';
import './presentation/status-toast.css';
import { saleLabel } from './presentation/creature-sale';
import { applyConduitSearch, bindConduitLoadout, refreshConduitLoadout, resetConduitLoadoutView } from './presentation/conduit-loadout';
import { BackgroundMusic, battleMusic, defaultMusicPreferences, loadMusicPreferences, saveMusicPreferences } from './presentation/music';

const gameStorage = new DebugProfileStorage(window.localStorage, import.meta.env.DEV);
let musicPreferences = { ...defaultMusicPreferences };
let musicSettingsError = '';
const music = new BackgroundMusic(new Audio(), document, showError);
try {
  musicPreferences = loadMusicPreferences(window.localStorage);
} catch (error) {
  console.error('Could not load Last Light music settings', error);
  musicSettingsError = `Music settings could not be loaded. ${errorMessage(error)} Save a music setting to repair them.`;
}
music.configure(musicPreferences);
import.meta.hot?.dispose(() => music.dispose());

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('Application root is missing.');
const app = root;
bindArtworkLoading(document.body);
void detectAvif();
bindInformation(app);
bindSelectionPanels(app);
bindStageLoot(app, () => account);
installButtonStyle(document.body);
let characterCategory: TeamArea = 'squad';
let teamView: ReferenceTeamView = 'detail';
let teamElement = '';
let teamSort: 'level' | 'name' | 'element' = 'level';
let conduitSearch = '';
let selectedCapture: string | undefined;
let pendingMaxLevel: MaxLevelPlan | null = null;
const journey = new Journey();
let menuPage: MenuPage = 'home';
let characterTab = 'overview';
let selectedCharacter: StarterId | null = null;
let selectedBanner: SummonBannerId = 'standard';
let motionPreference: MotionPreference = 'system';
let settingsError = '';
let speed: BattleSpeed = 1;
let speedError = '';
let bindings = { ...defaultBindings };
let hotkeyError = '';
let battleSession: BattleSession | null = null;
let masterOpening = false;
let battleView: BattleView | null = null;
let fractalis: number | null = null;
let account: Account | null = null;
let walletError = '';
let playMode: 'legacy' | 'online' = 'legacy';
let onlineWallet: Account | null = null;
let playerProfile: OnlineProfileDisplay | null = null;
let socialDisplay: SocialDisplay | undefined;
let chatIdentity: string | null = null;
let chatUiState: ChatUiState = { drafts: new Map(), query: '' };
let disposeFriendChat: (() => void) | null = null;
let storeTab: 'materials' | 'cosmetics' = 'materials';
let storeConduit: string | undefined;
let upgradeConduitSelection: string | undefined;
let storeRarity = '';
let marketMaterial = 'infernic';
let marketFrame = 'default';
let profileTab: 'info' | 'friends' | 'chats' = 'info';
/** Transient D-340 friend view; cleared by any navigation, never saved. */
let viewedFriend: FriendProfileResponse | null = null;
let friendRequestTab: 'incoming' | 'outgoing' = 'incoming';
let playerInfoOpen = false;
let onlineRevision = 0;
let onlinePending: { operation: GameOperation; requestId: string; revision: number } | null = null;
let onlineBusy = false;

function openOnlineAccount(onPlay?: () => Promise<void>): void {
  if (gameStorage.active) {
    showError('Exit the debug profile before accessing online accounts. Your real account is unchanged.');
    return;
  }
  showOnlineAccount(onPlay ?? (() => enterOnline()));
}

function applyOnline(response: GameResponse, updateSession = true): void {
  onlineRevision = response.revision;
  onlineWallet = response.account;
  account = structuredClone(response.account);
  playerProfile = response.profile;
  socialDisplay = response.social;
  fractalis = response.account.fractalis;
  if (updateSession) battleSession = response.session;
  const balance = app.querySelector('#fractalis-balance');
  const premium = app.querySelector('#lycalis-balance');
  if (balance) balance.textContent = String(response.account.fractalis);
  if (premium) premium.textContent = String(response.account.lycalis);
}

async function performOnline(operation: GameOperation): Promise<GameResponse> {
  if (gameStorage.active) throw new Error('Online operations are disabled in the isolated debug profile.');
  if (onlineBusy) throw new Error('An online operation is already in progress.');
  if (onlinePending && JSON.stringify(onlinePending.operation) !== JSON.stringify(operation)) {
    throw new Error('Retry the previous operation first. Its saved outcome is not yet confirmed.');
  }
  const pending = onlinePending ?? { operation, requestId: crypto.randomUUID(), revision: onlineRevision };
  onlinePending = pending;
  onlineBusy = true;
  try {
    const response = await gameOperation(pending.operation, pending.revision, pending.requestId);
    const viewUpdatesSession = operation.kind === 'act' || operation.kind === 'endTurn' || operation.kind === 'continue' || operation.kind === 'retry';
    applyOnline(response, !viewUpdatesSession);
    onlinePending = null;
    return response;
  } catch (error) {
    if (error instanceof GameOperationError && error.status !== undefined && error.status < 500) {
      onlinePending = null;
      if (error.status === 409) {
        const fresh = await gameOperation({ kind: 'read' });
        applyOnline(fresh);
        if (fresh.starterId) {
          journey.profile = { version: 1, starterId: fresh.starterId };
          journey.screen = 'menu';
        }
        if (journey.screen === 'menu') {
          if (menuPage === 'battle' && !battleSession) menuPage = 'gameplay';
          renderMenu();
          showError('Your online account changed in another session. The latest saved state has been loaded; review it before trying again.');
        }
      }
    }
    throw error;
  } finally {
    onlineBusy = false;
    if (onlinePending) showError('The server outcome is not yet confirmed. Retry the same pending operation before continuing.');
  }
}

async function enterOnline(progressReady = false): Promise<void> {
  if (gameStorage.active) throw new Error('Exit the debug profile before playing online.');
  const response = await gameOperation({ kind: 'read' });
  playMode = 'online';
  onlinePending = null;
  applyOnline(response);
  menuHistory.clear();
  resetConduitLoadoutView();
  menuPage = response.session ? 'battle' : (response.account.storyCompleted ?? 0) < storyRules.regionStages ? 'story' : 'home';
  selectedCharacter = null;
  journey.selected = null;
  journey.profile = response.starterId ? { version: 1, starterId: response.starterId } : null;
  journey.screen = response.starterId ? 'menu' : 'selection';
  playerInfoOpen = !response.starterId && !progressReady;
  render();
  focusHeading();
}

async function enterBattle(activity: Activity, destination?: Parameters<typeof createSession>[2]): Promise<void> {
  assertActivityAccess(currentAccount(), activity);
  if (playMode === 'online') {
    const response = await performOnline({ kind: 'enter', activity });
    if (!response.session) throw new Error('The server did not return a battle session.');
  } else {
    battleSession = squadSession(currentAccount(), destination);
  }
}

async function authorityReply(operation: GameOperation): Promise<BattleAuthorityResponse> {
  const response = await performOnline(operation);
  if (!response.session) throw new Error('The server did not return the active battle.');
  return { session: response.session, result: response.result };
}

function battleAuthority(): BattleAuthority {
  const runId = (): string => {
    if (!battleSession) throw new Error('The online battle session is missing.');
    return battleSession.runId;
  };
  return {
    action: (actorId, action, targetId) => authorityReply({ kind: 'act', runId: runId(), actorId, action, targetId }),
    endTurn: () => authorityReply({ kind: 'endTurn', runId: runId() }),
    nextStage: () => authorityReply({ kind: 'continue', runId: runId() }),
    nextWave: () => authorityReply({ kind: 'continue', runId: runId() }),
    retry: () => authorityReply({ kind: 'retry', runId: runId() }),
  };
}

function currentAccount(): Account {
  if (playMode === 'legacy') return loadAccount(gameStorage);
  if (!onlineWallet) throw new Error('Online account is unavailable. Reconnect before playing.');
  return structuredClone(onlineWallet);
}

function updateProfileAvatar(): void {
  if (!playerProfile || !account) return;
  const avatar = app.querySelector<HTMLButtonElement>('.sanctuary-header [data-page="profile"]');
  if (!avatar) return;
  const preview = document.createElement('span');
  preview.className = 'profile-frame-preview online-header-avatar';
  preview.dataset.profileFrame = playerProfile.frame;
  preview.innerHTML = profilePicture(playerProfile.icon);
  avatar.replaceChildren(preview);
  avatar.setAttribute('aria-label', `Open profile for ${playerProfile.displayName}`);
}
interface MenuSnapshot {
  page: MenuPage;
  hash: string;
  characterTab: string;
  characterCategory: TeamArea;
  teamView: ReferenceTeamView;
  teamElement: string;
  teamSort: 'level' | 'name' | 'element';
  storeConduit: string | undefined;
  upgradeConduitSelection: string | undefined;
  storeRarity: string;
  storeTab: 'materials' | 'cosmetics';
  marketMaterial: string;
  marketFrame: string;
  profileTab: 'info' | 'friends' | 'chats';
  friendRequestTab: 'incoming' | 'outgoing';
  selectedCharacter: StarterId | null;
  selectedCapture: string | undefined;
  selectedBanner: SummonBannerId;
  summonRateStars?: string;
  inventoryTab: InventoryTab;
  inventoryExpanded: InventorySections;
  inventoryFilters: InventoryFilters;
  gallery: string | undefined;
  activities: { group: string; index: string }[];
  difficulties: { activity: string; difficulty: string }[];
  calamityTiers: { activity: string; tier: string }[];
  controls: { attributes: [string, string][]; value: string }[];
  panels: { key: string; top: number; left: number }[];
  scroll: number;
}
const menuHistory = new MenuHistory<MenuSnapshot>();
let inventoryTab: InventoryTab = 'materials';
let inventoryExpanded: InventorySections = { ...defaultInventorySections };
let inventoryFilterState: InventoryFilters = { ...defaultInventoryFilters };

function menuSnapshot(): MenuSnapshot {
  return {
    page: menuPage, hash: location.hash, characterTab, characterCategory, teamView, teamElement, teamSort,
    storeConduit, upgradeConduitSelection, storeRarity, storeTab, marketMaterial, marketFrame, profileTab, friendRequestTab,
    selectedCharacter, selectedCapture, selectedBanner, inventoryTab,
    inventoryExpanded: menuPage === 'inventory' ? inventorySections(app) : { ...inventoryExpanded },
    inventoryFilters: menuPage === 'inventory' ? inventoryFilters(app) : { ...inventoryFilterState },
    summonRateStars: app.querySelector<HTMLButtonElement>('[data-rate-stars][aria-pressed="true"]')?.dataset.rateStars,
    gallery: app.querySelector<HTMLElement>('[data-archive-gallery][aria-pressed="true"]')?.dataset.archiveGallery,
    activities: Array.from(app.querySelectorAll<HTMLButtonElement>('[data-activity-choice][aria-pressed="true"]')).map((button) => ({
      group: button.closest('.activity-group')?.id ?? '', index: button.dataset.activityChoice ?? '',
    })),
    difficulties: Array.from(app.querySelectorAll<HTMLButtonElement>('[data-difficulty][aria-selected="true"]')).map(button => ({
      activity: button.closest<HTMLElement>('[data-activity-difficulty]')!.dataset.activityDifficulty!,
      difficulty: button.dataset.difficulty!,
    })),
    calamityTiers: Array.from(app.querySelectorAll<HTMLButtonElement>('[data-calamity-choice][aria-selected="true"]')).map(button => ({
      activity: button.closest<HTMLElement>('[data-calamity-tiers]')!.dataset.calamityTiers!,
      tier: button.dataset.calamityChoice!,
    })),
    controls: Array.from(app.querySelectorAll<HTMLSelectElement>('.sanctuary-content select:not([data-conduit-slot]):not([data-capture-conduit])')).map((control) => ({
      attributes: Array.from(control.attributes).filter((attribute) => attribute.name === 'id' || attribute.name.startsWith('data-') && attribute.name !== 'data-selection-source').map((attribute) => [attribute.name, attribute.value]),
      value: control.value,
    })),
    panels: Array.from(app.querySelectorAll<HTMLElement>('[data-menu-scroll], .activity-group')).map((panel) => ({
      key: panel.dataset.menuScroll ?? panel.id, top: panel.scrollTop, left: panel.scrollLeft,
    })),
    scroll: window.scrollY,
  };
}

const updateBlocked = (): boolean => (journey.screen === 'menu' && menuPage === 'battle') || Boolean(app.querySelector('#battle-root'));
function checkUpdates(force = false): void {
  void checkForUpdate({ blocked: updateBlocked, force });
}
window.setInterval(() => checkUpdates(), 5 * 60_000);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkUpdates(); });

function visitMenu(page: MenuPage): void {
  checkUpdates();
  const destination = sanctuaryDestination(page);
  viewedFriend = null;
  menuHistory.visit(menuSnapshot(), destination);
  if (destination === 'team') characterCategory = 'bearers';
  if (page === 'team' || page === 'character') teamView = 'detail';
  if (page === 'squad') { characterCategory = 'squad'; teamView = 'formation'; }
  menuPage = destination;
  if (page === 'story') history.replaceState(null, '', '#gameplay-story');
}

async function backMenu(): Promise<void> {
  if (activityTransitionPending()) return;
  await transitionActivity(async () => {
    const fallback: MenuSnapshot | undefined = menuPage === 'battle' ? {
      ...menuSnapshot(), page: 'gameplay', hash: '', gallery: undefined,
      activities: [], difficulties: [], calamityTiers: [], controls: [], panels: [], scroll: 0,
    } : undefined;
    if (menuPage === 'battle' && playMode === 'online' && battleSession) await performOnline({ kind: 'quit', runId: battleSession.runId });
    const previous = menuHistory.back(fallback);
    battleSession = null;
    viewedFriend = null;
    menuPage = previous.page;
    characterTab = previous.characterTab;
    characterCategory = previous.characterCategory;
    teamView = previous.teamView;
    teamElement = previous.teamElement;
    teamSort = previous.teamSort;
    storeConduit = previous.storeConduit;
    upgradeConduitSelection = previous.upgradeConduitSelection;
    storeRarity = previous.storeRarity;
    storeTab = previous.storeTab;
    marketMaterial = previous.marketMaterial;
    marketFrame = previous.marketFrame;
    profileTab = previous.profileTab;
    friendRequestTab = previous.friendRequestTab;
    selectedCharacter = previous.selectedCharacter;
    selectedCapture = previous.selectedCapture;
    selectedBanner = previous.selectedBanner;
    inventoryTab = previous.inventoryTab;
    inventoryExpanded = { ...previous.inventoryExpanded };
    inventoryFilterState = { ...previous.inventoryFilters };
    history.replaceState(null, '', `${location.pathname}${location.search}${previous.hash}`);
    renderMenu();
    checkUpdates(true);
    if (previous.summonRateStars !== undefined) {
      const filter = app.querySelector<HTMLButtonElement>(`[data-rate-stars="${previous.summonRateStars}"]`);
      if (!filter) throw new Error('Saved banner rate filter is unavailable.');
      filter.click();
    }
    for (const activity of previous.activities) app.querySelector<HTMLButtonElement>(`#${activity.group} [data-activity-choice="${activity.index}"]`)?.click();
    for (const saved of previous.difficulties) app.querySelector<HTMLButtonElement>(`[data-activity-difficulty="${saved.activity}"] [data-difficulty="${saved.difficulty}"]`)?.click();
    for (const saved of previous.calamityTiers) app.querySelector<HTMLButtonElement>(`[data-calamity-tiers="${saved.activity}"] [data-calamity-choice="${saved.tier}"]`)?.click();
    if (previous.gallery) app.querySelector<HTMLButtonElement>(`[data-archive-gallery="${previous.gallery}"]`)?.click();
    for (const saved of previous.controls) {
      const control = Array.from(app.querySelectorAll<HTMLSelectElement>('.sanctuary-content select')).find((candidate) =>
        saved.attributes.every(([name, value]) => candidate.getAttribute(name) === value));
      if (!control || !Array.from(control.options).some((option) => option.value === saved.value && !option.disabled)) continue;
      control.value = saved.value;
      if (control.matches('[data-character-filter], #glossary-area, [data-loot-stage], #squad-form select, [data-dungeon-stage], [data-infusion-stage], [data-war-stage]')) control.dispatchEvent(new Event('change', { bubbles: true }));
    }
    for (const saved of previous.panels) {
      const panel = app.querySelector<HTMLElement>(`[data-menu-scroll="${saved.key}"], .activity-group[id="${saved.key}"]`);
      if (!panel) throw new Error('Saved menu scroll panel is unavailable.');
      panel.scrollTop = saved.top;
      panel.scrollLeft = saved.left;
    }
    window.scrollTo({ top: previous.scroll, behavior: 'instant' });
  });
}
try {
  account = currentAccount();
  fractalis = account.fractalis;
} catch (error) {
  console.error('Could not load Last Light Prismatica balance', error);
  walletError = errorMessage(error);
}
try {
  motionPreference = loadMotion(gameStorage);
} catch (error) {
  console.error('Could not load Last Light settings', error);
  settingsError = `Settings could not be loaded. ${errorMessage(error)} System motion preferences remain active; save a setting to replace the unreadable value.`;
}
try {
  bindings = loadBindings(gameStorage);
} catch (error) {
  console.error('Could not load Last Light hotkeys', error);
  hotkeyError = `Hotkeys could not be loaded. ${errorMessage(error)} Default keys are active; save new bindings in Settings to repair them.`;
}
applyMotion(motionPreference);
try {
  speed = loadBattleSpeed(gameStorage);
} catch (error) {
  console.error('Could not load Last Light battle speed', error);
  speedError = `Battle speed could not be loaded. ${errorMessage(error)} 1x is active; choose a speed in battle to repair the saved value.`;
}
applyBattleSpeed(speed);
createBackdrop();

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'An unexpected error occurred.';
}

function squadSession(current: Account, destination?: Parameters<typeof createSession>[2]): BattleSession {
  const ids = equippedSquad(current);
  const leader = ids.find(isStarterId) ?? journey.profile?.starterId;
  if (!leader) throw new Error('Saved starter definition is missing.');
  return createSession(leader, ownedProgress(current, leader), destination, { ids, progress: current.characters, equipment: current.conduitEquipment, captures: current.capturedCharacters, upgrades: current.conduitUpgrades, masters: current.masterEquipment });
}

function showError(message: string): void {
  const status = app.querySelector<HTMLElement>('dialog[open] #settings-error') ??
    app.querySelector<HTMLElement>('#status');
  if (!status) throw new Error('Status region is missing.');
  if (!message.trim()) {
    status.textContent = '';
    delete status.dataset.toastTone;
    return;
  }
  const pending =  Boolean(playMode === 'online' && onlinePending && !onlineBusy);
  const target = status.id === 'status' ? showStatusToast(status, message, { persistent: pending }) : status;
  if (target === status) status.textContent = message;
  if (pending) {
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.dataset.retryOnline = '';
    retry.textContent = 'Retry pending operation';
    target.append(' ', retry);
  }
}

function frame(body: string, battle = false, sanctuary = false): void {
  disposeFriendChat?.();
  disposeFriendChat = null;
  const identity = playMode === 'online' ? playerProfile?.username ?? null : null;
  if (identity !== chatIdentity) {
    chatIdentity = identity;
    chatUiState = { drafts: new Map(), query: '' };
  }
  unmountTitle();
  applyLeaderTheme(document.documentElement, leaderElement(journey.profile ? account : null, battle ? battleSession?.state : undefined));
  document.body.classList.toggle('in-battle', battle);
  const backgroundScreen: AmbientScreen = battle ? 'battle' : !sanctuary
    ? journey.screen === 'selection' ? 'selection' : 'title'
    : menuPage === 'conduit-store' || menuPage === 'conduit-upgrade' ? 'stores' : menuPage === 'archives' || menuPage === 'glossary' ? 'collections' : menuPage === 'profile' ? 'home' : menuPage === 'team' ? characterCategory === 'squad' ? 'squad' : 'character' : menuPage;
  app.innerHTML = battle ? `<div class="battle-screen">${body}${ambientBackground(backgroundScreen)}<p id="status" class="status" role="alert"></p></div>` : `<div class="shell ${sanctuary ? 'sanctuary-shell' : ''}">
    ${ambientBackground(backgroundScreen)}
    ${sanctuary ? '' : '<header class="masthead"><span class="brand-mark">L · L</span><span>LAST LIGHT</span><span class="build-label">PRELUDE &middot; 0.1</span></header>'}
    ${body}
    <p id="status" class="status" role="alert"></p>
    ${sanctuary ? '' : '<footer><span>AN ORIGINAL GACHA RPG</span><span>A WORLD WAITING TO AWAKEN</span></footer>'}
  </div>`;
  if (gameStorage.active) app.insertAdjacentHTML('beforeend', '<aside class="debug-profile-banner" aria-label="Debug profile"><strong>DEBUG · Isolated test profile</strong><button type="button" class="text-button" data-exit-debug>Exit debug</button></aside>');
  music.setTrack(battle ? battleSession ? battleMusic(battleSession.state) : null : 'main-theme');
}

function focusHeading(): void {
  app.querySelector<HTMLElement>('h1')?.focus();
}

async function enter(): Promise<void> {
  try {
    if (!gameStorage.active && (playMode === 'online' ||
      import.meta.env.VITE_SUPABASE_URL && await onlineUsername())) {
      await enterOnline();
      return;
    }
  } catch (error) {
    console.error('Online entry failed', error);
    showError(`Unable to open your online account. ${errorMessage(error)}`);
    return;
  }
  try {
    playerInfoOpen = false;
    playMode = 'legacy';
    onlineWallet = null;
    playerProfile = null;
    journey.profile = null;
    journey.enter(gameStorage);
    render();
    focusHeading();
  } catch (error) {
    console.error('Could not load Last Light profile', error);
    playerInfoOpen = true;
    render();
    showError(`Unable to open your local save. ${errorMessage(error)} Load a backup or delete the unreadable data in Player info.`);
  }
}

function renderTitle(): void {
  checkUpdates();
  frame('<div id="react-title"></div>');
  mountTitle(app.querySelector<HTMLElement>('#react-title')!, {
    onOffline: enter,
    onOnline: () => openOnlineAccount(() => enterOnline()),
  });
}

function openPlayerInfo(): void {
  if (gameStorage.active) {
    showError('Save-data management is unavailable in debug mode. Exit debug to access your real saves.');
    return;
  }
  playerInfoOpen = true;
  render();
  focusHeading();
}

let autosaveIdentity: string | null = null;
let stopAutosave: (() => void) | null = null;
let onlineCheckpointBusy = false;
async function saveOnlineCheckpoint(): Promise<boolean> {
  if (playMode !== 'online' || !playerProfile || onlineBusy || onlinePending || onlineCheckpointBusy) return false;
  onlineCheckpointBusy = true;
  const revision = onlineRevision;
  const profile = playerProfile;
  try {
    let saved: GameResponse;
    try { saved = await gameOperation({ kind: 'checkpoint' }, revision); }
    catch (error) {
      if (playMode !== 'online' || playerProfile !== profile || onlineBusy || onlinePending || revision !== onlineRevision) return false;
      throw error;
    }
    if (playMode !== 'online' || playerProfile !== profile || onlineBusy || onlinePending || revision !== onlineRevision) return false;
    if (saved.revision !== revision) throw new Error('Save check found newer online progress. Refresh your account before continuing.');
    Object.assign(playerProfile, saved.profile);
    refreshProfileTracking(app, playerProfile);
    socialDisplay = saved.social;
    refreshFriendPresence(app, saved.social);
    return true;
  } finally { onlineCheckpointBusy = false; }
}

app.addEventListener('player-save-online', event => {
  const { resolve, reject } = (event as CustomEvent<OnlineSaveRequest>).detail;
  void saveOnlineCheckpoint().then(saved => {
    if (!saved) throw new Error('A save or game operation is pending. Finish or retry it, then save again.');
    showAutosaveNotice();
    resolve();
  }).catch(reject);
});
function syncAutosave(): void {
  const identity = !gameStorage.active && journey.screen !== 'title' && journey.profile
    ? `${playMode}:${playerProfile?.username ?? journey.profile.starterId}` : null;
  if (identity === autosaveIdentity) return;
  stopAutosave?.();
  stopAutosave = null;
  autosaveIdentity = identity;
  document.querySelector('.autosave-notice')?.remove();
  if (!identity) return;
  stopAutosave = startAutosave(async () => {
    if (gameStorage.active || journey.screen === 'title' || !journey.profile) return false;
    if (playMode === 'legacy') {
      saveOfflineProgress(gameStorage);
      return true;
    }
    return saveOnlineCheckpoint();
  }, showAutosaveNotice, error => {
    console.error('Autosave failed', error);
    showError(`Autosave failed. ${errorMessage(error)}`);
  });
}

function renderPlayerInfo(): void {
  if (gameStorage.active) throw new Error('Real save-data management cannot open in the debug profile.');
  frame('<div id="react-player-info"></div>');
  mountPlayerInfo(app.querySelector<HTMLElement>('#react-player-info')!, {
    onChanged: offlineSaveChanged,
    onReady: () => enterOnline(true),
    onAccount: () => openOnlineAccount(() => enterOnline()),
    onClose: () => {
      playerInfoOpen = false;
      if (playMode === 'online' && !journey.profile) journey.screen = 'title';
      render(); focusHeading();
    },
  });
}

function renderSelection(): void {
  checkUpdates();
  frame('<div id="react-starter-selection"></div>');
  mountStarterSelection(app.querySelector<HTMLElement>('#react-starter-selection')!, {
    initialSelected: journey.selected ?? undefined,
    onSelect: id => journey.select(id),
    onPlayerInfo: playMode === 'online' ? undefined : () => { playerInfoOpen = true; renderPlayerInfo(); focusHeading(); },
    onBegin: async () => {
      try {
        if (playMode === 'online') {
          const starterId = journey.selected;
          if (starterId !== 'ember' && starterId !== 'tide' && starterId !== 'sprout') throw new Error('Choose an available starter.');
          const response = await performOnline({ kind: 'bootstrap', starterId });
          if (!response.starterId) throw new Error('The server did not save your starter.');
          journey.profile = { version: 1, starterId: response.starterId };
          journey.screen = 'menu';
        } else journey.confirm(gameStorage);
        menuPage = 'story';
        renderMenu(true);
        focusHeading();
      } catch (error) {
        console.error('Could not save Last Light starter', error);
        showError(`Your Element-Bearer was not saved. ${errorMessage(error)} Please retry; the journey has not advanced.`);
      }
    },
  });
}

function renderMenu(firstArrival = false): void {
  battleView?.destroy();
  battleView = null;
  if (!journey.profile) throw new Error('The opening menu requires a saved Element-Bearer.');
  const starter = getStarter(journey.profile.starterId);
  try {
    account = currentAccount();
    if (playMode === 'online' && (!account.characters[starter.id] || !account.squad?.length)) throw new Error('The server account is missing its saved starter or squad.');
    if (playMode === 'legacy') {
      account.characters[starter.id] ??= { level: 0, evolution: 1 };
      account.squad ??= [starter.id];
    }
    if (!selectedCharacter || !ownedCharacters(account).includes(selectedCharacter)) selectedCharacter = starter.id;
    fractalis = account.fractalis;
    walletError = '';
  } catch (error) {
    console.error('Could not load progression', error);
    account = null;
    fractalis = null;
    walletError = errorMessage(error);
  }
  const homeLeader = account && menuPage === 'home' ? account.squad?.[0] ?? starter.id : starter.id;
  const sanctuary = `${sanctuaryHeader(menuPage, fractalis, account?.lycalis ?? null)}<section class="menu-screen sanctuary-content" data-menu-screen="${menuPage}">
    ${walletError ? '<p class="status" id="wallet-error" role="alert"></p>' : ''}
    ${menuPage !== 'home' ? menuContent(menuPage) : referenceHome(isStarterId(homeLeader) ? getStarter(homeLeader) : starter, account)}
  </section>`;
  frame(`${menuPage === 'battle' ? `<header class="battle-toolbar">
    <button class="battle-chrome-button" data-menu-back>${uiIcon('back')}<span>Leave</span></button>
    <div class="battle-speed-buttons" role="group" aria-label="Battle animation speed">${battleSpeeds.map(value => `<button type="button" data-battle-speed-choice="${value}" aria-pressed="${speed === value}">${value}&times;</button>`).join('')}</div>
    <select id="battle-speed" data-battle-speed data-native-select hidden aria-label="Battle animation speed">${battleSpeeds.map((value) => `<option value="${value}" ${speed === value ? 'selected' : ''}>${value}&times;</option>`).join('')}</select>
    <button id="open-settings" class="battle-chrome-button" aria-haspopup="dialog">${uiIcon('settings')}<span>Settings</span></button>
    </header>${walletError ? '<p class="status" id="wallet-error" role="alert"></p>' : ''}
    <div id="battle-root"></div>` : sanctuary}
    <dialog id="settings-drawer" class="settings-drawer" aria-labelledby="settings-heading">
    ${settingsPanel(motionPreference, bindings, speed, musicPreferences)}
    ${menuPage === 'battle' ? `<p class="currency-reward">${currencyIcon('fractalis')}<span>Prismatica <strong id="fractalis-balance">${fractalis ?? 'Unavailable'}</strong></span></p>` : ''}
    <p id="settings-error" class="status" role="alert"></p>
  </dialog>
  ${menuPage === 'battle' ? '' : '<dialog id="max-level-dialog" class="information-modal" aria-labelledby="max-level-heading"><header class="drawer-heading"><button class="drawer-close" type="button" data-close-information aria-label="Close Max Level">&times;</button></header><div data-max-level-content></div><p data-max-level-error role="alert"></p></dialog>'}`, menuPage === 'battle', menuPage !== 'battle');
  pendingMaxLevel = null;
  app.querySelector(`[data-character-category="${characterCategory}"]`)?.setAttribute('aria-current', 'page');
  applyConduitSearch(app, conduitSearch);
  bindConduitLoadout(app);
  bindGameplayNavigation(app);
  bindMachineLootFocus(app, async (rarity, id) => {
    account = playMode === 'online'
      ? (await performOnline({ kind: 'setMachineLootFocus', rarity, id })).account
      : setMachineLootFocus(gameStorage, rarity, id);
    return account;
  }, error => {
    console.error('Machines loot focus rejected', error);
    showError(errorMessage(error));
  });
  bindEnemyStrength(app);
  bindActivityDifficulties(app);
  bindStoryNavigation(app, account);
  bindProfileEditor(app, async edits => {
    if (playMode !== 'online' || !playerProfile) throw new Error('Your public profile is an online feature. Sign in to an online account to edit it.');
    if (edits.icon !== 'neutral' && !isStarterId(edits.icon) && !isProfilePictureId(edits.icon)) throw new Error('Choose a valid profile picture.');
    const frame = playerProfile.frame;
    if (frame !== 'default' && frame !== 'thin-outline' && frame !== 'double-outline' && frame !== 'corner-brackets') throw new Error('Choose a valid profile frame.');
    await performOnline({ kind: 'updateProfile', ...edits, icon: edits.icon, frame });
  }, error => {
    console.error('Profile update failed', error);
    showError(errorMessage(error));
  });
  if (playMode === 'online' && playerProfile && menuPage === 'profile' && profileTab === 'chats') {
    const identity = playerProfile.username;
    disposeFriendChat = bindFriendChat(app, chatUiState, () => socialDisplay?.friends ?? [], async (command, requestId) => {
      if (playMode !== 'online' || playerProfile?.username !== identity) throw new Error('Sign in again to use chats.');
      let response = await onlineChatTransport(command, requestId);
      if (!response.selected && chatUiState.selected && response.view.conversations.some(chat => chat.id === chatUiState.selected)) {
        response = await onlineChatTransport({ kind: 'read', conversationId: chatUiState.selected }, crypto.randomUUID());
      }
      if (playMode !== 'online' || playerProfile?.username !== identity) throw new Error('Your chat account changed. Open chats again.');
      if (command.kind === 'block' && socialDisplay) {
        socialDisplay = {
          friends: socialDisplay.friends.filter(peer => peer.userId !== command.userId),
          incoming: socialDisplay.incoming.filter(peer => peer.userId !== command.userId),
          outgoing: socialDisplay.outgoing.filter(peer => peer.userId !== command.userId),
        };
      }
      return response;
    }, error => showError(errorMessage(error)));
  }
  bindInventory(app, (tab) => { inventoryTab = tab; }, (sections) => { inventoryExpanded = sections; }, (filters) => { inventoryFilterState = filters; });
  app.querySelectorAll<HTMLButtonElement>('[data-open-calamity-chest]').forEach(button => button.addEventListener('click', async () => {
    if (masterOpening || gameDialogPending() || onlineBusy || onlinePending) return;
    masterOpening = true;
    let saved = false;
    try {
      const id = button.dataset.openCalamityChest!;
      const { activity, tier } = parseCalamityChestId(id);
      const chest = calamityChest(activity, tier);
      const expectedCount = currentAccount().calamityChests?.[id] ?? 0;
      if (!expectedCount) throw new Error('This chest is no longer owned.');
      if (!await gameConfirm(`Open one ${chest.name}? One chest will be consumed and its actual contents saved. Owned: ${expectedCount}.`, { title: 'Open Calamity chest', confirmLabel: 'Open one chest' })) return;
      let reward;
      if (playMode === 'online') {
        const response = await performOnline({ kind: 'openCalamityChest', id, expectedCount });
        saved = true;
        if (!response.calamityOpening || response.calamityOpening.id !== id) throw new Error('The server omitted the saved chest receipt. Check Inventory.');
        reward = response.calamityOpening;
      } else {
        const result = openCalamityChest(gameStorage, id, expectedCount);
        account = result.account;
        reward = result.reward;
        saved = true;
      }
      renderMenu();
      await presentReward(calamityOpeningReward(id, reward));
      const focus = app.querySelector<HTMLButtonElement>('[data-open-calamity-chest]') ?? app.querySelector<HTMLElement>('h1');
      if (focus) {
        if (focus.tagName !== 'BUTTON') focus.tabIndex = -1;
        focus.focus({ preventScroll: true });
      }
    } catch (error) {
      console.error('Calamity chest opening failed', error);
      showError(`${saved ? 'Chest contents are saved, but their presentation could not complete. Check Inventory.' : playMode === 'online' && onlinePending ? 'The opening is awaiting confirmation. Retry the pending operation; do not open another chest.' : 'The chest was not opened.'} ${errorMessage(error)}`);
    } finally { masterOpening = false; }
  }));
  bindCaptureTabs(app, (tab) => { characterTab = tab; });
  app.querySelector<HTMLButtonElement>('[data-open-master-chest]')?.addEventListener('click', async () => {
    if (masterOpening || gameDialogPending()) return;
    masterOpening = true;
    let saved = false;
    try {
      const id = await chooseMasterConduit(currentAccount());
      if (!id) return;
      const master = getMasterConduit(id);
      if (!await gameConfirm(`Open one Machine's Master Chest for ${master.name}? ${master.effect} It will be unlocked, not equipped.`, { title: 'Open Master chest', confirmLabel: 'Open chest' })) return;
      account = playMode === 'online' ? (await performOnline({ kind: 'openMasterChest', id })).account : openMasterChest(gameStorage, id);
      saved = true;
      const reward = masterReward(id, account);
      renderMenu();
      await presentReward(reward);
      app.querySelector<HTMLButtonElement>('[data-open-master-chest]')?.focus({ preventScroll: true });
    } catch (error) {
      console.error('Master chest opening failed', error);
      showError(`${saved ? 'Your Master is saved, but its presentation could not complete. Check Inventory.' : 'The chest was not opened.'} ${errorMessage(error)}`);
    } finally { masterOpening = false; }
  });
  bindCreatureGlossary(app, account?.conduitUpgrades);
  bindArchives(app);
  bindSquadPreview(app, account);
  bindSummonRates(app);
  bindConduitUpgrades(app, gameStorage, (updated) => { account = updated; refreshConduitMenu(); }, showError,
    playMode === 'online' ? async (id, expectedLevel) => (await performOnline({ kind: 'upgradeConduit', id, expectedLevel })).account : undefined,
    playMode === 'online' ? async expected => (await performOnline({ kind: 'maxConduit', expected })).account : undefined);
  app.querySelectorAll<HTMLSelectElement>('[data-battle-speed]').forEach((speedControl) => speedControl.addEventListener('change', (event) => {
    if (!(event.currentTarget instanceof HTMLSelectElement)) throw new Error('Battle speed control is missing.');
    const control = event.currentTarget;
    try {
      const selected = parseBattleSpeed(control.value);
      saveBattleSpeed(gameStorage, selected);
      speed = selected;
      applyBattleSpeed(speed);
      app.querySelectorAll<HTMLSelectElement>('[data-battle-speed]').forEach((select) => { select.value = String(speed); });
      app.querySelectorAll<HTMLButtonElement>('[data-battle-speed-choice]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.battleSpeedChoice === String(speed))));
      speedError = '';
      showError([settingsError, hotkeyError].filter(Boolean).join(' '));
    } catch (error) {
      control.value = String(speed);
      console.error('Could not save Last Light battle speed', error);
      speedError = `Battle speed was not changed. ${errorMessage(error)}`;
      showError(speedError);
    }
  }));
  app.querySelectorAll<HTMLButtonElement>('[data-battle-speed-choice]').forEach(button => button.addEventListener('click', () => {
    const control = app.querySelector<HTMLSelectElement>('#battle-speed');
    if (!control) throw new Error('Battle speed control is missing.');
    control.value = button.dataset.battleSpeedChoice ?? '';
    control.dispatchEvent(new Event('change', { bubbles: true }));
  }));
  if (speedError) showError(speedError);
  app.querySelectorAll<HTMLButtonElement>('[data-menu-back]').forEach((button) => button.addEventListener('click', async () => {
    try { await backMenu(); }
    catch (error) { console.error('Back navigation failed', error); showError(errorMessage(error)); }
  }));
  app.querySelectorAll<HTMLButtonElement>('[data-page]:not([data-page="conduit-store"]):not([data-page="conduit-upgrade"])').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        const page = button.dataset.page;
        if (!isMenuPage(page)) throw new Error('Unknown menu page.');
        if (page === menuPage) return;
        await transitionActivity(async () => {
          if (page === 'profile' && playMode === 'online') await performOnline({ kind: 'read' });
          if (page === 'stores' && button.hasAttribute('data-market-cosmetics')) storeTab = 'cosmetics';
          if (page === 'battle' && menuPage !== 'battle') {
            if (!account) throw new Error('Progression save unavailable. Resolve the save error before battling.');
            await enterBattle({ kind: 'training' });
          }
          if (page !== 'battle' && menuPage === 'battle') {
            if (playMode === 'online' && battleSession) await performOnline({ kind: 'quit', runId: battleSession.runId });
            battleSession = null;
          }
          visitMenu(page);
          if (page === 'team' && button.dataset.teamArea) {
            const area = button.dataset.teamArea;
            if (area !== 'squad' && area !== 'bearers' && area !== 'creatures') throw new Error('Unknown Team area.');
            characterCategory = area;
            if (button.dataset.teamCharacter) {
              const id = button.dataset.teamCharacter;
              if (!isStarterId(id) || !account || !ownedCharacters(account).includes(id)) throw new Error('Choose an owned Element-Bearer.');
              selectedCharacter = id;
            }
            if (button.dataset.teamCapture) {
              const id = button.dataset.teamCapture;
              if (!account?.capturedCharacters?.some((copy) => copy.instanceId === id)) throw new Error('Choose an owned captured Elemental-Devourer.');
              selectedCapture = id;
            }
          }
          if (page === 'gameplay' && button.hasAttribute('data-machine-activity')) history.replaceState(null, '', '#gameplay-machines');
          if (page === 'gameplay' && button.hasAttribute('data-training-activity')) history.replaceState(null, '', '#gameplay-adventure');
          if (page === 'summon' && button.hasAttribute('data-rose-banner')) selectedBanner = 'roses';
          if (page === 'stores' && button.hasAttribute('data-cosmetic-store')) storeTab = 'cosmetics';
          renderMenu();
        });
      } catch (error) {
        console.error('Activity navigation failed', error);
        showError(errorMessage(error));
      }
    });
  });
  app.querySelectorAll<HTMLButtonElement>('[data-story-stage]').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        const stage = Number(button.dataset.storyStage);
        storyEncounter(stage);
        const current = currentAccount();
        if (stage > unlockedStoryStage(current)) throw new Error('Complete the earlier Story stages first.');
        await transitionActivity(async () => {
          account = current;
          await enterBattle({ kind: 'story', stage }, { storyStage: stage });
          visitMenu('battle');
          renderMenu();
        });
      } catch (error) {
        console.error('Story entry rejected', error);
        showError(errorMessage(error));
      }
    });
  });
  app.querySelectorAll<HTMLButtonElement>('[data-dungeon]').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        const element = button.dataset.dungeon;
        if (!isPlayableDungeon(element)) throw new Error('Unknown playable dungeon.');
        const stageControl = app.querySelector<HTMLSelectElement>(`[data-dungeon-stage="${element}"]`);
        if (!stageControl) throw new Error('Dungeon stage selection is missing.');
        const stage = Number(stageControl.value);
        const current = currentAccount();
        if (!Number.isInteger(stage) || stage < 1 || stage > unlockedStage(current, element)) throw new Error('Complete the earlier stages first.');
        await transitionActivity(async () => {
          account = current;
          await enterBattle({ kind: 'dungeon', element, stage }, { element, stage });
          visitMenu('battle');
          renderMenu();
        });
      } catch (error) {
        console.error('Dungeon entry rejected', error);
        showError(errorMessage(error));
      }
    });
  });
  bindCalamityEntries(app, currentAccount, async (activity, tier) => {
    await transitionActivity(async () => {
      account = currentAccount();
      assertActivityAccess(account, { kind: 'calamity', activity, tier });
      await enterBattle({ kind: 'calamity', activity, tier }, { activity, tier });
      visitMenu('battle');
      renderMenu();
    });
  }, () => activityTransitionPending() || onlineBusy || onlinePending !== null, error => showError(errorMessage(error)));
  app.querySelectorAll<HTMLButtonElement>('[data-war]').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        const character = button.dataset.war;
        if (!isWarCharacter(character)) throw new Error('Unknown Elemental War challenger.');
        const control = app.querySelector<HTMLSelectElement>(`[data-war-stage="${character}"]`);
        if (!control) throw new Error('Elemental War stage selector is missing.');
        const stage = Number(control.value);
        const current = currentAccount();
        if (!Number.isInteger(stage) || stage < 1 || stage > unlockedWarStage(current, character)) throw new Error('Complete earlier Elemental War stages first.');
        await transitionActivity(async () => {
          account = current;
          await enterBattle({ kind: 'war', character, stage }, { character, stage });
          visitMenu('battle');
          renderMenu();
        });
      } catch (error) {
        console.error('Elemental War entry rejected', error);
        showError(errorMessage(error));
      }
    });
  });
  app.querySelectorAll<HTMLButtonElement>('[data-feature]').forEach((button) => {
    button.addEventListener('click', () => {
      showError(`${button.dataset.feature} is coming later. No units or currency have been changed.`);
    });
  });
  app.querySelectorAll<HTMLButtonElement>('[data-infusion]').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        const mode = button.dataset.infusion;
        if (!isInfusionMode(mode)) throw new Error('Unknown infusion mode.');
        const control = app.querySelector<HTMLSelectElement>(`[data-infusion-stage="${mode}"]`);
        if (!control) throw new Error('Infusion stage selector is missing.');
        const stage = Number(control.value);
        const current = currentAccount();
        if (!Number.isInteger(stage) || stage < 1 || stage > unlockedInfusionStage(current, mode)) throw new Error('Complete earlier infusion stages first.');
        await transitionActivity(async () => {
          account = current;
          await enterBattle({ kind: 'infusion', mode, stage }, { mode, stage });
          visitMenu('battle');
          renderMenu();
        });
      } catch (error) {
        console.error('Infusion entry rejected', error);
        showError(errorMessage(error));
      }
    });
  });
  app.querySelectorAll<HTMLButtonElement>('[data-character-tab], [data-character-section-tab]').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        const tab = button.dataset.characterTab ?? button.dataset.characterSectionTab;
        if (!tab || !isCharacterTab(tab)) throw new Error('Unknown character upgrade area.');
        if (tab === 'equipment' && app.querySelector('.ref-character-submenus')) {
          await openConduitPage();
          return;
        }
        if (app.querySelector('.ref-character-submenus')) {
          characterTab = tab;
          updateCharacterTab(app, getStarter(selectedCharacter ?? starter.id), tab, account);
          if (matchMedia('(max-width: 1100px)').matches) {
            app.querySelector('#upgrade-heading')?.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' });
          }
          return;
        }
        await transitionActivity(() => {
          characterTab = tab;
          visitMenu('character');
          renderMenu();
        });
        app.querySelector<HTMLElement>('#upgrade-heading')?.focus();
      } catch (error) {
        console.error('Character navigation failed', error);
        showError(errorMessage(error));
      }
    });
  });
  const drawer = app.querySelector<HTMLDialogElement>('#settings-drawer');
  if (!drawer) throw new Error('Settings drawer is missing.');
  app.querySelector('#open-settings')?.addEventListener('click', () => {
    if (activityTransitionPending() || app.querySelector('#battle-root')?.getAttribute('aria-busy') === 'true') return;
    battleView?.destroy();
    battleView = null;
    drawer.showModal();
    if (settingsError || hotkeyError) showError([settingsError, hotkeyError].filter(Boolean).join(' '));
  });
  const closeSettings = (): void => {
    drawer.close();
    if (menuPage === 'battle') renderMenu();
    app.querySelector<HTMLButtonElement>('#open-settings')?.focus();
  };
  app.querySelector('#close-settings')?.addEventListener('click', closeSettings);
  drawer.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeSettings();
  });
  if (menuPage === 'battle') {
    const host = app.querySelector<HTMLElement>('#battle-root');
    if (!host) throw new Error('Battle host is missing.');
    if (!battleSession) {
      if (!account) { showError('Progression save unavailable. Resolve the save error before battling.'); return; }
      if (playMode === 'online') { showError('Online battle unavailable. Return to the title and reconnect.'); return; }
      battleSession = squadSession(account);
    }
    try {
      if (playMode === 'legacy') restartHistoricalConduitSession(battleSession);
      if (playMode === 'legacy') account = saveAccountRewards(gameStorage, { state: battleSession.state, events: [] }, battleSession.runId);
    } catch (error) {
      console.error('Elemental-Devourer discovery could not be saved', error);
      showError(`The encounter cannot start until discoveries can be saved. ${errorMessage(error)}`);
      return;
    }
    battleView = new BattleView(host, battleSession, bindings, (result) => {
      const balance = app.querySelector('#fractalis-balance');
      if (!balance) throw new Error('Prismatica balance region is missing.');
      try {
        if (!battleSession) throw new Error('Battle session is missing.');
        account = playMode === 'online' ? currentAccount() : saveAccountRewards(gameStorage, result, battleSession.runId);
        fractalis = account.fractalis;
      } catch (error) {
        throw new Error(`Rewards could not be saved. The battle action was not applied; retry when storage is available. ${errorMessage(error)}`);
      }
      walletError = '';
      balance.textContent = String(fractalis);
      const premium = app.querySelector('#lycalis-balance');
      if (premium) premium.textContent = String(account.lycalis);
      const error = app.querySelector('#wallet-error');
      if (error) error.textContent = '';
    }, backMenu, playMode === 'online' ? battleAuthority() : undefined, (state) => {
      if (playMode === 'legacy' && state.infusion?.mode === 'machines') {
        const current = currentAccount();
        state.machineConduits = { ...current.conduits };
        state.machineLootFocus = { ...current.machineLootFocus };
      }
      music.setTrack(battleMusic(state));
    });
  }
  const walletStatus = app.querySelector('#wallet-error');
  updateProfileAvatar();
  if (playMode === 'online' && onlinePending && !onlineBusy) showError('The previous online operation has not been confirmed. Retry it before issuing another operation.');
  if (walletStatus) walletStatus.textContent = walletError;
  bindConduitPurchases();
  app.querySelectorAll<HTMLButtonElement>('[data-owned-character]').forEach((button) => {
    button.addEventListener('click', () => {
      try {
        const id = button.dataset.ownedCharacter;
        const current = currentAccount();
        if (!isStarterId(id) || !ownedCharacters(current).includes(id)) throw new Error('Choose an owned character.');
        selectedCharacter = id;
        visitMenu('character');
        renderMenu();
        app.querySelector<HTMLElement>('#upgrade-heading')?.focus();
      } catch (error) {
        console.error('Character selection failed', error);
        showError(errorMessage(error));
      }
    });
  });
  const squadForm = app.querySelector<HTMLFormElement>('#squad-form');
  if (account) bindCreatureBulkSale(app, account, async selections => {
    if (gameDialogPending()) return;
    let saved = false;
    try {
      const current = currentAccount();
      const offer = creatureBatchSaleOffer(current, selections);
      const payout = saleLabel(offer);
      const choices = offer.offers.map(entry => {
        const index = (current.capturedCharacters ?? []).findIndex(copy => copy.instanceId === entry.copy.instanceId) + 1;
        return `<li><b>${escapeDialogText(getCreature(entry.copy.creatureId).name)} · Copy ${index}</b><span>${escapeDialogText(saleLabel(entry))}</span></li>`;
      }).join('');
      const choice = await gameChoose(`Sell ${selections.length} copies?`, [
        { value: 'cancel', label: 'Cancel' }, { value: 'sell', label: `Sell ${selections.length} copies`, primary: true },
      ] as const, 'cancel', { title: 'Review Elemental-Devourer sale',
        messageHtml: `<p>Permanently remove these ${selections.length} copies? This cannot be undone.</p><ul class="creature-bulk-review">${choices}</ul>${itemShowcase(saleItems(offer), 'Total sale value')}` });
      if (choice !== 'sell') return;
      account = playMode === 'online'
        ? (await performOnline({ kind: 'sellCurrencyCreatures', selections })).account
        : sellCurrencyCreatures(gameStorage, selections);
      saved = true;
      if (selections.some(selection => selection.id === selectedCapture)) selectedCapture = undefined;
      renderMenu();
      const rarity = offer.offers.reduce<Rarity>((best, entry) => {
        const next = capturedRarity(entry.copy.creatureId);
        return rarities.indexOf(next) > rarities.indexOf(best) ? next : best;
      }, 'Common');
      await presentReward({ title: 'Sale complete', name: `${selections.length} Elemental-Devourers sold`,
        art: itemShowcase(saleItems(offer), 'Received'), details: `<p>${escapeDialogText(payout)} added to Inventory.</p>`,
        rarity, accent: '#fff', animationLabel: 'Releasing elemental echoes', savedLabel: 'Sale saved' });
      app.querySelector<HTMLButtonElement>('[data-bulk-sale-toggle]')?.focus({ preventScroll: true });
    } catch (cause) {
      console.error('Multi-select Elemental-Devourer sale failed', cause);
      showError(`${saved ? 'The sale was saved, but its presentation could not finish.'
        : playMode === 'online' && onlinePending ? 'The sale is awaiting confirmation. Retry the pending operation before selling again.'
          : 'The sale was not completed.'} ${errorMessage(cause)}`);
    }
  }, cause => {
    console.error('Multi-select sale selection failed', cause);
    showError(`Sale selection could not be updated. ${errorMessage(cause)}`);
  });
  app.querySelectorAll<HTMLButtonElement>('[data-sell-creature]').forEach((button) => button.addEventListener('click', async () => {
    try {
      const id = button.dataset.sellCreature;
      if (!id) throw new Error('Currency-farm copy is missing.');
      const saleOption = button.dataset.saleOption;
      const offer = creatureSaleOffer(currentAccount(), id, saleOption);
      if (offer.reasons.length) throw new Error(`Sale protected: ${offer.reasons.join(', ')}.`);
      const payout = saleLabel(offer);
      if (!await gameConfirm(`Permanently sell ${getCreature(offer.copy.creatureId).name} for ${payout}? This exact copy will be removed and cannot be restored.`, { title: 'Sell Elemental-Devourer', confirmLabel: 'Sell copy', danger: true })) return;
      account = playMode === 'online' ? (await performOnline({ kind: 'sellCurrencyCreature', id, ...(saleOption ? { saleOption } : {}) })).account : sellCurrencyCreature(gameStorage, id, saleOption);
      if (selectedCapture === id) {
        selectedCapture = undefined;
        teamView = 'creatures';
        characterCategory = 'creatures';
      }
      renderMenu();
      const status = app.querySelector('#character-lock-result');
      if (status) status.textContent = `Elemental-Devourer sold · +${payout}.`;
    } catch (error) {
      console.error('Currency-farm Elemental-Devourer sale rejected', error);
      showError(`Elemental-Devourer was not sold. ${errorMessage(error)}`);
    }
  }));
  app.querySelectorAll<HTMLButtonElement>('[data-level-capture]').forEach((button) => button.addEventListener('click', async () => {
    let saved = false;
    try {
      const id = button.dataset.levelCapture;
      if (!id) throw new Error('Captured Elemental-Devourer is missing.');
      if (!await gameConfirm('Spend the listed Prismatica and materials to level up this captured copy?', { title: 'Level up Elemental-Devourer', confirmLabel: 'Level up' })) return;
      const expectedLevel = Number(button.dataset.expectedLevel);
      const before = structuredClone(currentAccount());
      account = playMode === 'online' ? (await performOnline({ kind: 'levelCaptured', id, expectedLevel })).account : levelCapturedCharacter(gameStorage, id, expectedLevel);
      saved = true;
      const after = account;
      renderMenu();
      await presentUpgrade(before, after, id, 'level');
    } catch (error) {
      console.error('Captured Elemental-Devourer level rejected', error);
      showError(`${saved ? 'Level is saved, but its presentation could not complete.' : 'Level was not changed.'} ${errorMessage(error)}`);
    }
  }));
  app.querySelectorAll<HTMLButtonElement>('[data-character-lock]').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        const id = button.dataset.characterLock;
        const value = button.dataset.lockValue;
        if (!id || (value !== 'true' && value !== 'false')) throw new Error('Invalid character lock control.');
        account = playMode === 'online' ? (await performOnline({ kind: 'setCharacterLock', id, locked: value === 'true' })).account : setCharacterLock(gameStorage, id, value === 'true');
        renderMenu();
        const result = app.querySelector('#character-lock-result');
        if (!result) throw new Error('Character lock status is missing.');
        result.textContent = value === 'true' ? 'Character locked.' : 'Character unlocked.';
      } catch (error) {
        console.error('Character lock update rejected', error);
        showError(`Character lock was not changed. ${errorMessage(error)}`);
      }
    });
  });
  squadForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const form = new FormData(squadForm);
      const ids: string[] = [];
      for (let slot = 0; slot < 3; slot++) {
        const id = form.get(`slot-${slot}`);
        if (id === '' && slot > 0) continue;
        if (typeof id !== 'string' || !ownedCharacterInstances(currentAccount()).includes(id)) throw new Error('Choose a valid squad member.');
        ids.push(id);
      }
      account = playMode === 'online' ? (await performOnline({ kind: 'setSquad', ids })).account : setSquad(gameStorage, ids);
      renderMenu();
      const status = app.querySelector('#squad-result');
      if (!status) throw new Error('Squad status region is missing.');
      status.textContent = 'Squad saved.';
    } catch (error) {
      console.error('Squad update rejected', error);
      showError(`Squad was not changed. ${errorMessage(error)}`);
    }
  });
  app.querySelector<HTMLButtonElement>('#summon-character')?.addEventListener('click', async () => {
    if (gameDialogPending()) return;
    let saved = false;
    try {
      const banner = getSummonBanner(selectedBanner);
      if (!await gameConfirm(`Spend ${banner.cost} Null-Prismatica for one ${banner.name} draw? See Rates & Information for odds and reward rules.`, { title: banner.name, confirmLabel: 'Summon' })) return;
      const result = playMode === 'online' ? (await performOnline({ kind: 'summon', bannerId: banner.id })).summon : summonCharacter(gameStorage, Math.random, banner.id);
      if (!result) throw new Error('The server did not return the saved summon receipt.');
      saved = true;
      account = result.account;
      renderMenu();
      const status = app.querySelector('#summon-result');
      if (!status) throw new Error('Summon status is missing.');
      const form = result.copy ? capturedProgress(result.copy).tier + 1 : 1;
      const name = result.materials ? `${result.materials.amount} ${materialName(result.materials.id)}`
        : result.copy ? `${getCreature(result.copy.creatureId).name} Elemental-Devourer · ${evolutionRarity(form)} · ${form}-star · Lv.${result.copy.level}`
        : result.entry.kind === 'character' ? `${characterName(result.entry.id)} · New Element-Bearer · Common · ${result.entry.stars}-star · Lv.0` : '';
      if (!name) throw new Error('Summon reward identity is missing.');
      status.textContent = `${result.duplicate ? 'Owned EB converted: ' : 'Received: '}${name}. ${banner.cost} Null-Prismatica spent.${result.guarantee !== 'none' ? ` Pity: ${result.guarantee}.` : ''}${result.bonusConduit ? ` Bonus: ${getConduit(result.bonusConduit).name} · Legendary Conduit. Not auto-equipped.` : ''}`;
      await presentReward(summonReward(result, banner.id));
      app.querySelector<HTMLButtonElement>('#summon-character')?.focus({ preventScroll: true });
    } catch (error) {
      console.error('Summoning rejected', error);
      showError(`${saved ? 'Your summon reward is saved, but its presentation could not complete. Check Team and Inventory.' : 'Summoning was not completed.'} ${errorMessage(error)}`);
    }
  });
  app.querySelector<HTMLButtonElement>('#summon-ten')?.addEventListener('click', async () => {
    if (gameDialogPending()) return;
    let saved = false;
    try {
      const banner = getSummonBanner(selectedBanner);
      const cost = banner.cost * multiSummonCount;
      if (!await gameConfirm(`Spend ${cost} Null-Prismatica for ten ${banner.name} draws? Each draw uses the normal odds, pity and bonus rules. See Rates & Information.`, { title: banner.name, confirmLabel: 'Summon 10-Pull' })) return;
      let result: { account: Account; draws: SummonDraw[] };
      if (playMode === 'online') {
        const response = await performOnline({ kind: 'summonTen', bannerId: banner.id });
        if (!response.summons) throw new Error('The server did not return the saved 10-pull receipt.');
        result = { account: response.account, draws: response.summons };
      } else result = summonCharacters(gameStorage, Math.random, banner.id, multiSummonCount);
      saved = true;
      account = result.account;
      renderMenu();
      const status = app.querySelector('#summon-result');
      if (!status) throw new Error('Summon status is missing.');
      const characters = result.draws.filter(draw => draw.entry.kind === 'character' && !draw.duplicate).length;
      status.textContent = `10-Pull saved: ${characters} new Element-Bearer${characters === 1 ? '' : 's'}, ${multiSummonCount - characters} material bundle${multiSummonCount - characters === 1 ? '' : 's'}. ${cost} Null-Prismatica spent.`;
      await presentReward(summonTenReward(result.account, result.draws, banner.id));
      app.querySelector<HTMLButtonElement>('#summon-ten')?.focus({ preventScroll: true });
    } catch (error) {
      console.error('10-pull summoning rejected', error);
      showError(`${saved ? 'Your 10-pull rewards are saved, but their presentation could not complete. Check Team and Inventory.' : 'The 10-pull was not completed. Nothing was spent.'} ${errorMessage(error)}`);
    }
  });
  const musicVolume = app.querySelector<HTMLInputElement>('#music-volume');
  const musicMuted = app.querySelector<HTMLInputElement>('#music-muted');
  const saveMusic = (): void => {
    if (!musicVolume || !musicMuted) throw new Error('Music settings controls are missing.');
    try {
      const next = { volume: Number(musicVolume.value), muted: musicMuted.checked };
      saveMusicPreferences(window.localStorage, next);
      musicPreferences = next;
      music.configure(next);
      musicSettingsError = '';
    } catch (error) {
      console.error('Could not save Last Light music settings', error);
      musicVolume.value = String(musicPreferences.volume);
      musicMuted.checked = musicPreferences.muted;
      musicSettingsError = `Music settings were not changed. ${errorMessage(error)}`;
      showError(musicSettingsError);
    }
    const output = app.querySelector<HTMLOutputElement>('#music-volume-value');
    if (output) output.value = `${musicPreferences.volume}%`;
  };
  musicVolume?.addEventListener('input', saveMusic);
  musicMuted?.addEventListener('change', saveMusic);
  if (musicSettingsError) showError(musicSettingsError);
  const settingsForm = app.querySelector<HTMLFormElement>('#settings-form');
  settingsForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = new FormData(settingsForm).get('motion');
    if (value !== 'system' && value !== 'reduced') throw new Error('Invalid motion option.');
    try {
      saveMotion(gameStorage, value);
      motionPreference = value;
      applyMotion(value);
      settingsError = '';
      showError(hotkeyError);
      const message = app.querySelector('#settings-result');
      if (!message) throw new Error('Settings result region is missing.');
      message.textContent = 'Motion preference saved.';
    } catch (error) {
      console.error('Could not save Last Light settings', error);
      showError(`Settings were not saved. ${errorMessage(error)}`);
    }
  });
  const hotkeyForm = app.querySelector<HTMLFormElement>('#hotkey-form');
  hotkeyForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const hotkeyResult = app.querySelector('#hotkey-result');
    if (!hotkeyResult) throw new Error('Hotkey result region is missing.');
    hotkeyResult.textContent = '';
    const candidate: Record<string, FormDataEntryValue> = {};
    const form = new FormData(hotkeyForm);
    for (const [command] of commands) {
      const value = form.get(command);
      if (value === null) throw new Error('A hotkey field is missing.');
      candidate[command] = value;
    }
    try {
      const validated = validateBindings(candidate);
      saveBindings(gameStorage, validated);
      bindings = validated;
      hotkeyError = '';
      showError(settingsError);
      const result = app.querySelector('#hotkey-result');
      if (!result) throw new Error('Hotkey result region is missing.');
      result.textContent = 'Selection keys saved.';
    } catch (error) {
      console.error('Could not save battle hotkeys', error);
      showError(`Hotkeys were not changed. ${errorMessage(error)}`);
    }
  });
  app.querySelector('#return-title')?.addEventListener('click', async () => {
    if (gameDialogPending()) return;
    try {
      if (menuPage === 'battle' && !await gameConfirm('End this battle and return to the title? Saved rewards are kept; encounter progress is not.', { title: 'Leave battle', confirmLabel: 'Return to title' })) return;
      if (menuPage === 'battle' && playMode === 'online' && battleSession) await performOnline({ kind: 'quit', runId: battleSession.runId });
      battleView?.destroy();
      battleView = null;
      battleSession = null;
      drawer.close();
      menuHistory.clear();
      resetConduitLoadoutView();
      menuPage = 'home';
      inventoryTab = 'materials';
      inventoryExpanded = { ...defaultInventorySections };
      inventoryFilterState = { ...defaultInventoryFilters };
      journey.screen = 'title';
      render();
      app.querySelector<HTMLButtonElement>('#enter')?.focus();
    } catch (error) {
      console.error('Could not return to title', error);
      showError(`Could not leave this screen. ${errorMessage(error)}`);
    }
  });
}

function menuContent(page: Exclude<MenuPage, 'home'> | 'settings'): string {
  if (!journey.profile) throw new Error('A saved Element-Bearer is required.');
  const starter = getStarter(journey.profile.starterId);
  if (page === 'battle') return '<div id="battle-root"></div>';
  if ((page === 'character' || page === 'team' || page === 'squad') && (teamView === 'capture' || teamView === 'capture-conduits')
      && !account?.capturedCharacters?.some(copy => copy.instanceId === selectedCapture)) {
    // A sold or otherwise removed copy (including one restored from Back history) returns to the list.
    teamView = 'creatures';
    selectedCapture = undefined;
  }
  if (page === 'character' || page === 'team' || page === 'squad') return referenceTeam(account, {
    view: teamView, selected: selectedCharacter ?? starter.id, capture: selectedCapture, element: teamElement, sort: teamSort, tab: characterTab,
  });
  if (page === 'inventory') return inventoryHub(account, inventoryTab, inventoryExpanded, inventoryFilterState);
  if (page === 'stores') return onlineStores(account, playerProfile, storeTab, marketMaterial, marketFrame);
  if (page === 'profile') return gameStorage.active
    ? '<section class="ref-panel"><h1 tabindex="-1">Debug Player info</h1><p>This test profile lives only in memory. Real save-data management and online accounts are disabled here.</p><p>Exit debug or reload to return to your real progress.</p><button class="text-button" data-exit-debug>Exit debug</button></section>'
    : viewedFriend ? friendProfileScreen(viewedFriend.account, { ...viewedFriend.profile, userId: viewedFriend.userId })
    : onlineProfile(account, playerProfile, socialDisplay, profileTab, friendRequestTab);
  if (page === 'collections') return archives(account);
  if (page === 'conduit-store') return conduitStore(account, storeConduit, storeRarity);
  if (page === 'conduit-upgrade') return conduitUpgradeMenu(account, upgradeConduitSelection);
  if (page === 'archives' || page === 'glossary') return archives(account, page === 'glossary' ? 'creatures' : 'characters');
  if (page === 'summon') return summonHub(account, selectedBanner);
  if (page === 'gameplay') return gameplayHub(account);
  if (page === 'story') return gameplayHub(account);
  if (page === 'events') return roseEvent(account);
  return settingsPanel(motionPreference, bindings, speed, musicPreferences);
}

function render(): void {
  syncAutosave();
  if (playerInfoOpen) renderPlayerInfo();
  else if (journey.screen === 'title') renderTitle();
  else if (journey.screen === 'selection') renderSelection();
  else renderMenu();
}

function bindConduitPurchases(): void {
  app.querySelectorAll<HTMLButtonElement>('[data-buy-conduit]').forEach(button => {
    button.addEventListener('click', async () => {
      let saved = false;
      try {
        if (button.disabled) return;
        const id = button.dataset.buyConduit;
        if (!isConduitId(id)) throw new Error('Unknown Conduit.');
        const conduit = getConduit(id);
        const current = currentAccount();
        const cost = isCalamiticConduitId(id) ? `${calamiticTokenPrice} Calamitic Tokens` : `${conduit.price} Prismatica`;
        if (!await gameConfirm(`Buy one ${conduit.name} for ${cost}? ${conduitEffect(conduit, current.conduitUpgrades?.[id])} when equipped. One owned copy unlocks it for every character; extra copies add no equipment benefit.`, { title: 'Purchase Conduit', confirmLabel: 'Buy one' })) return;
        account = playMode === 'online' ? (await performOnline({ kind: 'purchaseConduit', id })).account : purchaseConduit(gameStorage, id);
        saved = true;
        refreshConduitMenu();
        const result = app.querySelector('#conduit-purchase-result');
        if (!result) throw new Error('Conduit purchase status is missing.');
        result.textContent = `${conduit.name} purchased. Owned ${account.conduits?.[id]}.`;
        await presentReward(conduitReward(id, account, 'Conduit acquired', `${cost} spent`));
        app.querySelector<HTMLButtonElement>(`[data-buy-conduit="${id}"]`)?.focus({ preventScroll: true });
      } catch (error) {
        console.error('Conduit purchase rejected', error);
        showError(`${saved ? 'Conduit purchased and saved, but its presentation could not complete. Check Inventory.' : 'Conduit purchase was not completed.'} ${errorMessage(error)}`);
      }
    });
  });
}

function refreshConduitMenu(): void {
  if (menuPage === 'conduit-store') {
    updateConduitStore(app, account, storeConduit, storeRarity);
    bindConduitPurchases();
  } else if (menuPage === 'conduit-upgrade') {
    updateConduitUpgradeMenu(app, account, upgradeConduitSelection);
    bindConduitUpgrades(app, gameStorage, updated => { account = updated; refreshConduitMenu(); }, showError,
      playMode === 'online' ? async (id, expectedLevel) => (await performOnline({ kind: 'upgradeConduit', id, expectedLevel })).account : undefined,
      playMode === 'online' ? async expected => (await performOnline({ kind: 'maxConduit', expected })).account : undefined);
  } else throw new Error('No active Conduit menu to update.');
  if (account) {
    const main = app.querySelector('#fractalis-balance');
    const premium = app.querySelector('#lycalis-balance');
    if (main) main.textContent = String(account.fractalis);
    if (premium) premium.textContent = String(account.lycalis);
  }
}

app.addEventListener('click', async event => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest<HTMLButtonElement>('[data-profile-tab], [data-copy-username], [data-copy-profile], [data-message-friend]');
  if (!button || button.disabled) return;
  try {
    if (button.dataset.copyUsername || button.dataset.copyProfile) {
      await navigator.clipboard.writeText(button.dataset.copyUsername ?? button.dataset.copyProfile!);
      button.textContent = 'Copied';
    } else {
      viewedFriend = null;
      const tab = button.dataset.messageFriend ? 'chats' : button.dataset.profileTab;
      if (button.dataset.messageFriend) {
        if (chatUiState.retry) throw new Error('Retry your pending chat action before starting another message.');
        chatUiState.openPeer = button.dataset.messageFriend;
      }
      if (tab !== 'info' && tab !== 'friends' && tab !== 'chats') throw new Error('Unknown profile view.');
      profileTab = tab;
      renderMenu();
    }
  } catch (error) {
    console.error('Profile control failed', error);
    showError(errorMessage(error));
  }
});

let friendProfileLoading = false;
app.addEventListener('click', async event => {
  if (!(event.target instanceof Element)) return;
  const open = event.target.closest<HTMLButtonElement>('[data-view-friend-profile]');
  const close = event.target.closest<HTMLButtonElement>('[data-close-friend-profile]');
  if (close) {
    viewedFriend = null;
    profileTab = 'friends';
    renderMenu();
    return;
  }
  if (!open || open.disabled || friendProfileLoading) return;
  const label = open.textContent;
  friendProfileLoading = true;
  open.disabled = true;
  open.textContent = 'Loading…';
  try {
    if (playMode !== 'online') throw new Error('Sign in to view friend profiles.');
    viewedFriend = await friendProfile(open.dataset.viewFriendProfile ?? '');
    renderMenu();
    app.querySelector<HTMLElement>('.friend-profile-name')?.focus({ preventScroll: true });
  } catch (error) {
    console.error('Friend profile failed', error);
    open.disabled = false;
    open.textContent = label;
    showError(errorMessage(error));
  } finally {
    friendProfileLoading = false;
  }
});

app.addEventListener('input', event => {
  if (!(event.target instanceof HTMLInputElement) || !event.target.hasAttribute('data-friend-search')) return;
  const query = event.target.value.trim().toLowerCase();
  app.querySelectorAll<HTMLElement>('[data-friend-name]').forEach(entry => {
    entry.hidden = !entry.dataset.friendName?.includes(query);
  });
  const empty = app.querySelector<HTMLElement>('[data-friend-no-match]');
  if (empty) empty.hidden = !query || !!app.querySelector('[data-friend-name]:not([hidden])');
});

app.addEventListener('click', event => {
    if (!(event.target instanceof Element) || !event.target.closest('[data-browse-profile-pictures]')) return;
    void (async () => {
      if (!account || !playerProfile || playMode !== 'online') throw new Error('Sign in to choose a profile picture.');
      const picker = app.querySelector<HTMLSelectElement>('[data-profile-icon-picker]');
      if (!picker) throw new Error('Profile editor is unavailable.');
      const selected = await chooseProfilePicture(account, playerProfile.icon);
      if (!selected) return;
      if (!picker.isConnected || !playerProfile || playMode !== 'online') throw new Error('Profile editor changed. Open it again to select your picture.');
      picker.value = selected;
      picker.dispatchEvent(new Event('change', { bubbles: true }));
    })().catch(error => { console.error('Profile picture selection failed', error); showError(errorMessage(error)); });
});

app.addEventListener('click', async event => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest<HTMLButtonElement>('[data-store-conduit], [data-store-rarity], [data-select-upgrade-conduit]');
  if (!button || button.disabled) return;
  if (button.getAttribute('aria-pressed') === 'true' || button.classList.contains('is-selected')) return;
  const id = button.dataset.storeConduit ?? button.dataset.selectUpgradeConduit;
  if (id && !isConduitId(id)) { showError('Unknown Conduit selection.'); return; }
  if (button.hasAttribute('data-store-rarity')) storeRarity = button.dataset.storeRarity ?? '';
  else if (button.dataset.storeConduit) storeConduit = id;
  else upgradeConduitSelection = id;
  try {
    refreshConduitMenu();
    if (id && isConduitId(id)) {
      const target = app.querySelector<HTMLElement>('.ref-store-hero, .conduit-upgrade-hero');
      if (target) rarityFeedback(target, getConduit(id).rarity);
    }
  }
  catch (error) { console.error('Conduit selection failed', error); showError(errorMessage(error)); }
});

app.addEventListener('click', async event => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest<HTMLButtonElement>('[data-team-view], [data-team-detail], [data-team-capture-detail], [data-team-element], [data-make-leader]');
  if (!button || button.disabled || activityTransitionPending()) return;
  try {
    if (!account) throw new Error('Team is unavailable. Resolve the account error.');
    if (button.dataset.makeLeader) {
      const id = button.dataset.makeLeader;
      const squad = equippedSquad(account);
      if (!squad.includes(id)) throw new Error('Only a saved squad member can become the leader.');
      const reordered = [id, ...squad.filter(member => member !== id)];
      account = playMode === 'online' ? (await performOnline({ kind: 'setSquad', ids: reordered })).account : setSquad(gameStorage, reordered);
      renderMenu();
      return;
    }
    await transitionActivity(() => {
      if (menuPage !== 'team') visitMenu('team');
      const loadout = button.dataset.teamTab === 'equipment';
      characterTab = 'overview';
      if (button.hasAttribute('data-team-element')) {
        teamElement = button.dataset.teamElement ?? '';
        teamView = 'bearers';
      } else if (button.dataset.teamDetail) {
        const id = button.dataset.teamDetail;
        if (!isStarterId(id) || !account?.characters[id]) throw new Error('Choose an owned Element-Bearer.');
        selectedCharacter = id;
        teamView = loadout ? 'conduits' : 'detail';
      } else if (button.dataset.teamCaptureDetail) {
        const id = button.dataset.teamCaptureDetail;
        if (!account?.capturedCharacters?.some(copy => copy.instanceId === id)) throw new Error('Choose an owned captured Elemental-Devourer.');
        selectedCapture = id;
        teamView = loadout ? 'capture-conduits' : 'capture';
      } else {
        const view = button.dataset.teamView;
        if (view !== 'detail' && view !== 'bearers' && view !== 'creatures' && view !== 'capture' && view !== 'formation') throw new Error('Unknown Team view.');
        teamView = view;
      }
      characterCategory = teamView === 'formation' ? 'squad' : teamView === 'creatures' || teamView === 'capture' || teamView === 'capture-conduits' ? 'creatures' : 'bearers';
      renderMenu();
    });
  } catch (error) {
    console.error('Team operation failed', error);
    showError(errorMessage(error));
  }
});

app.addEventListener('change', event => {
  if (!(event.target instanceof HTMLSelectElement) || !event.target.hasAttribute('data-team-sort')) return;
  const sort = event.target.value;
  if (sort !== 'level' && sort !== 'name' && sort !== 'element') {
    showError('Unknown collection sorting option.');
    return;
  }
  teamSort = sort;
  renderMenu();
});

function offlineSaveChanged(change: OfflineChange): void {
  if (playMode === 'online') {
    if (playerInfoOpen) renderPlayerInfo();
    else renderMenu();
    showError(change === 'loaded' ? 'Offline save loaded. Your online progress is unchanged.' : 'Offline save deleted. Your online progress is unchanged.');
    return;
  }
  const fromMenu = journey.screen === 'menu';
  battleView?.destroy();
  battleView = null;
  battleSession = null;
  journey.profile = null;
  journey.screen = 'title';
  menuHistory.clear();
  resetConduitLoadoutView();
  if (change === 'loaded') {
    if (fromMenu) {
      journey.enter(gameStorage);
      menuPage = 'profile';
      profileTab = 'info';
    } else playerInfoOpen = true;
    render();
    showError('Offline save loaded.');
  } else {
    playerInfoOpen = true;
    render();
    showError('Offline save data deleted. Online account data is unchanged.');
  }
}

app.addEventListener('offline-save-changed', event => {
  if (!(event instanceof CustomEvent) || (event.detail !== 'loaded' && event.detail !== 'deleted')) {
    throw new Error('Offline save presentation returned an invalid change.');
  }
  offlineSaveChanged(event.detail);
});

app.addEventListener('change', async event => {
  if (!(event.target instanceof HTMLSelectElement) || !event.target.hasAttribute('data-master-equipment')) return;
  const select = event.target;
  const character = select.dataset.masterEquipment;
  try {
    if (!isStarterId(character) || (select.value && !isMasterConduitId(select.value))) throw new Error('Invalid Master equipment selection.');
    const id = isMasterConduitId(select.value) ? select.value : null;
    account = playMode === 'online' ? (await performOnline({ kind: 'equipMasterConduit', character, conduit: id })).account : equipMasterConduit(gameStorage, character, id);
    refreshLoadout(character);
    if (id) {
      const target = app.querySelector<HTMLElement>('.ref-master-slot');
      if (target) rarityFeedback(target, 'Omnic', 'Master equipped');
    }
  } catch (error) {
    console.error('Master equipment rejected', error);
    if (account && isStarterId(character)) refreshLoadout(character);
    showError(`Master equipment was not changed. ${errorMessage(error)}`);
  }
});

app.addEventListener('click', event => {
  if (event.target instanceof Element && event.target.closest('[data-open-player-info]')) openPlayerInfo();
});
app.addEventListener('player-account-open', () => openOnlineAccount(() => enterOnline()));
app.addEventListener('online-save-ready', () => {
  void enterOnline(true).catch(error => { console.error('Could not open online progress', error); showError(errorMessage(error)); });
});

app.addEventListener('click', async event => {
  if (!(event.target instanceof Element) || !event.target.closest('[data-retry-online]')) return;
  try {
    if (!onlinePending) throw new Error('There is no pending operation.');
    const operation = onlinePending.operation;
    const response = await performOnline(operation);
    if (response.starterId) {
      journey.profile = { version: 1, starterId: response.starterId };
      journey.screen = 'menu';
    }
    battleSession = response.session;
    if (response.session && menuPage !== 'battle') visitMenu('battle');
    if (operation.kind === 'quit' && menuPage === 'battle') await backMenu();
    else render();
    showError('The previous operation is confirmed and saved.');
    if (response.summon && operation.kind === 'summon') await presentReward(summonReward(response.summon, operation.bannerId));
    if (response.summons && operation.kind === 'summonTen') await presentReward(summonTenReward(response.account, response.summons, operation.bannerId));
    if (response.calamityOpening && operation.kind === 'openCalamityChest') await presentReward(calamityOpeningReward(operation.id, response.calamityOpening));
  } catch (error) {
    console.error('Pending online operation retry failed', error);
    showError(errorMessage(error));
  }
});

app.addEventListener('click', async event => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest<HTMLButtonElement>('[data-store-tab], [data-market-category], [data-market-material], [data-market-frame], [data-buy-material], [data-buy-frame], [data-equip-frame], [data-open-online-account], [data-online-signout]');
  if (!button || button.disabled) return;
  try {
    if (button.hasAttribute('data-open-online-account')) {
      openOnlineAccount(enterOnline);
      return;
    }
    if (button.dataset.storeTab) {
      const tab = button.dataset.storeTab;
      if (tab !== 'materials' && tab !== 'cosmetics') throw new Error('Unknown store.');
      storeTab = tab;
      renderMenu();
      return;
    }
    if (button.dataset.marketCategory) {
      const category = button.dataset.marketCategory;
      if (category !== 'normal' && category !== 'event') throw new Error('Unknown material category.');
      if (exchangeCategory(marketMaterial) !== category) marketMaterial = exchangeProducts.find(entry => entry.category === category)!.id;
      renderMenu();
      return;
    }
    if (button.dataset.marketMaterial || button.dataset.marketFrame) {
      if (button.dataset.marketMaterial) marketMaterial = button.dataset.marketMaterial;
      if (button.dataset.marketFrame) marketFrame = button.dataset.marketFrame;
      renderMenu();
      return;
    }
    if (button.dataset.buyMaterial) {
      if (gameDialogPending()) return;
      const product = exchangeProduct(button.dataset.buyMaterial);
      const quantity = Number(button.dataset.quantity);
      if (!isExchangeQuantity(quantity)) throw new Error('Choose a valid material quantity.');
      const name = materialName(product.materialId);
      const cost = (product.price * quantity).toLocaleString('en-US');
      if (product.category === 'event' && !eventMaterialWarningHidden(gameStorage)) {
        const choice = await gameChoose(eventMaterialWarning(product, quantity), [
          { value: 'hide', label: 'Do not show again' }, { value: 'back', label: 'Back' },
          { value: 'purchase', label: 'Purchase', primary: true },
        ] as const, 'back', { title: 'Event materials only' });
        if (choice === 'hide') {
          hideEventMaterialWarning(gameStorage);
          showError('Event material warnings hidden. Nothing was purchased.');
          return;
        }
        if (choice !== 'purchase') return;
      } else if (!await gameConfirm(`Buy ${quantity} ${name} for ${cost} Prismatica?`, { title: 'Material Exchange', confirmLabel: 'Buy materials' })) return;
      if (playMode === 'online') await performOnline({ kind: 'purchaseMaterial', element: product.id, quantity });
      else account = purchaseExchangeMaterial(gameStorage, product.id, quantity);
      renderMenu();
      showError(`${quantity} ${name} purchased and saved.`);
      return;
    }
    if (playMode !== 'online' || !playerProfile) throw new Error('Profile frames are an online profile feature. Sign in to an online account to buy or equip them.');
    if (button.hasAttribute('data-online-signout')) {
      if (onlineBusy || onlinePending) throw new Error('Finish or retry the pending operation before signing out.');
      const { error } = await onlineClient().auth.signOut();
      if (error) throw new Error('Sign-out failed. Please retry.');
      battleView?.destroy();
      battleView = null;
      battleSession = null;
      onlineWallet = null;
      playerProfile = null;
      playMode = 'legacy';
      journey.profile = null;
      journey.screen = 'title';
      menuHistory.clear();
      resetConduitLoadoutView();
      render();
      return;
    }
    const frame = button.dataset.buyFrame ?? button.dataset.equipFrame;
    if (frame !== 'default' && frame !== 'thin-outline' && frame !== 'double-outline' && frame !== 'corner-brackets') throw new Error('Unknown profile frame.');
    if (button.dataset.buyFrame) {
      if (!await gameConfirm('Permanently unlock this profile frame for 10 Null-Prismatica? It has no gameplay effects.', { title: 'Cosmetic Store', confirmLabel: 'Buy frame' })) return;
      await performOnline({ kind: 'purchaseFrame', frame });
    } else {
      const icon = playerProfile.icon;
      if (icon !== 'neutral' && !isStarterId(icon) && !isProfilePictureId(icon)) throw new Error('Invalid saved profile picture.');
      await performOnline({ kind: 'updateProfile', displayName: playerProfile.displayName, bio: playerProfile.bio, icon, frame });
    }
    renderMenu();
    showError(button.dataset.buyFrame ? 'Profile frame purchased and saved. Equip it at any time.' : 'Profile frame equipped.');
  } catch (error) {
    console.error('Online store or profile operation failed', error);
    showError(errorMessage(error));
  }
});

app.addEventListener('click', async event => {
  if (!(event.target instanceof Element)) return;
  const tab = event.target.closest<HTMLButtonElement>('[data-social-tab]');
  const button = event.target.closest<HTMLButtonElement>('[data-friend-action]');
  const refresh = event.target.closest<HTMLButtonElement>('[data-refresh-social]');
  if (refresh) {
    try {
      if (playMode !== 'online') throw new Error('Sign in to refresh friends.');
      await performOnline({ kind: 'read' });
      renderMenu();
      app.querySelector('#online-friend-result')!.textContent = 'Friend list refreshed.';
    } catch (error) {
      console.error('Friend list refresh failed', error);
      showError(errorMessage(error));
    }
    return;
  }
  if (tab) {
    const category = tab.dataset.socialTab;
    if (category !== 'incoming' && category !== 'outgoing') {
      showError('Unknown friend list.');
      return;
    }
    friendRequestTab = category;
    app.querySelectorAll<HTMLButtonElement>('[data-social-tab]').forEach(item => item.setAttribute('aria-pressed', String(item === tab)));
    app.querySelectorAll<HTMLElement>('[data-social-panel]').forEach(panel => { panel.hidden = panel.dataset.socialPanel !== category; });
  }
  if (!button || button.disabled) return;
  try {
    if (playMode !== 'online') throw new Error('Sign in to manage friends.');
    const kind = button.dataset.friendAction;
    const userId = button.dataset.userId;
    if (!userId || (kind !== 'acceptFriendRequest' && kind !== 'declineFriendRequest' && kind !== 'cancelFriendRequest' && kind !== 'removeFriend')) throw new Error('Invalid friend action.');
    if (kind === 'removeFriend' && !await gameConfirm('Remove this friend? They can send a new request later.', { title: 'Remove friend', confirmLabel: 'Remove', danger: true })) return;
    await performOnline({ kind, userId });
    if (kind === 'removeFriend' && viewedFriend) { viewedFriend = null; profileTab = 'friends'; }
    renderMenu();
    app.querySelector('#online-friend-result')!.textContent = kind === 'acceptFriendRequest' ? 'Friend request accepted.' : kind === 'declineFriendRequest' ? 'Friend request declined.' : kind === 'cancelFriendRequest' ? 'Friend request cancelled.' : 'Friend removed.';
  } catch (error) {
    console.error('Friend operation failed', error);
    showError(errorMessage(error));
  }
});

app.addEventListener('submit', async event => {
  if (!(event.target instanceof HTMLFormElement) || event.target.id !== 'online-friend-form') return;
  event.preventDefault();
  try {
    if (playMode !== 'online') throw new Error('Sign in to add friends.');
    const identity = String(new FormData(event.target).get('username') ?? '').trim();
    await performOnline(/^LL-[0-9A-F]{4}-[0-9A-F]{4}$/i.test(identity)
      ? { kind: 'friendRequest', friendCode: identity.toUpperCase() }
      : { kind: 'friendRequest', username: identity });
    renderMenu();
    app.querySelector('#online-friend-result')!.textContent = 'Friend request sent.';
  } catch (error) {
    console.error('Friend request failed', error);
    showError(errorMessage(error));
  }
});

app.addEventListener('click', async (event) => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest<HTMLButtonElement>('[data-upgrade]');
  if (!button || button.disabled || menuPage !== 'team' || characterCategory !== 'bearers') return;
  let saved = false;
  try {
    if (!journey.profile || !account) throw new Error('Character progression is unavailable.');
    const kind = button.dataset.upgrade;
    if (kind !== 'level' && kind !== 'evolve') throw new Error('Unknown or unavailable character upgrade.');
    const starter = getStarter(selectedCharacter ?? journey.profile.starterId);
    const expected = ownedProgress(account, starter.id);
    const cost = kind === 'level' ? characterLevelCost(starter.id, expected) : characterEvolutionCost(starter.id, expected);
    const materials = Object.entries(cost.materials).map(([id, amount]) => `${amount} [${materialName(id)}]`).join(', ');
    const fodderIds = Array.from(app.querySelectorAll<HTMLInputElement>('[data-evolution-fodder]:checked')).map((input) => input.dataset.evolutionFodder ?? '');
    const options = fodderIds.length ? evolutionFodderOptions(account, starter.elementId, expected.evolution, starter.id) : [];
    const consumed = fodderIds.map((id) => {
      const option = options.find((entry) => entry.copy.instanceId === id);
      if (!option) throw new Error('Selected captured Elemental-Devourer is missing.');
      return `[${option.creature.name}] · Lv.${option.copy.level ?? capturedProgress(option.copy).level}`;
    });
    if (!await gameConfirm(`${kind === 'level' ? 'Level up' : 'Evolve'} [${characterName(starter.id, expected.evolution)}] for ${cost.fractalis} [Prismatica] and ${materials}?${consumed.length ? `\n\nThese Elemental-Devourers will be permanently consumed:\n${consumed.join('\n')}\n\nThis cannot be undone.` : ''}`, { title: kind === 'level' ? 'Level up' : 'Evolution', confirmLabel: kind === 'level' ? 'Level up' : 'Evolve', danger: consumed.length > 0 })) return;
    const currency = app.querySelector('#fractalis-balance');
    const premium = app.querySelector('#lycalis-balance');
    if (!currency || !premium) throw new Error('Currency display is missing.');
    const before = structuredClone(currentAccount());
    account = playMode === 'online'
      ? (await performOnline({ kind: 'upgradeCharacter', id: starter.id, upgradeKind: kind, expected, fodderIds })).account
      : upgradeCharacter(gameStorage, starter.id, kind, expected, fodderIds);
    saved = true;
    const updatedAccount = account;
    fractalis = account.fractalis;
    updateCharacterTab(app, starter, characterTab, account);
    const progress = ownedProgress(account, starter.id);
    const rosterButton = app.querySelector(`[data-owned-character="${starter.id}"]`);
    const rosterLevel = rosterButton?.querySelector('span > small');
    const rosterName = rosterButton?.querySelector('span > strong');
    if (rosterName) rosterName.textContent = characterName(starter.id, progress.evolution);
    if (rosterLevel) rosterLevel.textContent = `Lv.${progress.level} · Evo.${progress.evolution}`;
    const rosterPortrait = rosterButton?.querySelector('img');
    if (rosterPortrait) {
      const art = portraitAttributes(starter, progress.evolution);
      rosterPortrait.src = art.src;
      rosterPortrait.alt = art.alt;
      const facing = characterFacing(starter.id, progress.evolution);
      rosterPortrait.dataset.facing = facing.facing;
      rosterPortrait.dataset.mirrored = String(facing.mirrored);
    }
    currency.textContent = String(account.fractalis);
    premium.textContent = String(account.lycalis);
    if (fodderIds.length) renderMenu();
    celebrateUpgrade(app, starter, kind, ownedProgress(updatedAccount, starter.id));
    const result = app.querySelector('#upgrade-result');
    if (result) result.textContent = `${characterName(starter.id, progress.evolution)} ${kind === 'level' ? 'leveled up' : 'evolved'}.`;
    else showError(`${characterName(starter.id, progress.evolution)} ${kind === 'level' ? 'leveled up' : 'evolved'}.`);
    await presentUpgrade(before, updatedAccount, starter.id, kind);
  } catch (error) {
    console.error('Character upgrade rejected', error);
    showError(`${saved ? 'Upgrade is saved, but its presentation could not complete.' : 'Upgrade was not completed.'} ${errorMessage(error)}`);
  }
});

app.addEventListener('change', (event) => {
  if (!(event.target instanceof HTMLInputElement) || !event.target.matches('[data-evolution-fodder]')) return;
  try {
    updateEvolutionSelection(app);
  } catch (error) {
    console.error('Evolution selection unavailable', error);
    showError('Evolution selection unavailable. Reopen the evolution screen.');
  }
});

app.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest<HTMLButtonElement>('[data-summon-banner]');
  if (!button || menuPage !== 'summon') return;
  try {
    const id = button.dataset.summonBanner;
    if (!isSummonBannerId(id)) throw new Error('Unknown summon banner.');
    if (id === selectedBanner) return;
    selectedBanner = id;
    renderMenu();
    app.querySelector<HTMLButtonElement>(`[data-summon-banner="${id}"]`)?.focus({ preventScroll: true });
  } catch (error) {
    console.error('Banner selection failed', error);
    showError(errorMessage(error));
  }
});

app.addEventListener('click', async (event) => {
  if (!(event.target instanceof Element)) return;
  const category = event.target.closest<HTMLButtonElement>('[data-character-category]');
  const capture = event.target.closest<HTMLButtonElement>('[data-owned-capture]');
  const max = event.target.closest<HTMLButtonElement>('[data-max-level]');
  const confirmMax = event.target.closest<HTMLButtonElement>('[data-confirm-max-level]');
  const fodderPage = event.target.closest<HTMLButtonElement>('[data-fodder-page]');
  if (!category && !capture && !max && !confirmMax && !fodderPage) return;
  let saved = false;
  try {
    if (fodderPage) {
      changeEvolutionPage(app, Number(fodderPage.dataset.fodderPage));
    } else if (category) {
      const value = category.dataset.characterCategory;
      if (value !== 'squad' && value !== 'bearers' && value !== 'creatures') throw new Error('Unknown Team area.');
      characterCategory = value;
      renderMenu();
      app.querySelector<HTMLButtonElement>(`[data-character-category="${value}"]`)?.focus({ preventScroll: true });
    } else if (capture) {
      const id = capture.dataset.ownedCapture;
      if (!id || !currentAccount().capturedCharacters?.some((copy) => copy.instanceId === id)) throw new Error('Choose an owned captured Elemental-Devourer.');
      selectedCapture = id;
      renderMenu();
      app.querySelector<HTMLButtonElement>(`[data-owned-capture="${id}"]`)?.focus({ preventScroll: true });
    } else if (max) {
      const id = max.dataset.maxLevel;
      if (!id) throw new Error('Character selection is missing.');
      const preview = maxLevelPreview(currentAccount(), id);
      const dialog = app.querySelector<HTMLDialogElement>('#max-level-dialog');
      const content = dialog?.querySelector('[data-max-level-content]');
      if (!dialog || !content) throw new Error('Max Level panel is missing.');
      pendingMaxLevel = preview.plan;
      content.innerHTML = preview.html;
      const error = dialog.querySelector('[data-max-level-error]');
      if (error) error.textContent = '';
      max.focus({ preventScroll: true });
      dialog.showModal();
    } else if (confirmMax) {
      if (!pendingMaxLevel) throw new Error('Reopen Max Level to calculate the current cost.');
      const id = pendingMaxLevel.id;
      const dialog = app.querySelector<HTMLDialogElement>('#max-level-dialog');
      const currency = app.querySelector('#fractalis-balance');
      if (!dialog || !currency) throw new Error('Max Level controls are missing.');
      const before = structuredClone(currentAccount());
      account = playMode === 'online' ? (await performOnline({ kind: 'levelMax', id, expected: pendingMaxLevel })).account : levelCharacterToMaximum(gameStorage, pendingMaxLevel);
      saved = true;
      const after = account;
      fractalis = account.fractalis;
      pendingMaxLevel = null;
      dialog.close();
      if (isStarterId(id)) {
        const starter = getStarter(id);
        updateCharacterTab(app, starter, characterTab, account);
        const progress = ownedProgress(account, id);
        const label = app.querySelector(`[data-owned-character="${id}"] span > small`);
        if (label) label.textContent = `Lv.${progress.level} · Evo.${progress.evolution}`;
        currency.textContent = String(account.fractalis);
        celebrateUpgrade(app, starter, 'level', progress);
      } else renderMenu();
      app.querySelector<HTMLButtonElement>(`[data-max-level="${id}"]`)?.focus({ preventScroll: true });
      const result = app.querySelector('#upgrade-result') ?? app.querySelector('#character-lock-result');
      if (result) result.textContent = 'Leveling complete.';
      await presentUpgrade(before, after, id, 'level');
    }
  } catch (error) {
    console.error('Character management failed', error);
    const status = app.querySelector('[data-max-level-error]');
    if (status && app.querySelector('#max-level-dialog[open]')) status.textContent = errorMessage(error);
    else showError(`${saved ? 'Leveling is saved, but its presentation could not complete. ' : ''}${errorMessage(error)}`);
  }
});

app.addEventListener('click', async (event) => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest<HTMLElement>('[data-page="conduit-store"], [data-page="conduit-upgrade"]');
  if (!button) return;
  try {
    const destination = button.dataset.page;
    if (destination !== 'conduit-store' && destination !== 'conduit-upgrade') throw new Error('Unknown Conduit menu.');
    const target = button.dataset.upgradeTarget;
    if (target !== undefined && !isConduitId(target)) throw new Error('Unknown Conduit selection.');
    if (menuPage === destination) return;
    await transitionActivity(() => {
      if (target) upgradeConduitSelection = target;
      visitMenu(destination);
      if (destination === 'conduit-store') storeRarity = button.hasAttribute('data-market-calamitic') ? 'Calamitic' : '';
      renderMenu();
    });

  } catch (error) {
    console.error('Conduit menu navigation failed', error);
    showError(errorMessage(error));
  }
});

/** Refreshes the open Conduit loadout in place; falls back to a full render only when no loadout is on screen. */
function refreshLoadout(owner: string): void {
  if (account) {
    const starter = isStarterId(owner);
    const copy = starter ? undefined : account.capturedCharacters?.find(entry => entry.instanceId === owner);
    const creature = copy ? getCreature(copy.creatureId) : undefined;
    const name = starter ? characterName(owner, ownedProgress(account, owner).evolution) : creature?.name ?? '';
    const element = starter ? getStarter(owner).elementId : creature?.element;
    if (element && refreshConduitLoadout(app, owner, name, element, account)) return;
  }
  if (isStarterId(owner)) updateCharacterTab(app, getStarter(owner), 'equipment', account);
  else renderMenu();
}

app.addEventListener('change', async (event) => {
  if (!(event.target instanceof HTMLSelectElement) || !event.target.matches('[data-capture-conduit]')) return;
  const select = event.target;
  const id = select.dataset.captureConduit;
  try {
    if (!id || (select.value && !isConduitId(select.value))) throw new Error('Invalid captured equipment selection.');
    const conduit = isConduitId(select.value) ? select.value : null;
    const slot = Number(select.dataset.captureSlot);
    account = playMode === 'online' ? (await performOnline({ kind: 'equipConduit', character: id, slot, conduit })).account : equipConduit(gameStorage, id, slot, conduit);
    refreshLoadout(id);
    if (conduit) {
      const target = app.querySelector<HTMLElement>(`[data-loadout-slot="${slot}"]`) ?? app.querySelector<HTMLElement>('.captured-equipment');
      if (target) rarityFeedback(target, getConduit(conduit).rarity, 'Conduit equipped');
    }
  } catch (error) {
    console.error('Captured equipment rejected', error);
    if (id) refreshLoadout(id); else renderMenu();
    showError(`Conduits were not changed. ${errorMessage(error)}`);
  }
});

app.addEventListener('change', async (event) => {
  if (!(event.target instanceof HTMLSelectElement) || !event.target.matches('[data-conduit-slot]')) return;
  try {
    if (menuPage !== 'team' || characterCategory !== 'bearers' || !selectedCharacter) throw new Error('Choose an owned character before equipping.');
    const control = event.target;
    const id = control.value === '' ? null : control.value;
    if (id !== null && !isConduitId(id)) throw new Error('Unknown Conduit.');
    const slot = Number(control.dataset.conduitSlot);
    account = playMode === 'online' ? (await performOnline({ kind: 'equipConduit', character: selectedCharacter, slot, conduit: id })).account : equipConduit(gameStorage, selectedCharacter, slot, id);
    refreshLoadout(selectedCharacter);
    if (id && isConduitId(id)) {
      const target = app.querySelector<HTMLElement>(`[data-loadout-slot="${slot}"]`) ?? app.querySelector<HTMLElement>('.conduit-loadout');
      if (target) rarityFeedback(target, getConduit(id).rarity, 'Conduit equipped');
    }
    const status = app.querySelector('#conduit-equipment-result');
    if (!status) throw new Error('Conduit equipment status is missing.');
    status.textContent = `${id === null ? 'Conduit removed' : `${getConduit(id).name} equipped`}.`;
    app.querySelector<HTMLSelectElement>(`[data-conduit-slot="${control.dataset.conduitSlot}"]`)?.focus({ preventScroll: true });
  } catch (error) {
    console.error('Conduit equipment rejected', error);
    if (account && selectedCharacter) refreshLoadout(selectedCharacter);
    showError(`Equipment was not changed. ${errorMessage(error)}`);
  }
});

app.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest<HTMLButtonElement>('[data-open-loadout]');
  if (!button || button.disabled) return;
  void openConduitPage();
});

app.addEventListener('input', (event) => {
  if (!(event.target instanceof HTMLInputElement) || !event.target.matches('[data-loadout-search]')) return;
  conduitSearch = event.target.value;
  applyConduitSearch(app, conduitSearch);
});

/** Opens the dedicated full-page Conduit loadout for the selected Element-Bearer or captured copy. */
async function openConduitPage(): Promise<void> {
  if (activityTransitionPending()) return;
  try {
    await transitionActivity(() => {
      if (menuPage !== 'team') visitMenu('team');
      teamView = teamView === 'capture' || teamView === 'capture-conduits' ? 'capture-conduits' : 'conduits';
      characterTab = 'overview';
      renderMenu();
    });
    app.querySelector<HTMLElement>('.loadout-back')?.focus({ preventScroll: true });
  } catch (error) {
    console.error('Conduit loadout navigation failed', error);
    showError(errorMessage(error));
  }
}

app.addEventListener('click', async (event) => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest<HTMLButtonElement>('[data-loadout-equip], [data-loadout-unequip], [data-loadout-clear]');
  if (!button || button.disabled || onlineBusy) return;
  const owner = button.dataset.loadoutOwner ?? '';
  const starter = isStarterId(owner);
  try {
    if (menuPage !== 'team' || (starter ? owner !== selectedCharacter : owner !== selectedCapture)) throw new Error('Choose an owned character before equipping.');
    if (button.hasAttribute('data-loadout-clear')) {
      account = playMode === 'online' ? (await performOnline({ kind: 'unequipAllConduits', character: owner })).account
        : unequipAllConduits(gameStorage, owner);
      refreshLoadout(owner);
      const status = app.querySelector('#conduit-equipment-result');
      if (status) status.textContent = `All Conduits${starter ? ', including the Master,' : ''} unequipped. Owned Conduits and upgrades are unchanged.`;
      app.querySelector<HTMLElement>('.loadout-back')?.focus({ preventScroll: true });
      return;
    }
    const equip = button.dataset.loadoutEquip;
    if (equip !== undefined && !isConduitId(equip)) throw new Error('Unknown Conduit.');
    const slot = Number(equip !== undefined ? button.dataset.loadoutTarget : button.dataset.loadoutUnequip);
    if (!Number.isInteger(slot) || slot < 0) throw new Error('No empty Conduit slot is available.');
    const conduit = equip ?? null;
    account = playMode === 'online' ? (await performOnline({ kind: 'equipConduit', character: owner, slot, conduit })).account : equipConduit(gameStorage, owner, slot, conduit);
    refreshLoadout(owner);
    const status = app.querySelector('#conduit-equipment-result');
    if (status) status.textContent = conduit ? `${getConduit(conduit).name} equipped in slot ${slot + 1}.` : `Slot ${slot + 1} cleared.`;
    if (conduit && isConduitId(conduit)) {
      const target = app.querySelector<HTMLElement>(`[data-loadout-slot="${slot}"]`);
      if (target) rarityFeedback(target, getConduit(conduit).rarity, 'Conduit equipped');
    }
    app.querySelector<HTMLElement>(`[data-loadout-slot="${slot}"]`)?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
  } catch (error) {
    console.error('Conduit loadout change rejected', error);
    if (account && (!starter || owner === selectedCharacter)) refreshLoadout(owner);
    showError(`Equipment was not changed. ${errorMessage(error)}`);
  }
});

if (import.meta.env.DEV) bindDebugPhrase(document, () =>
  !gameStorage.active && !onlineBusy && !onlinePending && !playerInfoOpen &&
  (journey.screen !== 'menu' || menuPage !== 'battle') &&
  !document.querySelector('dialog[open]') && !gameDialogPending() && !activityTransitionPending(), () => {
    try {
      gameStorage.activate();
      battleView?.destroy();
      battleView = null;
      battleSession = null;
      menuHistory.clear();
      resetConduitLoadoutView();
      journey.screen = 'title';
      journey.profile = null;
      journey.selected = null;
      selectedCharacter = 'ember';
      selectedCapture = undefined;
      characterTab = 'overview';
      characterCategory = 'bearers';
      teamView = 'detail';
      menuPage = 'home';
      enter();
      showError('Debug profile active. All gameplay content is unlocked in memory only. Exit debug or reload to return to your real saves.');
    } catch (error) {
      console.error('Debug profile activation failed', error);
      showError(`Could not activate the test profile. ${errorMessage(error)}`);
    }
  });

app.addEventListener('click', event => {
  if (event.target instanceof Element && event.target.closest('[data-exit-debug]') && gameStorage.active) window.location.reload();
});

document.addEventListener('keydown', (event) => {
  if (event.defaultPrevented) return;
  if (document.querySelector('#online-account[open]')) return;
  if (event.target instanceof HTMLElement && event.target.closest('#online-account-open')) return;
  if (gameDialogPending()) return;
  if (journey.screen !== 'title' || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.target instanceof HTMLElement && event.target.closest('button, input, textarea, select')) return;
  if (['Tab', 'Shift', 'Control', 'Alt', 'Meta', 'Escape'].includes(event.key)) return;
  if (app.querySelector<HTMLElement>('#save-recovery:not([hidden])')) return;
  event.preventDefault();
  openOnlineAccount(enterOnline);
});

window.addEventListener('pagehide', () => {
  stopAutosave?.();
  stopAutosave = null;
  autosaveIdentity = null;
  document.querySelector('.autosave-notice')?.remove();
});
window.addEventListener('pageshow', syncAutosave);
render();
if (new URLSearchParams(location.hash.slice(1)).get('type') === 'recovery') openOnlineAccount();
else if (!gameStorage.active && import.meta.env.VITE_SUPABASE_URL) {
  void onlineUsername().then(async user => {
    if (user && journey.screen === 'title' && !gameStorage.active) await enterOnline();
  }).catch(error => { console.error('Online session restoration failed', error); showError(errorMessage(error)); });
}
if (settingsError) showError(settingsError);
if (musicSettingsError) showError(musicSettingsError);
if (hotkeyError) showError([settingsError, hotkeyError].filter(Boolean).join(' '));
if (speedError) showError([settingsError, hotkeyError, speedError].filter(Boolean).join(' '));
