import { useState, useEffect, useCallback } from 'react';
import type { Player } from '../types';
import { localStorageService } from '../services/localStorage';

interface PlayerWithParticipation extends Player {
  isParticipating?: boolean;
}

export function useSkills(matchId?: string) {
  const [players, setPlayers] = useState<PlayerWithParticipation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlayers();
  }, [matchId]);

  const loadPlayers = useCallback(() => {
    try {
      setIsLoading(true);
      const loadedPlayers = localStorageService.getPlayers(matchId);
      // Ensure all players have isParticipating flag
      const playersWithParticipation: PlayerWithParticipation[] = loadedPlayers.map((player) => ({
        ...player,
        isParticipating: player.isParticipating !== undefined ? player.isParticipating : true,
      }));
      setPlayers(playersWithParticipation);
    } catch (error) {
      console.error('Error loading players:', error);
    } finally {
      setIsLoading(false);
    }
  }, [matchId]);

  const updatePlayerSkills = useCallback(
    (playerId: string, skills: { speed?: number; physicalCondition?: number; skillRating?: number }) => {
      try {
        // Support backward compatibility with weight
        const updates: any = { ...skills };
        if (skills.physicalCondition !== undefined) {
          updates.physicalCondition = skills.physicalCondition;
        }
        const updated = localStorageService.updatePlayer(playerId, updates);
        if (updated) {
          setPlayers((prev) =>
            prev.map((p) => (p.id === playerId ? { ...updated, isParticipating: p.isParticipating, isRecurring: p.isRecurring } : p))
          );
        }
      } catch (error) {
        console.error('Error updating player skills:', error);
        throw error;
      }
    },
    []
  );

  const toggleParticipation = useCallback((playerId: string) => {
    try {
      setPlayers((prev) => {
        const updated = prev.map((p) =>
          p.id === playerId ? { ...p, isParticipating: !p.isParticipating } : p
        );
        // Update player in localStorage with participation status
        const player = updated.find((p) => p.id === playerId);
        if (player) {
          localStorageService.updatePlayer(playerId, {
            isParticipating: player.isParticipating,
          });
        }
        return updated;
      });
    } catch (error) {
      console.error('Error toggling participation:', error);
    }
  }, []);

  const calculateOverallRating = useCallback((player: Player): number => {
    // Support backward compatibility with weight
    const physicalCondition = player.physicalCondition ?? (player as any).weight ?? 0;
    const skills = [
      player.skillRating || 0,
      player.speed || 0,
      physicalCondition,
    ].filter((s) => s > 0);

    if (skills.length === 0) return 0;
    return skills.reduce((sum, skill) => sum + skill, 0) / skills.length;
  }, []);

  const getParticipatingPlayers = useCallback((): PlayerWithParticipation[] => {
    return players.filter((p) => p.isParticipating !== false && (p.isRecurring !== false));
  }, [players]);

  const toggleRecurring = useCallback((playerId: string) => {
    try {
      setPlayers((prev) => {
        const updated = prev.map((p) => {
          if (p.id === playerId) {
            const newRecurring = !(p.isRecurring !== false);
            // Se marcar como não recorrente, desativar participação automaticamente
            const newParticipating = newRecurring ? (p.isParticipating !== false) : false;
            const updatedPlayer = {
              ...p,
              isRecurring: newRecurring,
              isParticipating: newParticipating,
            };
            // Update in localStorage
            localStorageService.updatePlayer(playerId, {
              isRecurring: newRecurring,
              isParticipating: newParticipating,
            });
            return updatedPlayer;
          }
          return p;
        });
        return updated;
      });
    } catch (error) {
      console.error('Error toggling recurring status:', error);
    }
  }, []);

  const removePlayerFromMatch = useCallback((playerId: string) => {
    try {
      // Remove matchId from player (remove from current match but keep in database)
      const allPlayers = localStorageService.getPlayers();
      const player = allPlayers.find((p) => p.id === playerId);
      if (player && matchId) {
        // If player belongs to this match, remove the matchId
        if (player.matchId === matchId) {
          const updatedPlayer = { ...player, matchId: undefined };
          localStorageService.updatePlayer(playerId, { matchId: undefined });
          // Remove from local state
          setPlayers((prev) => prev.filter((p) => p.id !== playerId));
        }
      }
    } catch (error) {
      console.error('Error removing player from match:', error);
    }
  }, [matchId]);

  const saveParticipationStatus = useCallback(() => {
    try {
      // Save players with participation status
      // We'll store participation in a separate key or extend the player type
      const playersToSave = players.map(({ isParticipating, ...player }) => player);
      localStorageService.savePlayers(playersToSave);
      
      // Store participation status separately
      const participationMap: Record<string, boolean> = {};
      players.forEach((p) => {
        if (p.isParticipating !== undefined) {
          participationMap[p.id] = p.isParticipating;
        }
      });
      window.localStorage.setItem('balance-fc-participation', JSON.stringify(participationMap));
    } catch (error) {
      console.error('Error saving participation status:', error);
    }
  }, [players]);

  // Load participation status on mount
  useEffect(() => {
    try {
      const participationData = window.localStorage.getItem('balance-fc-participation');
      if (participationData) {
        const participationMap: Record<string, boolean> = JSON.parse(participationData);
        setPlayers((prev) =>
          prev.map((p) => ({
            ...p,
            isParticipating: participationMap[p.id] !== undefined ? participationMap[p.id] : true,
          }))
        );
      }
    } catch (error) {
      console.error('Error loading participation status:', error);
    }
  }, []);

  // Auto-save participation when it changes
  useEffect(() => {
    if (!isLoading) {
      saveParticipationStatus();
    }
  }, [players, isLoading, saveParticipationStatus]);

  return {
    players,
    isLoading,
    updatePlayerSkills,
    toggleParticipation,
    toggleRecurring,
    removePlayerFromMatch,
    calculateOverallRating,
    getParticipatingPlayers,
    loadPlayers,
  };
}

