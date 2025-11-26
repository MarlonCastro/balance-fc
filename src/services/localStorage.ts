import type { Match, Player } from '../types';

const MATCHES_KEY = 'balance-fc-matches';
const PLAYERS_KEY = 'balance-fc-players';

export const localStorageService = {
  // Match operations
  saveMatch: (match: Match): void => {
    try {
      const matches = localStorageService.getMatches();
      const existingIndex = matches.findIndex((m) => m.id === match.id);
      
      if (existingIndex >= 0) {
        matches[existingIndex] = match;
      } else {
        matches.push(match);
      }
      
      window.localStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
    } catch (error) {
      console.error('Error saving match:', error);
      throw new Error('Failed to save match');
    }
  },

  getMatches: (): Match[] => {
    try {
      const item = window.localStorage.getItem(MATCHES_KEY);
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error('Error getting matches:', error);
      return [];
    }
  },

  deleteMatch: (matchId: string): void => {
    try {
      const matches = localStorageService.getMatches();
      const updatedMatches = matches.filter((m) => m.id !== matchId);
      window.localStorage.setItem(MATCHES_KEY, JSON.stringify(updatedMatches));
    } catch (error) {
      console.error('Error deleting match:', error);
      throw new Error('Failed to delete match');
    }
  },

  // Player operations
  savePlayers: (players: Player[]): void => {
    try {
      window.localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
    } catch (error) {
      console.error('Error saving players:', error);
      throw new Error('Failed to save players');
    }
  },

  getPlayers: (matchId?: string): Player[] => {
    try {
      const item = window.localStorage.getItem(PLAYERS_KEY);
      const allPlayers = item ? JSON.parse(item) : [];
      if (matchId) {
        return allPlayers.filter((p: Player) => p.matchId === matchId);
      }
      return allPlayers;
    } catch (error) {
      console.error('Error getting players:', error);
      return [];
    }
  },

  updatePlayer: (playerId: string, updates: Partial<Player>): Player | null => {
    try {
      const players = localStorageService.getPlayers();
      const playerIndex = players.findIndex((p) => p.id === playerId);
      
      if (playerIndex === -1) {
        return null;
      }
      
      players[playerIndex] = { ...players[playerIndex], ...updates };
      localStorageService.savePlayers(players);
      
      return players[playerIndex];
    } catch (error) {
      console.error('Error updating player:', error);
      throw new Error('Failed to update player');
    }
  },
};

