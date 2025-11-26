import type { Player } from '../types';
import { PlayerCard } from './PlayerCard';
import { Card } from './ui/Card';

interface SkillsConfigurationProps {
  players: (Player & { isParticipating?: boolean })[];
  onUpdateSkills: (playerId: string, skills: { speed?: number; physicalCondition?: number; skillRating?: number }) => void;
  onToggleParticipation: (playerId: string) => void;
  onToggleRecurring?: (playerId: string) => void;
  onRemovePlayer?: (playerId: string) => void;
  onCalculateOverall: (player: Player) => number;
  isLoading?: boolean;
  showRemoveButton?: boolean;
}

export function SkillsConfiguration({
  players,
  onUpdateSkills,
  onToggleParticipation,
  onToggleRecurring,
  onRemovePlayer,
  onCalculateOverall,
  isLoading = false,
  showRemoveButton = false,
}: SkillsConfigurationProps) {
  const participatingCount = players.filter((p) => p.isParticipating !== false).length;
  const excludedCount = players.length - participatingCount;

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
          <p className="text-gray-500 dark:text-gray-400 font-medium">Nenhum jogador cadastrado</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Adicione jogadores na página de Configuração primeiro
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Configuração de Habilidades"
      subtitle="Configure as habilidades dos jogadores e status de participação"
      headerActions={
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-gray-600">
              {participatingCount} Participando
            </span>
          </div>
          {excludedCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              <span className="text-gray-600 dark:text-gray-400">{excludedCount} Excluídos</span>
            </div>
          )}
        </div>
      }
      variant="elevated"
    >
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Carregando jogadores...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              onUpdateSkills={onUpdateSkills}
              onToggleParticipation={onToggleParticipation}
              onToggleRecurring={onToggleRecurring}
              onRemovePlayer={onRemovePlayer}
              onCalculateOverall={onCalculateOverall}
              showRemoveButton={showRemoveButton}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

