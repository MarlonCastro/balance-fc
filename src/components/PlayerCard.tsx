import { useState, useEffect } from 'react';
import type { Player } from '../types';

// Interface para compatibilidade com dados antigos
interface PlayerWithLegacyWeight extends Player {
  weight?: number;
}

interface PlayerCardProps {
  player: Player & { isParticipating?: boolean };
  onUpdateSkills: (playerId: string, skills: { speed?: number; physicalCondition?: number; skillRating?: number }) => void;
  onToggleParticipation: (playerId: string) => void;
  onCalculateOverall: (player: Player) => number;
  onToggleRecurring?: (playerId: string) => void;
  onRemovePlayer?: (playerId: string) => void;
  showRemoveButton?: boolean;
}

export function PlayerCard({
  player,
  onUpdateSkills,
  onToggleParticipation,
  onCalculateOverall,
  onToggleRecurring,
  onRemovePlayer,
  showRemoveButton = false,
}: PlayerCardProps) {
  // Support both old weight and new physicalCondition for backward compatibility
  const playerWithLegacy = player as PlayerWithLegacyWeight;
  const physicalConditionValue = player.physicalCondition ?? playerWithLegacy.weight;
  const [speed, setSpeed] = useState(player.speed?.toString() || '');
  const [physicalCondition, setPhysicalCondition] = useState(physicalConditionValue?.toString() || '');
  const [skillRating, setSkillRating] = useState(player.skillRating?.toString() || '');
  const [isRecurring, setIsRecurring] = useState(player.isRecurring !== false);
  const [isParticipating, setIsParticipating] = useState(
    player.isParticipating !== false && (player.isRecurring !== false)
  );

  useEffect(() => {
    setSpeed(player.speed?.toString() || '');
    const pcValue = player.physicalCondition ?? playerWithLegacy.weight;
    setPhysicalCondition(pcValue?.toString() || '');
    setSkillRating(player.skillRating?.toString() || '');
    const recurring = player.isRecurring !== false;
    setIsRecurring(recurring);
    // Se não for recorrente, não pode participar
    setIsParticipating(player.isParticipating !== false && recurring);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player]);

  const handleSkillChange = (skill: 'speed' | 'physicalCondition' | 'skillRating', value: string) => {
    const numValue = value === '' ? undefined : Math.max(1, Math.min(5, parseFloat(value) || 1));

    if (skill === 'speed') setSpeed(value);
    if (skill === 'physicalCondition') setPhysicalCondition(value);
    if (skill === 'skillRating') setSkillRating(value);

    onUpdateSkills(player.id, {
      ...player,
      [skill]: numValue,
    });
  };

  const handleToggleParticipation = () => {
    // Só pode participar se for recorrente
    if (!isRecurring) return;
    setIsParticipating(!isParticipating);
    onToggleParticipation(player.id);
  };

  const handleToggleRecurring = () => {
    const newRecurring = !isRecurring;
    setIsRecurring(newRecurring);
    if (onToggleRecurring) {
      onToggleRecurring(player.id);
    }
    // Se marcar como não recorrente, desativar participação automaticamente
    if (!newRecurring && isParticipating) {
      setIsParticipating(false);
      onToggleParticipation(player.id);
    }
  };

  const handleRemovePlayer = () => {
    if (onRemovePlayer && confirm(`Tem certeza que deseja remover ${player.name} desta pelada?`)) {
      onRemovePlayer(player.id);
    }
  };

  const overallRating = onCalculateOverall(player);
  const ratingBgColor = overallRating >= 3.5 ? 'bg-green-100' : overallRating >= 2.5 ? 'bg-yellow-100' : 'bg-red-100';
  const ratingTextColor = overallRating >= 3.5 ? 'text-green-800' : overallRating >= 2.5 ? 'text-yellow-800' : 'text-red-800';

  return (
    <div
      className={`relative bg-white dark:bg-gray-800 rounded-xl border-2 transition-all duration-200 ${isParticipating
        ? 'border-indigo-200 dark:border-indigo-700 shadow-md hover:shadow-lg'
        : 'border-gray-200 dark:border-gray-700 opacity-60'
        }`}
    >
      {/* Top Right Controls */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        {showRemoveButton && onRemovePlayer && (
          <button
            onClick={handleRemovePlayer}
            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
            title="Remover jogador da pelada"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isParticipating}
            onChange={handleToggleParticipation}
            disabled={!isRecurring}
            className="sr-only peer"
          />
          <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 ${!isRecurring ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
        </label>
      </div>

      <div className="p-5">
        {/* Player Name and Overall Rating */}
        <div className="mb-4 pr-20">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{player.name}</h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Avaliação Geral:</span>
            <div className={`px-3 py-1 rounded-full ${ratingBgColor} ${ratingTextColor} font-bold text-sm`}>
              {overallRating.toFixed(1)}
            </div>
          </div>
          {/* Recurring Checkbox */}
          {onToggleRecurring && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={handleToggleRecurring}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">Jogador Recorrente</span>
            </label>
          )}
        </div>

        {/* Skills Inputs */}
        <div className="space-y-4">
          {/* Speed */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              ⚡ Velocidade (1-5)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={speed || 1}
                onChange={(e) => handleSkillChange('speed', e.target.value)}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <input
                type="number"
                min="1"
                max="5"
                step="0.5"
                value={speed}
                onChange={(e) => handleSkillChange('speed', e.target.value)}
                className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Physical Condition */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              💪 Condicionamento Físico (1-5)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={physicalCondition || 1}
                onChange={(e) => handleSkillChange('physicalCondition', e.target.value)}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <input
                type="number"
                min="1"
                max="5"
                step="0.5"
                value={physicalCondition}
                onChange={(e) => handleSkillChange('physicalCondition', e.target.value)}
                className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Skill Rating */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              ⭐ Avaliação Geral (1-5)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={skillRating || 1}
                onChange={(e) => handleSkillChange('skillRating', e.target.value)}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <input
                type="number"
                min="1"
                max="5"
                step="0.5"
                value={skillRating}
                onChange={(e) => handleSkillChange('skillRating', e.target.value)}
                className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Participation Status */}
        {!isParticipating && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center italic">
              {!isRecurring ? 'Jogador não recorrente' : 'Excluído do sorteio'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

