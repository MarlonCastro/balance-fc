import { describe, it, expect } from 'vitest';
import { calculateOverallSkill, balanceTeams, calculateTeamDifference } from './balancingAlgorithm';
import type { Player, Team } from '../types';

describe('balancingAlgorithm', () => {
  describe('calculateOverallSkill', () => {
    it('calculates skill with all attributes', () => {
      const player: Player = {
        id: '1',
        name: 'Test',
        skillRating: 4,
        speed: 3.5,
        physicalCondition: 3,
      };
      const skill = calculateOverallSkill(player);
      expect(skill).toBeGreaterThan(0);
      expect(skill).toBeLessThanOrEqual(5);
    });

    it('handles missing attributes', () => {
      const player: Player = {
        id: '1',
        name: 'Test',
        skillRating: 5,
      };
      const skill = calculateOverallSkill(player);
      expect(skill).toBeGreaterThanOrEqual(0);
    });
  });

  describe('balanceTeams', () => {
    it('creates balanced teams', () => {
      const players: Player[] = [
        { id: '1', name: 'Player 1', skillRating: 5 },
        { id: '2', name: 'Player 2', skillRating: 4 },
        { id: '3', name: 'Player 3', skillRating: 3 },
        { id: '4', name: 'Player 4', skillRating: 2 },
      ];

      const teams = balanceTeams(players, 2, 'greedy');
      expect(teams).toHaveLength(2);
      expect(teams[0].players.length + teams[1].players.length).toBe(players.length);
    });

    it('throws error for insufficient players', () => {
      const players: Player[] = [{ id: '1', name: 'Player 1' }];
      expect(() => balanceTeams(players, 2)).toThrow();
    });
  });

  describe('calculateTeamDifference', () => {
    it('calculates difference between teams', () => {
      const teams: Team[] = [
        { players: [], totalSkills: 20 },
        { players: [], totalSkills: 18 },
      ];
      const difference = calculateTeamDifference(teams);
      expect(difference).toBeGreaterThanOrEqual(0);
    });

    it('returns 0 for single team', () => {
      const teams: Team[] = [{ players: [], totalSkills: 20 }];
      const difference = calculateTeamDifference(teams);
      expect(difference).toBe(0);
    });
  });
});

