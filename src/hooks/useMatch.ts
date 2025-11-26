import { useState, useEffect } from 'react';
import type { Match } from '../types';
import { localStorageService } from '../services/localStorage';

export function useMatch(initialMatchId?: string) {
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialMatchId) {
      loadMatch(initialMatchId);
    } else {
      setIsLoading(false);
    }
  }, [initialMatchId]);

  const loadMatch = (matchId: string): void => {
    try {
      setIsLoading(true);
      setError(null);
      const matches = localStorageService.getMatches();
      const match = matches.find((m) => m.id === matchId);
      
      if (match) {
        setCurrentMatch(match);
      } else {
        setError('Match not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load match');
    } finally {
      setIsLoading(false);
    }
  };

  const saveMatch = (match: Match): void => {
    try {
      setError(null);
      localStorageService.saveMatch(match);
      setCurrentMatch(match);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save match');
      throw err;
    }
  };

  const createMatch = (matchData: Omit<Match, 'id'>): Match => {
    const newMatch: Match = {
      id: crypto.randomUUID(),
      ...matchData,
    };
    saveMatch(newMatch);
    return newMatch;
  };

  const updateMatch = (updates: Partial<Match>): void => {
    if (!currentMatch) {
      throw new Error('No match loaded');
    }
    
    const updatedMatch: Match = {
      ...currentMatch,
      ...updates,
    };
    saveMatch(updatedMatch);
  };

  const validateMatch = (match: Partial<Match>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!match.name || match.name.trim().length === 0) {
      errors.push('Match name is required');
    }

    if (!match.day) {
      errors.push('Day is required');
    }

    if (!match.time) {
      errors.push('Time is required');
    }

    if (!match.numberOfPeople || match.numberOfPeople < 2) {
      errors.push('Number of people must be at least 2');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  return {
    currentMatch,
    isLoading,
    error,
    loadMatch,
    saveMatch,
    createMatch,
    updateMatch,
    validateMatch,
  };
}

