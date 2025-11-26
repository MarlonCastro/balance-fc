import { useNavigate } from 'react-router-dom';
import { MatchForm } from '../components/MatchForm';
import { PlayersRegistration } from '../components/PlayersRegistration';
import { useMatch } from '../hooks/useMatch';
import { usePlayers } from '../hooks/usePlayers';
import { useToast } from '../hooks/useToast';

interface MatchFormData {
  name: string;
  day: string;
  time: string;
  numberOfPeople: number;
}

export function MatchSetup() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { createMatch, currentMatch, isLoading: matchLoading } = useMatch();
  const {
    players,
    parseAndAddPlayers,
    removePlayer,
    updatePlayer,
    isLoading: playersLoading,
  } = usePlayers(currentMatch?.id);

  const handleMatchSubmit = (data: MatchFormData) => {
    try {
      createMatch(data);
      showSuccess('Pelada salva com sucesso!');
    } catch (error) {
      console.error('Failed to save match:', error);
      showError('Falha ao salvar pelada. Por favor, tente novamente.');
    }
  };

  const handleAddPlayers = (input: string) => {
    if (!currentMatch?.id) {
      showError('Por favor, salve a pelada primeiro antes de adicionar jogadores.');
      return { added: [], invalid: ['Pelada não salva'] };
    }
    
    try {
      const result = parseAndAddPlayers(input, currentMatch.id);
      
      if (result.added.length > 0) {
        showSuccess(`${result.added.length} jogador${result.added.length > 1 ? 'es' : ''} adicionado${result.added.length > 1 ? 's' : ''} com sucesso!`);
      }
      
      return result;
    } catch (error) {
      console.error('Error adding players:', error);
      showError('Erro ao adicionar jogadores. Por favor, tente novamente.');
      return { added: [], invalid: ['Erro ao processar'] };
    }
  };

  const isLoading = matchLoading || playersLoading;

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Configuração da Pelada
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Configure os detalhes da pelada e registre os jogadores para sorteio balanceado de times
          </p>
        </div>

        {/* Match Form Section */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6 sm:pb-8 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 sm:mb-6">
            Informações da Pelada
          </h2>
          <MatchForm
            initialData={currentMatch ? {
              name: currentMatch.name,
              day: currentMatch.day,
              time: currentMatch.time,
              numberOfPeople: currentMatch.numberOfPeople,
            } : undefined}
            onSubmit={handleMatchSubmit}
            isLoading={isLoading}
          />
        </div>

        {/* Players Registration Section */}
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 sm:mb-6">
            Cadastro de Jogadores
          </h2>
          <PlayersRegistration
            players={players}
            onAddPlayers={handleAddPlayers}
            onRemovePlayer={removePlayer}
            onUpdatePlayer={updatePlayer}
            isLoading={isLoading}
          />
        </div>

        {/* Action Buttons */}
        {currentMatch && (
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 sm:gap-4 justify-end">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gray-600 text-white rounded-lg text-sm sm:text-base font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors shadow-sm hover:shadow-md"
            >
              Voltar para Home
            </button>
            {players.length > 0 && (
              <button
                type="button"
                onClick={() => navigate(`/draw/${currentMatch.id}`)}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white rounded-lg text-sm sm:text-base font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm hover:shadow-md"
              >
                Ir para Sorteio de Times
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
