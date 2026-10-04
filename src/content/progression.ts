export const currencies = [
  { id: 'fractalis', name: 'Fractalis', role: 'Main currency' },
  { id: 'lycalis', name: 'Lycalis', role: 'Premium currency' },
] as const;

export const artifactSlots = Array.from({ length: 8 }, (_, index) => index + 1);
export const fractureRules = {
  sourceTier: 1,
  destinationTier: 2,
  levelCap: 30,
  resetLevel: 0,
  lycalisReward: 10,
} as const;
export const upgradePaths = [
  { name: 'Fracture / Evolution', detail: `At level ${fractureRules.levelCap}, Fracture from Tier ${fractureRules.sourceTier} into Tier ${fractureRules.destinationTier}. Reset to level ${fractureRules.resetLevel}, gain major stat improvements, and receive +${fractureRules.lycalisReward} Lycalis. Exact stat bonuses and materials are pending.` },
  { name: 'Character level', detail: `Level up to ${fractureRules.levelCap} in Tier ${fractureRules.sourceTier}. After Fracturing, level from ${fractureRules.resetLevel} to ${fractureRules.levelCap} again in Tier ${fractureRules.destinationTier} using different resources. Materials and costs are coming later.` },
  { name: 'Weapon upgrade', detail: 'Improve the character\'s weapon.' },
  { name: 'Unique passive', detail: 'Upgrade the character\'s unique passive ability.' },
  { name: 'Ability 1', detail: 'Upgrade the first active ability.' },
  { name: 'Ability 2', detail: 'Upgrade the second active ability.' },
  { name: 'Last Flare', detail: 'Upgrade the ultimate. Naming format: Last Flare: <character-specific name>.' },
] as const;
