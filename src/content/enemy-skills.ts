export interface EnemySkill {
  name: string;
  multiplier: number;
  every: number;
  action: 'skill1' | 'skill2' | 'ultimate';
}

export function enemySkills(level: number, boss: boolean, strike: string, multiplier: number): EnemySkill[] {
  if (!Number.isInteger(level) || level < 1 || !strike.trim() || !Number.isFinite(multiplier) || multiplier < 1) {
    throw new Error('Enemy skills require a valid level, name and damage multiplier.');
  }
  const first: EnemySkill = { name: strike, multiplier, every: boss ? 2 : 3, action: 'skill1' };
  if (level < 50) return [first];
  return [first, { name: boss ? `Last Ruin: ${strike}` : `Overdrive: ${strike}`,
    multiplier: boss ? Math.max(2.6, multiplier * 1.65) : multiplier * 1.25,
    every: boss ? 6 : 5, action: boss ? 'ultimate' : 'skill2' }];
}

export function scheduledEnemySkill(skills: readonly EnemySkill[], round: number): EnemySkill | undefined {
  if (!Number.isInteger(round) || round < 1) throw new Error('Enemy skill schedule requires a valid turn.');
  return skills.find((skill) => skill.action === 'ultimate' && round % skill.every === 0)
    ?? skills.find((skill) => skill.action === 'skill2' && round % skill.every === 0)
    ?? skills.find((skill) => round % skill.every === 0);
}
