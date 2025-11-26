import { useState } from 'react';
import type { Player } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface PlayersListProps {
  players: Player[];
  onEdit: (playerId: string) => void;
  onDelete: (playerId: string) => void;
  onUpdate: (playerId: string, updates: Partial<Player>) => void;
  isLoading?: boolean;
}

export function PlayersList({
  players,
  onEdit,
  onDelete,
  onUpdate,
  isLoading = false,
}: PlayersListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSkill, setEditSkill] = useState<string>('');
  const [editSpeed, setEditSpeed] = useState<string>('');
  const [editPhysicalCondition, setEditPhysicalCondition] = useState<string>('');

  const handleStartEdit = (player: Player) => {
    setEditingId(player.id);
    setEditName(player.name);
    setEditSkill(player.skillRating?.toString() || '');
    setEditSpeed(player.speed?.toString() || '');
    const pcValue = player.physicalCondition ?? (player as any).weight;
    setEditPhysicalCondition(pcValue?.toString() || '');
  };

  const handleSaveEdit = (playerId: string) => {
    const updates: Partial<Player> = {
      name: editName.trim(),
    };

    if (editSkill.trim()) {
      updates.skillRating = parseFloat(editSkill);
    }
    if (editSpeed.trim()) {
      updates.speed = parseFloat(editSpeed);
    }
    if (editPhysicalCondition.trim()) {
      updates.physicalCondition = parseFloat(editPhysicalCondition);
    }

    onUpdate(playerId, updates);
    setEditingId(null);
    setEditName('');
    setEditSkill('');
    setEditSpeed('');
    setEditWeight('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditSkill('');
    setEditSpeed('');
    setEditWeight('');
  };

  if (players.length === 0) {
    return (
      <Card variant="outlined">
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Nenhum jogador cadastrado ainda</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Adicione jogadores usando o formulário de cadastro acima
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Jogadores Cadastrados"
      headerActions={
        <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full font-medium">
          {players.length} {players.length === 1 ? 'jogador' : 'jogadores'}
        </span>
      }
      variant="elevated"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map((player) => (
          <div
            key={player.id}
            className="group relative bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-indigo-300 transition-all duration-200"
          >
            {editingId === player.id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium"
                  placeholder="Nome do jogador"
                  autoFocus
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    value={editSkill}
                    onChange={(e) => setEditSkill(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                    placeholder="Habilidade"
                    min="0"
                    max="10"
                    step="0.1"
                  />
                  <input
                    type="number"
                    value={editSpeed}
                    onChange={(e) => setEditSpeed(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                    placeholder="Velocidade"
                    min="0"
                    step="0.1"
                  />
                  <input
                    type="number"
                    value={editPhysicalCondition}
                    onChange={(e) => setEditPhysicalCondition(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                    placeholder="Condicionamento Físico"
                    min="0"
                    max="5"
                    step="0.5"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleSaveEdit(player.id)}
                    className="flex-1"
                  >
                    Salvar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 text-base leading-tight">
                    {player.name}
                  </h4>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleStartEdit(player)}
                      className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-colors"
                      title="Editar jogador"
                    >
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(player.id)}
                      className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                      title="Excluir jogador"
                    >
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {(player.skillRating !== undefined ||
                  player.speed !== undefined ||
                  (player.physicalCondition ?? (player as any).weight) !== undefined) && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {player.skillRating !== undefined && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
                        ⭐ Habilidade: {player.skillRating}
                      </span>
                    )}
                    {player.speed !== undefined && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">
                        ⚡ Velocidade: {player.speed}
                      </span>
                    )}
                    {(player.physicalCondition ?? (player as any).weight) !== undefined && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                        💪 Condicionamento: {player.physicalCondition ?? (player as any).weight}
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

