import { useState, useCallback } from 'react';
import type { Player, Team } from '../types';
import { balanceTeams, calculateTeamDifference } from '../utils/balancingAlgorithm';
import type { BalancingAlgorithm } from '../utils/balancingAlgorithm';
import { useLocalStorage } from './useLocalStorage';

interface DrawHistory {
  id: string;
  teams: Team[];
  difference: number;
  algorithm: BalancingAlgorithm;
  timestamp: string;
  playerCount: number;
}

export function useDraw() {
  const [currentTeams, setCurrentTeams] = useState<Team[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawError, setDrawError] = useState<string | null>(null);
  const [history, setHistory] = useLocalStorage<DrawHistory[]>('draw-history', []);

  const validateDraw = useCallback((players: Player[], numberOfTeams: number = 2): { valid: boolean; error?: string } => {
    if (players.length < numberOfTeams) {
      return {
        valid: false,
        error: `É necessário pelo menos ${numberOfTeams} jogadores para formar ${numberOfTeams} times`,
      };
    }

    if (players.length < 2) {
      return {
        valid: false,
        error: 'É necessário pelo menos 2 jogadores para sortear times',
      };
    }

    return { valid: true };
  }, []);

  const executeNewDraw = useCallback(
    (
      players: Player[],
      numberOfTeams: number = 2,
      algorithm: BalancingAlgorithm = 'greedy'
    ): Team[] => {
      setIsDrawing(true);
      setDrawError(null);

      try {
        // Validate
        const validation = validateDraw(players, numberOfTeams);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        // Get the most recent draw from history to avoid repetition
        const previousDraw = history.length > 0 ? history[0] : undefined;
        const previousTeams = previousDraw?.teams;

        // Execute draw with previous teams to avoid repetition
        const teams = balanceTeams(players, numberOfTeams, algorithm, undefined, previousTeams);
        const difference = calculateTeamDifference(teams);

        // Save to history
        const drawRecord: DrawHistory = {
          id: crypto.randomUUID(),
          teams,
          difference,
          algorithm,
          timestamp: new Date().toISOString(),
          playerCount: players.length,
        };

        setHistory((prev) => [drawRecord, ...prev].slice(0, 50)); // Keep last 50 draws

        // Set current teams
        setCurrentTeams(teams);

        return teams;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Falha ao sortear times';
        setDrawError(errorMessage);
        throw error;
      } finally {
        setIsDrawing(false);
      }
    },
    [validateDraw, setHistory]
  );

  const clearDraw = useCallback(() => {
    setCurrentTeams([]);
    setDrawError(null);
  }, []);

  const getBestDraw = useCallback((): DrawHistory | null => {
    if (history.length === 0) return null;
    
    return history.reduce((best, current) => {
      return current.difference < best.difference ? current : best;
    });
  }, [history]);

  const getDrawStats = useCallback(() => {
    if (history.length === 0) {
      return {
        totalDraws: 0,
        averageDifference: 0,
        bestDifference: 0,
        worstDifference: 0,
      };
    }

    const differences = history.map((h) => h.difference);
    const averageDifference = differences.reduce((sum, d) => sum + d, 0) / differences.length;
    const bestDifference = Math.min(...differences);
    const worstDifference = Math.max(...differences);

    return {
      totalDraws: history.length,
      averageDifference,
      bestDifference,
      worstDifference,
    };
  }, [history]);

  return {
    currentTeams,
    isDrawing,
    drawError,
    history,
    executeNewDraw,
    clearDraw,
    getBestDraw,
    getDrawStats,
    validateDraw,
  };
}

