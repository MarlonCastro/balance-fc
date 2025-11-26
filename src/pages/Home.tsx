import { useNavigate } from 'react-router-dom';
import type { Match } from '../types';
import { localStorageService } from '../services/localStorage';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';

export function Home() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = () => {
    const loadedMatches = localStorageService.getMatches();
    setMatches(loadedMatches);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const handleMatchClick = (matchId: string) => {
    navigate(`/draw/${matchId}`);
  };

  const handleDeleteMatch = (matchId: string) => {
    try {
      // Remove match from localStorage
      localStorageService.deleteMatch(matchId);
      
      // Also remove players associated with this match
      const allPlayers = localStorageService.getPlayers();
      const updatedPlayers = allPlayers.filter((p) => p.matchId !== matchId);
      localStorageService.savePlayers(updatedPlayers);
      
      // Reload matches
      loadMatches();
      showSuccess('Pelada excluída com sucesso!');
      setShowDeleteModal(null);
    } catch (error) {
      showError('Falha ao excluir pelada');
    }
  };

  const getMatchPlayerCount = (matchId: string) => {
    const players = localStorageService.getPlayers(matchId);
    return players.length;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Peladas Cadastradas
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Gerencie suas peladas e acesse o sorteio de times
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate('/setup')}
            className="w-full sm:w-auto"
          >
            + Nova Pelada
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
            <p className="text-xs sm:text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-1">
              Total de Peladas
            </p>
            <p className="text-xl sm:text-2xl font-bold text-indigo-900 dark:text-indigo-100">
              {matches.length}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <p className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400 mb-1">
              Total de Jogadores
            </p>
            <p className="text-xl sm:text-2xl font-bold text-green-900 dark:text-green-100">
              {localStorageService.getPlayers().length}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
              Próxima Pelada
            </p>
            <p className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-100">
              {matches.length > 0 ? formatDate(matches[0].day) : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Matches List */}
      {matches.length === 0 ? (
        <Card variant="outlined">
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">
              Nenhuma pelada cadastrada
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
              Crie sua primeira pelada para começar
            </p>
            <Button variant="primary" onClick={() => navigate('/setup')}>
              Criar Primeira Pelada
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {matches.map((match) => {
            const playerCount = getMatchPlayerCount(match.id);
            return (
              <div onClick={() => handleMatchClick(match.id)}>
                <Card
                  key={match.id}
                  variant="elevated"
                  className="hover:shadow-xl transition-all duration-200 cursor-pointer"
                >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {match.name}
                      </h3>
                      <div className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {formatDate(match.day)}
                        </div>
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {formatTime(match.time)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteModal(match.id);
                      }}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                      title="Excluir pelada"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Jogadores
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {playerCount} / {match.numberOfPeople}
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMatchClick(match.id);
                      }}
                    >
                      Ver Sorteio
                    </Button>
                  </div>
                </div>
              </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal !== null}
        onClose={() => setShowDeleteModal(null)}
        title="Excluir Pelada"
        variant="danger"
        confirmText="Excluir"
        onConfirm={() => showDeleteModal && handleDeleteMatch(showDeleteModal)}
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Tem certeza que deseja excluir esta pelada? Todos os jogadores vinculados a ela também serão removidos. Esta ação não pode ser desfeita.
        </p>
      </Modal>
    </div>
  );
}

