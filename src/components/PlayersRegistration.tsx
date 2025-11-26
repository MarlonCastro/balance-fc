import { useState } from 'react';
import type { Player } from '../types';
import { parsePlayersNames } from '../utils/parsePlayersNames';

// Função para calcular média do jogador
const calculatePlayerAverage = (player: Player): number => {
  const physicalCondition = player.physicalCondition ?? (player as any).weight ?? 0;
  const skills = [
    player.skillRating || 0,
    player.speed || 0,
    physicalCondition,
  ].filter((s) => s > 0);

  if (skills.length === 0) return 0;
  return skills.reduce((sum, skill) => sum + skill, 0) / skills.length;
};

interface PlayersRegistrationProps {
  players: Player[];
  onAddPlayers: (input: string) => { added: Player[]; invalid: string[] };
  onRemovePlayer: (playerId: string) => void;
  onUpdatePlayer: (playerId: string, updates: Partial<Player>) => void;
  isLoading?: boolean;
}

export function PlayersRegistration({
  players,
  onAddPlayers,
  onRemovePlayer,
  onUpdatePlayer,
  isLoading = false,
}: PlayersRegistrationProps) {
  const [inputText, setInputText] = useState('');
  const [previewNames, setPreviewNames] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleInputChange = (value: string) => {
    setInputText(value);
    if (value.trim()) {
      const parsed = parsePlayersNames(value);
      setPreviewNames(parsed);
      setShowPreview(parsed.length > 0);
    } else {
      setPreviewNames([]);
      setShowPreview(false);
    }
  };

  const handleProcessList = () => {
    if (!inputText.trim()) {
      alert('Por favor, digite pelo menos um nome de jogador.');
      return;
    }

    console.log('Processing list:', inputText);
    
    try {
      const result = onAddPlayers(inputText);
      
      console.log('Result:', result);
      
      if (result.added.length > 0) {
        setInputText('');
        setPreviewNames([]);
        setShowPreview(false);
      } else {
        // No players were added - show error
        if (result.invalid && result.invalid.length > 0) {
          const errorMsg = result.invalid.includes('Pelada não salva') 
            ? 'Por favor, salve a pelada primeiro antes de adicionar jogadores.'
            : `Nenhum jogador foi adicionado. Motivos:\n${result.invalid.join('\n')}`;
          alert(errorMsg);
        } else {
          alert('Nenhum jogador foi adicionado. Verifique se os nomes estão corretos.');
        }
      }

      if (result.invalid && result.invalid.length > 0 && result.added.length > 0) {
        alert(`Atenção: Alguns nomes não puderam ser adicionados:\n${result.invalid.join('\n')}`);
      }
    } catch (error) {
      console.error('Error processing list:', error);
      alert('Erro ao processar a lista. Por favor, tente novamente.');
    }
  };

  const handleStartEdit = (player: Player) => {
    setEditingPlayerId(player.id);
    setEditName(player.name);
  };

  const handleSaveEdit = (playerId: string) => {
    if (editName.trim()) {
      onUpdatePlayer(playerId, { name: editName.trim() });
    }
    setEditingPlayerId(null);
    setEditName('');
  };

  const handleCancelEdit = () => {
    setEditingPlayerId(null);
    setEditName('');
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Adicionar Jogadores</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="players-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Lista de Nomes dos Jogadores
            </label>
            <textarea
              id="players-input"
              value={inputText}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Digite os nomes dos jogadores, um por linha ou lista numerada:&#10;1. João Silva&#10;2. Maria Santos&#10;3. Pedro Oliveira"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
              rows={6}
              disabled={isLoading}
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Suporta listas numeradas (1. Nome) ou um nome por linha
            </p>
          </div>

          {/* Preview */}
          {showPreview && previewNames.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  Prévia: {previewNames.length} nome(s) detectado(s)
                </p>
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
                >
                  Ocultar
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {previewNames.map((name, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleProcessList}
            disabled={isLoading || !inputText.trim() || previewNames.length === 0}
            className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Processar Lista
          </button>
        </div>
      </div>

      {/* Players List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Jogadores Cadastrados
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              {players.length} jogador{players.length !== 1 ? 'es' : ''}
            </span>
          </div>
        </div>

        {players.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">Nenhum jogador cadastrado ainda</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Adicione jogadores usando o formulário acima</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {players.map((player) => (
              <div
                key={player.id}
                className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {editingPlayerId === player.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveEdit(player.id);
                        } else if (e.key === 'Escape') {
                          handleCancelEdit();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(player.id)}
                      className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                    >
                      Salvar
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                            {calculatePlayerAverage(player).toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">{player.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Média de avaliação</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(player)}
                        className="p-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-colors"
                        title="Editar jogador"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemovePlayer(player.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        title="Remover jogador"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

