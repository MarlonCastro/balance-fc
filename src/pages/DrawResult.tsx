import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { Team } from '../types';
import type { BalancingAlgorithm } from '../utils/balancingAlgorithm';
import { DrawResults } from '../components/DrawResults';
import { Button } from '../components/ui/Button';
import { useMatch } from '../hooks/useMatch';
import { useToast } from '../hooks/useToast';
import { formatTeamsForWhatsApp } from '../utils/whatsappFormatter';

export function DrawResult() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useToast();
  const { currentMatch, isLoading: matchLoading } = useMatch(matchId);
  
  const [teams, setTeams] = useState<Team[]>([]);
  const [algorithm, setAlgorithm] = useState<BalancingAlgorithm>('greedy');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Try to get teams from location state first
    if (location.state?.teams) {
      setTeams(location.state.teams);
      setAlgorithm(location.state.algorithm || 'greedy');
      setIsLoading(false);
    } else {
      // Try to get from localStorage (temporary storage)
      const storedDraw = localStorage.getItem(`draw-result-${matchId}`);
      if (storedDraw) {
        try {
          const drawData = JSON.parse(storedDraw);
          setTeams(drawData.teams);
          setAlgorithm(drawData.algorithm || 'greedy');
        } catch (error) {
          console.error('Error loading draw result:', error);
          showError('Erro ao carregar resultado do sorteio');
          navigate(`/draw/${matchId}`);
        }
      } else {
        // No draw data found, redirect to draw page
        navigate(`/draw/${matchId}`);
      }
      setIsLoading(false);
    }
  }, [matchId, location.state, navigate, showError]);

  const handleNewDraw = () => {
    // Clear stored draw result
    if (matchId) {
      localStorage.removeItem(`draw-result-${matchId}`);
    }
    // Navigate back to draw page
    navigate(`/draw/${matchId}`);
  };

  const handleCopyToWhatsApp = () => {
    if (teams.length === 0) {
      showError('Nenhum time para copiar');
      return;
    }

    try {
      const formattedText = formatTeamsForWhatsApp(teams, currentMatch?.name);
      navigator.clipboard.writeText(formattedText).then(() => {
        showSuccess('✅ Times copiados! Cole no grupo do WhatsApp.');
      }).catch((error) => {
        console.error('Error copying to clipboard:', error);
        showError('Erro ao copiar. Tente novamente.');
      });
    } catch (error) {
      console.error('Error formatting teams:', error);
      showError('Erro ao formatar times');
    }
  };

  if (matchLoading || isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">Carregando resultado do sorteio...</p>
        </div>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Nenhum resultado encontrado</p>
          <Button variant="primary" onClick={() => navigate(`/draw/${matchId}`)}>
            Voltar para Sorteio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header with Actions */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Resultado do Sorteio
            </h1>
            {currentMatch && (
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {currentMatch.name} - {new Date(currentMatch.day).toLocaleDateString('pt-BR')} às {currentMatch.time.substring(0, 5)}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/')}
              className="text-xs sm:text-sm"
            >
              Voltar para Home
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleNewDraw}
              className="text-xs sm:text-sm"
            >
              Sortear Novamente
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCopyToWhatsApp}
              className="text-xs sm:text-sm"
            >
              📱 Copiar para WhatsApp
            </Button>
          </div>
        </div>
      </div>

      {/* Draw Results */}
      <DrawResults
        teams={teams}
        onNewDraw={handleNewDraw}
        isDrawing={false}
        algorithm={algorithm}
      />
    </div>
  );
}

