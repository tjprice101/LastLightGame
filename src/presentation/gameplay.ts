import { elements, elementalDungeonRules, elementalEnemyLevel, infusionModes, materialRarities } from '../content/activities';

export function gameplayHub(): string {
  return `<div class="hub-heading"><p class="eyebrow">CHOOSE YOUR ACTIVITY</p><h1 tabindex="-1">Gameplay</h1></div>
    <nav class="activity-categories" aria-label="Activity types">
      <a href="#gameplay-adventure">Adventure</a><a href="#gameplay-dungeons">Elemental dungeons</a>
      <a href="#gameplay-infusion">Evolution infusion</a><a href="#gameplay-story">Story</a><a href="#gameplay-events">Events</a>
    </nav>
    <section class="activity-group" id="gameplay-adventure"><h2>Adventure</h2>
      <article class="activity-card"><h3>Adventure / Grassy Field</h3>
        <p>Endless solo waves with your saved companion. Each entry begins at wave 1.</p>
        <p>Defeated enemies drop 5-10 Fractalis. Enemy level, health, attack and defense grow each wave.</p>
        <button class="primary-button" data-page="battle">Start Adventure</button></article></section>
    <section class="activity-group" id="gameplay-dungeons"><h2>Elemental material dungeons</h2>
      <p>Each dungeon has ${elementalDungeonRules.stages} stages. Enemies start at level 10, grow linearly to
        level ${elementalEnemyLevel(45)} at Stage 45, and stay level 100 through Stage 50.</p>
      <p>Materials: ${materialRarities.join(' / ')}. Stronger enemies unlock higher-rarity rewards;
        higher rarities remain less likely. Drop rates, unlock stages and quantities are not defined yet.</p>
      <div class="activity-grid">${elements.map((element) => `<article class="activity-card">
        <p class="eyebrow">${element.name} / ${element.affinity}</p><h3>${element.dungeon}</h3>
        <p>50 stages / Enemy levels 10-100 / ${element.name} materials</p>
        <p>Wave-end reports and chance-based enemy captures are planned, not implemented.</p>
        <button disabled>Dungeon not playable yet</button></article>`).join('')}</div></section>
    <section class="activity-group" id="gameplay-infusion"><h2>Evolution infusion</h2>
      <p>Special infusable enemies supplement Fractalis and the character's own elemental materials.
        Infusion enemies are not automatically captured team fodder.</p>
      <div class="activity-grid">${infusionModes.map((mode) => `<article class="activity-card">
        <p class="eyebrow">${mode.energy} ENERGY</p><h3>${mode.name}</h3>
        <p>${mode.stages} stages / Starts at enemy level ${mode.startingLevel} / ${mode.enemyTiers} enemy tiers</p>
        <p>${mode.enemyTheme}; approximately ${mode.uniqueEnemies.minimum}-${mode.uniqueEnemies.maximum} unique enemy designs.</p>
        <p>For: ${elements.filter((element) => element.infusion === mode.id).map((element) => element.name).join(', ')}.</p>
        <p>Later levels, encounters, acquisition rates and infusion costs remain undefined.</p>
        <button disabled>Infusion mode not playable yet</button></article>`).join('')}</div></section>
    <section class="activity-group" id="gameplay-story"><h2>Story</h2><article class="activity-card">
      <h3>Opening prologue</h3><p>Your saved companion's lore. Readable story only; no battles or rewards yet.</p>
      <button data-page="story">Read opening story</button></article></section>
    <section class="activity-group" id="gameplay-events"><h2>Events</h2><article class="activity-card">
      <h3>Limited-time activities</h3><p>No active events, timers or rewards.</p>
      <button data-page="events">View Events</button></article></section>`;
}
