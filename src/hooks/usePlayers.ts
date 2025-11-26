import { useState, useEffect } from 'react';
import type { Player } from '../types';
import { localStorageService } from '../services/localStorage';
import { parsePlayersNames, validatePlayerNames } from '../utils/parsePlayersNames';

export function usePlayers(matchId?: string) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlayers();
  }, [matchId]);

  const loadPlayers = (): void => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedPlayers = localStorageService.getPlayers(matchId);
      setPlayers(loadedPlayers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar jogadores');
    } finally {
      setIsLoading(false);
    }
  };

  const addPlayer = (name: string, attributes?: Partial<Player>): Player => {
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name: name.trim(),
      matchId: matchId || attributes?.matchId,
      isParticipating: true,
      ...attributes,
    };

    // Get all players (not just current match) and add new one
    const allPlayers = localStorageService.getPlayers();
    const updatedAllPlayers = [...allPlayers, newPlayer];
    localStorageService.savePlayers(updatedAllPlayers);
    
    // Update local state
    if (!matchId || newPlayer.matchId === matchId) {
      setPlayers((prev) => [...prev, newPlayer]);
    }
    
    return newPlayer;
  };

  const removePlayer = (playerId: string): void => {
    // Remove from all players
    const allPlayers = localStorageService.getPlayers();
    const updatedAllPlayers = allPlayers.filter((p) => p.id !== playerId);
    localStorageService.savePlayers(updatedAllPlayers);
    
    // Update local state
    setPlayers((prev) => prev.filter((p) => p.id !== playerId));
  };

  const updatePlayer = (playerId: string, updates: Partial<Player>): void => {
    const updated = localStorageService.updatePlayer(playerId, updates);
    if (updated) {
      // Update local state if player belongs to current match
      if (!matchId || updated.matchId === matchId) {
        setPlayers((prev) => prev.map((p) => (p.id === playerId ? updated : p)));
      } else {
        // Reload if player was moved to different match
        loadPlayers();
      }
    }
  };

  const savePlayers = (playersToSave: Player[]): void => {
    try {
      setError(null);
      // If we have a matchId, we need to merge with other matches' players
      if (matchId) {
        const allPlayers = localStorageService.getPlayers();
        const otherMatchesPlayers = allPlayers.filter((p) => p.matchId !== matchId);
        const updatedAllPlayers = [...otherMatchesPlayers, ...playersToSave];
        localStorageService.savePlayers(updatedAllPlayers);
      } else {
        localStorageService.savePlayers(playersToSave);
      }
      setPlayers(playersToSave);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao salvar jogadores');
      throw err;
    }
  };

  const parseAndAddPlayers = (input: string, matchId?: string): { added: Player[]; invalid: string[] } => {
    if (!input || !input.trim()) {
      return { added: [], invalid: ['Entrada vazia'] };
    }

    const parsedNames = parsePlayersNames(input);
    
    if (parsedNames.length === 0) {
      return { added: [], invalid: ['Nenhum nome válido encontrado na lista'] };
    }

    const { valid, invalid } = validatePlayerNames(parsedNames);

    if (valid.length === 0) {
      return { added: [], invalid: [...invalid, 'Nenhum nome válido após validação'] };
    }

    // Check for duplicates within the same match
    const existingNames = new Set(
      players
        .filter((p) => !matchId || p.matchId === matchId)
        .map((p) => p.name.toLowerCase())
    );
    const newValidNames = valid.filter((name) => !existingNames.has(name.toLowerCase()));
    const duplicateNames = valid.filter((name) => existingNames.has(name.toLowerCase()));

    if (newValidNames.length === 0 && duplicateNames.length > 0) {
      return { added: [], invalid: [...invalid, ...duplicateNames.map(n => `${n} (duplicado)`)] };
    }

    // Create all players at once
    const addedPlayers: Player[] = newValidNames.map((name) => ({
      id: crypto.randomUUID(),
      name: name.trim(),
      matchId: matchId,
      isParticipating: true,
    }));

    // Save all players at once (merge with all existing players)
    if (addedPlayers.length > 0) {
      try {
        const allPlayers = localStorageService.getPlayers();
        const updatedAllPlayers = [...allPlayers, ...addedPlayers];
        localStorageService.savePlayers(updatedAllPlayers);
        
        // Update local state
        setPlayers((prev) => [...prev, ...addedPlayers]);
      } catch (error) {
        console.error('Error saving players:', error);
        return { added: [], invalid: ['Erro ao salvar jogadores'] };
      }
    }

    return {
      added: addedPlayers,
      invalid: [...invalid, ...duplicateNames],
    };
  };

  const clearPlayers = (): void => {
    savePlayers([]);
  };

  return {
    players,
    isLoading,
    error,
    addPlayer,
    removePlayer,
    updatePlayer,
    parseAndAddPlayers,
    clearPlayers,
    loadPlayers,
  };
}

