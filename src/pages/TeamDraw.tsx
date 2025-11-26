import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { BalancingAlgorithm } from '../utils/balancingAlgorithm';
import { useSkills } from '../hooks/useSkills';
import { useDraw } from '../hooks/useDraw';
import { useToast } from '../hooks/useToast';
import { useMatch } from '../hooks/useMatch';
import { SkillsConfiguration } from '../components/SkillsConfiguration';
import { DrawResults } from '../components/DrawResults';
import { DrawHistory } from '../components/DrawHistory';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';

export function TeamDraw() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useToast();
  const { currentMatch, isLoading: matchLoading } = useMatch(matchId);
  const {
    players,
    updatePlayerSkills,
    toggleParticipation,
    toggleRecurring,
    removePlayerFromMatch,
    calculateOverallRating,
    getParticipatingPlayers,
    isLoading: skillsLoading,
  } = useSkills(matchId);

  const {
    currentTeams,
    isDrawing,
    drawError,
    history,
    executeNewDraw,
    clearDraw,
    getDrawStats,
  } = useDraw();

  const [selectedAlgorithm, setSelectedAlgorithm] = useState<BalancingAlgorithm>('greedy');
  const [numberOfTeams, setNumberOfTeams] = useState(2);

  const handleDraw = () => {
    try {
      const participatingPlayers = getParticipatingPlayers();
      const teams = executeNewDraw(participatingPlayers, numberOfTeams, selectedAlgorithm);
      
      // Store draw result temporarily in localStorage
      if (matchId) {
        localStorage.setItem(`draw-result-${matchId}`, JSON.stringify({
          teams,
          algorithm: selectedAlgorithm,
          timestamp: new Date().toISOString(),
        }));
      }
      
      // Navigate to result page
      navigate(`/draw/${matchId}/result`, {
        state: {
          teams,
          algorithm: selectedAlgorithm,
        },
      });
      
      showSuccess('Times sorteados com sucesso!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao sortear times';
      showError(message);
    }
  };

  const handleNewDraw = () => {
    clearDraw();
    handleDraw();
  };

  const handleRedraw = (teams: typeof currentTeams) => {
    // Restore teams from history
    // This is a simplified version - you might want to restore the exact state
    showInfo('Times restaurados do histórico');
  };

  const stats = getDrawStats();
  const participatingCount = players.filter((p) => p.isParticipating !== false).length;

  if (!matchId) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Pelada não encontrada</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Voltar para Home
          </Button>
        </div>
      </div>
    );
  }

  if (matchLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {currentMatch?.name || 'Sorteio de Times'}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {currentMatch && (
                <>
                  {new Date(currentMatch.day).toLocaleDateString('pt-BR')} às {currentMatch.time.substring(0, 5)}
                </>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/')}
              className="text-xs sm:text-sm"
            >
              Voltar para Home
            </Button>
            {currentMatch && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/setup`)}
                className="text-xs sm:text-sm"
              >
                Editar Pelada
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 sm:p-4 border border-indigo-200 dark:border-indigo-800">
            <p className="text-xs sm:text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-1">
              Total de Jogadores
            </p>
            <p className="text-xl sm:text-2xl font-bold text-indigo-900 dark:text-indigo-100">
              {players.length}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 sm:p-4 border border-green-200 dark:border-green-800">
            <p className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400 mb-1">
              Participando
            </p>
            <p className="text-xl sm:text-2xl font-bold text-green-900 dark:text-green-100">
              {participatingCount}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600">
            <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Excluídos
            </p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {players.length - participatingCount}
            </p>
          </div>
        </div>

        {/* Draw Configuration */}
        {currentTeams.length === 0 && (
          <Card variant="outlined" className="mb-6 sm:mb-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Configuração do Sorteio
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Número de Times
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="5"
                      value={numberOfTeams}
                      onChange={(e) => setNumberOfTeams(parseInt(e.target.value) || 2)}
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Algoritmo de Balanceamento
                    </label>
                    <select
                      value={selectedAlgorithm}
                      onChange={(e) => setSelectedAlgorithm(e.target.value as BalancingAlgorithm)}
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="greedy">Greedy (Rápido)</option>
                      <option value="optimal">Ótimo (Melhor Balanceamento)</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {selectedAlgorithm === 'greedy'
                        ? 'Distribuição rápida, bom para grupos grandes'
                        : 'Melhor balanceamento, pode levar mais tempo'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="primary"
                  onClick={handleDraw}
                  disabled={participatingCount < numberOfTeams || skillsLoading || isDrawing}
                  isLoading={isDrawing}
                  className="w-full sm:w-auto"
                >
                  Sortear Times
                </Button>
                {drawError && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{drawError}</p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Skills Configuration */}
        <SkillsConfiguration
          players={players}
          onUpdateSkills={updatePlayerSkills}
          onToggleParticipation={toggleParticipation}
          onToggleRecurring={toggleRecurring}
          onRemovePlayer={removePlayerFromMatch}
          onCalculateOverall={calculateOverallRating}
          isLoading={skillsLoading}
          showRemoveButton={true}
        />
      </div>

      {/* Draw Results */}
      {currentTeams.length > 0 && (
        <DrawResults
          teams={currentTeams}
          onNewDraw={handleNewDraw}
          isDrawing={isDrawing}
          algorithm={selectedAlgorithm}
        />
      )}

      {/* Draw History */}
      {history.length > 0 && (
        <DrawHistory history={history} onRedraw={handleRedraw} players={players} />
      )}

      {/* Draw History Stats */}
      {stats.totalDraws > 0 && (
        <Card variant="outlined" className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Estatísticas do Sorteio
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                Total de Sorteios
              </p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                {stats.totalDraws}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                Diferença Média
              </p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                {stats.averageDifference.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                Melhor Balanceamento
              </p>
              <p className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
                {stats.bestDifference.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                Pior Balanceamento
              </p>
              <p className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400">
                {stats.worstDifference.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
      )}

    </div>
  );
}
