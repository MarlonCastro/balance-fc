import type { Player, Team } from '../types';

export type BalancingAlgorithm = 'greedy' | 'optimal';

interface BalancingWeights {
  skillRating: number;
  speed: number;
  physicalCondition: number; // Renamed from weight
}

const DEFAULT_WEIGHTS: BalancingWeights = {
  skillRating: 0.5,
  speed: 0.3,
  physicalCondition: 0.2,
};

/**
 * Calculates the overall skill of a player based on weighted attributes
 */
export function calculateOverallSkill(
  player: Player,
  weights: BalancingWeights = DEFAULT_WEIGHTS
): number {
  const skillRating = player.skillRating || 0;
  const speed = player.speed || 0;
  // Support both old weight and new physicalCondition for backward compatibility
  const physicalCondition = player.physicalCondition ?? (player as any).weight ?? 0;

  // Normalize values to 0-5 scale (changed from 0-10)
  const normalizedSkill = Math.min(5, Math.max(0, skillRating));
  const normalizedSpeed = Math.min(5, Math.max(0, speed));
  const normalizedPhysicalCondition = Math.min(5, Math.max(0, physicalCondition));

  // Calculate weighted average
  const totalWeight = weights.skillRating + weights.speed + weights.physicalCondition;
  const weightedSum =
    normalizedSkill * weights.skillRating +
    normalizedSpeed * weights.speed +
    normalizedPhysicalCondition * weights.physicalCondition;

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

/**
 * Check if two team distributions are similar (same players in same teams)
 */
function areTeamsSimilar(teams1: Team[], teams2: Team[]): boolean {
  if (teams1.length !== teams2.length) return false;

  // Check if each team has the same players
  for (let i = 0; i < teams1.length; i++) {
    const team1PlayerIds = new Set(teams1[i].players.map(p => p.id).sort());
    const team2PlayerIds = new Set(teams2[i].players.map(p => p.id).sort());
    
    if (team1PlayerIds.size !== team2PlayerIds.size) return false;
    
    for (const id of team1PlayerIds) {
      if (!team2PlayerIds.has(id)) return false;
    }
  }

  return true;
}

/**
 * Greedy Algorithm: Distributes players one by one to the team with lower total skill
 * Simple and fast, but may not produce optimal results
 * Now includes randomization to avoid repetitions
 */
export function balanceTeamsGreedy(
  players: Player[],
  numberOfTeams: number = 2,
  weights?: BalancingWeights,
  previousTeams?: Team[]
): Team[] {
  if (players.length < numberOfTeams) {
    throw new Error(`É necessário pelo menos ${numberOfTeams} jogadores para formar ${numberOfTeams} times`);
  }

  // Calculate overall skill for each player
  const playersWithSkill = players.map((player) => ({
    player,
    skill: calculateOverallSkill(player, weights),
  }));

  // Try multiple times to avoid repetition
  const maxAttempts = previousTeams ? 50 : 1;
  let bestTeams: Team[] | null = null;
  let bestDifference = Infinity;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Add randomization: shuffle players with similar skills
    const shuffled = [...playersWithSkill];
    
    // Group players by skill level and shuffle within groups
    const skillGroups: { [key: string]: typeof playersWithSkill } = {};
    shuffled.forEach(p => {
      const skillLevel = Math.floor(p.skill * 2) / 2; // Round to 0.5
      const key = skillLevel.toString();
      if (!skillGroups[key]) skillGroups[key] = [];
      skillGroups[key].push(p);
    });

    // Shuffle within each skill group
    const randomized: typeof playersWithSkill = [];
    Object.values(skillGroups).forEach(group => {
      const shuffledGroup = group.sort(() => Math.random() - 0.5);
      randomized.push(...shuffledGroup);
    });

    // Sort by skill but allow some randomness for similar skills
    randomized.sort((a, b) => {
      const diff = b.skill - a.skill;
      // If skills are very similar (within 0.3), randomize order
      if (Math.abs(diff) < 0.3) {
        return Math.random() - 0.5;
      }
      return diff;
    });

    // Initialize teams
    const teams: Team[] = Array.from({ length: numberOfTeams }, () => ({
      players: [],
      totalSkills: 0,
    }));

    // Distribute players greedily
    for (const { player, skill } of randomized) {
      // Find team with lowest total skill
      // If multiple teams have same total, randomly choose one
      const teamsWithMinTotal = teams
        .map((team, index) => ({ team, index, total: team.totalSkills }))
        .sort((a, b) => a.total - b.total);
      
      const minTotal = teamsWithMinTotal[0].total;
      const candidates = teamsWithMinTotal.filter(t => t.total === minTotal);
      
      // If multiple teams have same total, randomly choose one
      const selectedTeam = candidates.length > 1 
        ? candidates[Math.floor(Math.random() * candidates.length)]
        : candidates[0];

      teams[selectedTeam.index].players.push(player);
      teams[selectedTeam.index].totalSkills += skill;
    }

    // Check if this distribution is different from previous
    if (previousTeams && areTeamsSimilar(teams, previousTeams)) {
      continue; // Try again
    }

    // Calculate difference for this distribution
    const totals = teams.map(t => t.totalSkills);
    const max = Math.max(...totals);
    const min = Math.min(...totals);
    const avg = totals.reduce((sum, t) => sum + t, 0) / totals.length;
    const difference = avg > 0 ? ((max - min) / avg) * 100 : 0;

    // Keep the best balanced distribution that's different
    if (difference < bestDifference) {
      bestDifference = difference;
      bestTeams = teams;
    }

    // If we found a different distribution and it's reasonably balanced, use it
    if (!previousTeams || !areTeamsSimilar(teams, previousTeams)) {
      if (difference < 20) { // Good enough balance
        return teams;
      }
    }
  }

  // Return best found or fallback
  return bestTeams || (() => {
    // Fallback: simple greedy without randomization
    const sorted = [...playersWithSkill].sort((a, b) => b.skill - a.skill);
    const fallbackTeams: Team[] = Array.from({ length: numberOfTeams }, () => ({
      players: [],
      totalSkills: 0,
    }));

    for (const { player, skill } of sorted) {
      let minTeamIndex = 0;
      let minTotal = fallbackTeams[0].totalSkills;
      for (let i = 1; i < fallbackTeams.length; i++) {
        if (fallbackTeams[i].totalSkills < minTotal) {
          minTotal = fallbackTeams[i].totalSkills;
          minTeamIndex = i;
        }
      }
      fallbackTeams[minTeamIndex].players.push(player);
      fallbackTeams[minTeamIndex].totalSkills += skill;
    }
    return fallbackTeams;
  })();
}

/**
 * Optimal Algorithm: Tries multiple combinations to find the best balance
 * More computationally expensive but produces better results
 */
export function balanceTeamsOptimal(
  players: Player[],
  numberOfTeams: number = 2,
  weights?: BalancingWeights,
  previousTeams?: Team[]
): Team[] {
  if (players.length < numberOfTeams) {
    throw new Error(`É necessário pelo menos ${numberOfTeams} jogadores para formar ${numberOfTeams} times`);
  }

  // Calculate overall skill for each player
  const playersWithSkill = players.map((player) => ({
    player,
    skill: calculateOverallSkill(player, weights),
  }));

  // Sort by skill (descending)
  playersWithSkill.sort((a, b) => b.skill - a.skill);

  // For small groups, try all combinations
  if (players.length <= 10) {
    return findOptimalDistribution(playersWithSkill, numberOfTeams, previousTeams);
  }

  // For larger groups, use improved greedy with backtracking
  return balanceTeamsImprovedGreedy(playersWithSkill, numberOfTeams, previousTeams);
}

/**
 * Improved Greedy with backtracking for better balance
 */
function balanceTeamsImprovedGreedy(
  playersWithSkill: Array<{ player: Player; skill: number }>,
  numberOfTeams: number,
  previousTeams?: Team[]
): Team[] {
  const maxAttempts = previousTeams ? 30 : 1;
  let bestTeams: Team[] | null = null;
  let bestDifference = Infinity;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const teams: Team[] = Array.from({ length: numberOfTeams }, () => ({
      players: [],
      totalSkills: 0,
    }));

    // Shuffle top players to avoid always putting them in the same teams
    const topPlayers = [...playersWithSkill.slice(0, numberOfTeams)];
    if (attempt > 0) {
      topPlayers.sort(() => Math.random() - 0.5);
    }

    // Distribute top players first (best players)
    for (let i = 0; i < topPlayers.length; i++) {
      teams[i].players.push(topPlayers[i].player);
      teams[i].totalSkills += topPlayers[i].skill;
    }

    // Distribute remaining players with improved logic
    const remainingPlayers = playersWithSkill.slice(numberOfTeams);
    
    // Shuffle remaining players for variety
    const shuffledRemaining = attempt > 0 
      ? [...remainingPlayers].sort(() => Math.random() - 0.5)
      : remainingPlayers;
    
    for (const { player, skill } of shuffledRemaining) {
      // Calculate potential imbalance for each team
      const imbalances = teams.map((team, index) => {
        const newTotal = team.totalSkills + skill;
        const otherTeams = teams.filter((_, i) => i !== index);
        const avgOtherTotal = otherTeams.reduce((sum, t) => sum + t.totalSkills, 0) / otherTeams.length;
        const imbalance = Math.abs(newTotal - avgOtherTotal);
        return { index, imbalance, newTotal };
      });

      // Choose team that minimizes imbalance
      // If multiple teams have same imbalance, randomly choose one
      imbalances.sort((a, b) => a.imbalance - b.imbalance);
      const minImbalance = imbalances[0].imbalance;
      const candidates = imbalances.filter(i => Math.abs(i.imbalance - minImbalance) < 0.01);
      const selected = candidates.length > 1
        ? candidates[Math.floor(Math.random() * candidates.length)]
        : imbalances[0];
      
      teams[selected.index].players.push(player);
      teams[selected.index].totalSkills = selected.newTotal;
    }

    // Check if this distribution is different from previous
    if (previousTeams && areTeamsSimilar(teams, previousTeams)) {
      continue; // Try again
    }

    // Calculate difference
    const totals = teams.map(t => t.totalSkills);
    const max = Math.max(...totals);
    const min = Math.min(...totals);
    const avg = totals.reduce((sum, t) => sum + t, 0) / totals.length;
    const difference = avg > 0 ? ((max - min) / avg) * 100 : 0;

    if (difference < bestDifference) {
      bestDifference = difference;
      bestTeams = teams;
    }

    // If we found a different distribution and it's reasonably balanced, use it
    if (!previousTeams || !areTeamsSimilar(teams, previousTeams)) {
      if (difference < 15) { // Good enough balance
        return teams;
      }
    }
  }

  return bestTeams || (() => {
    // Fallback
    const teams: Team[] = Array.from({ length: numberOfTeams }, () => ({
      players: [],
      totalSkills: 0,
    }));
    const topPlayers = playersWithSkill.slice(0, numberOfTeams);
    for (let i = 0; i < topPlayers.length; i++) {
      teams[i].players.push(topPlayers[i].player);
      teams[i].totalSkills += topPlayers[i].skill;
    }
    const remainingPlayers = playersWithSkill.slice(numberOfTeams);
    for (const { player, skill } of remainingPlayers) {
      let minTeamIndex = 0;
      let minTotal = teams[0].totalSkills;
      for (let i = 1; i < teams.length; i++) {
        if (teams[i].totalSkills < minTotal) {
          minTotal = teams[i].totalSkills;
          minTeamIndex = i;
        }
      }
      teams[minTeamIndex].players.push(player);
      teams[minTeamIndex].totalSkills += skill;
    }
    return teams;
  })();
}

/**
 * Find optimal distribution by trying different combinations
 * Only used for small groups due to computational complexity
 */
function findOptimalDistribution(
  playersWithSkill: Array<{ player: Player; skill: number }>,
  numberOfTeams: number,
  previousTeams?: Team[]
): Team[] {
  const totalSkill = playersWithSkill.reduce((sum, p) => sum + p.skill, 0);
  const targetSkillPerTeam = totalSkill / numberOfTeams;

  let bestTeams: Team[] | null = null;
  let bestVariance = Infinity;
  const maxAttempts = previousTeams ? 200 : 100; // More attempts if avoiding repetition

  // Try multiple random distributions and pick the best
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const teams: Team[] = Array.from({ length: numberOfTeams }, () => ({
      players: [],
      totalSkills: 0,
    }));

    // Shuffle players with better randomization
    const shuffled = [...playersWithSkill].sort(() => Math.random() - 0.5);

    // Distribute with greedy approach
    for (const { player, skill } of shuffled) {
      // Find teams with minimum total, if multiple, randomly choose
      const teamsWithTotals = teams.map((team, index) => ({
        team,
        index,
        total: team.totalSkills,
      })).sort((a, b) => a.total - b.total);
      
      const minTotal = teamsWithTotals[0].total;
      const candidates = teamsWithTotals.filter(t => t.total === minTotal);
      const selected = candidates.length > 1
        ? candidates[Math.floor(Math.random() * candidates.length)]
        : candidates[0];

      teams[selected.index].players.push(player);
      teams[selected.index].totalSkills += skill;
    }

    // Check if this distribution is different from previous
    if (previousTeams && areTeamsSimilar(teams, previousTeams)) {
      continue; // Try again
    }

    // Calculate variance
    const variance = teams.reduce((sum, team) => {
      const diff = team.totalSkills - targetSkillPerTeam;
      return sum + diff * diff;
    }, 0);

    if (variance < bestVariance) {
      bestVariance = variance;
      bestTeams = teams;
      
      // If variance is very good and different, return early
      if (variance < 0.1 && (!previousTeams || !areTeamsSimilar(teams, previousTeams))) {
        return teams;
      }
    }
  }

  return bestTeams || balanceTeamsGreedy(
    playersWithSkill.map((p) => p.player),
    numberOfTeams,
    undefined,
    previousTeams
  );
}

/**
 * Main function to balance teams using specified algorithm
 */
export function balanceTeams(
  players: Player[],
  numberOfTeams: number = 2,
  algorithm: BalancingAlgorithm = 'greedy',
  weights?: BalancingWeights,
  previousTeams?: Team[]
): Team[] {
  switch (algorithm) {
    case 'greedy':
      return balanceTeamsGreedy(players, numberOfTeams, weights, previousTeams);
    case 'optimal':
      return balanceTeamsOptimal(players, numberOfTeams, weights, previousTeams);
    default:
      return balanceTeamsGreedy(players, numberOfTeams, weights, previousTeams);
  }
}

/**
 * Calculate the difference percentage between teams
 */
export function calculateTeamDifference(teams: Team[]): number {
  if (teams.length < 2) return 0;

  const totals = teams.map((team) => team.totalSkills);
  const max = Math.max(...totals);
  const min = Math.min(...totals);
  const avg = totals.reduce((sum, t) => sum + t, 0) / totals.length;

  if (avg === 0) return 0;
  return ((max - min) / avg) * 100;
}

