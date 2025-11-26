import type { Team, Player } from '../types';
import { calculateTeamDifference, calculateOverallSkill } from '../utils/balancingAlgorithm';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface DrawResultsProps {
  teams: Team[];
  onNewDraw: () => void;
  isDrawing?: boolean;
  algorithm?: string;
}

const TEAM_COLORS = [
  {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    text: 'text-blue-900',
    accent: 'bg-blue-600',
    light: 'bg-blue-100',
  },
  {
    bg: 'bg-red-50',
    border: 'border-red-300',
    text: 'text-red-900',
    accent: 'bg-red-600',
    light: 'bg-red-100',
  },
  {
    bg: 'bg-green-50',
    border: 'border-green-300',
    text: 'text-green-900',
    accent: 'bg-green-600',
    light: 'bg-green-100',
  },
  {
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
    text: 'text-yellow-900',
    accent: 'bg-yellow-600',
    light: 'bg-yellow-100',
  },
  {
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    text: 'text-purple-900',
    accent: 'bg-purple-600',
    light: 'bg-purple-100',
  },
];

export function DrawResults({ teams, onNewDraw, isDrawing = false, algorithm }: DrawResultsProps) {
  if (teams.length === 0) {
    return null;
  }

  const difference = calculateTeamDifference(teams);
  const totalSkill = teams.reduce((sum, team) => sum + team.totalSkills, 0);
  const avgSkill = totalSkill / teams.length;
  const maxSkill = Math.max(...teams.map((t) => t.totalSkills));
  const minSkill = Math.min(...teams.map((t) => t.totalSkills));

  const getBalanceStatus = () => {
    if (difference < 5) return { label: 'Excelente', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/20' };
    if (difference < 10) return { label: 'Bom', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/20' };
    if (difference < 20) return { label: 'Razoável', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/20' };
    return { label: 'Desequilibrado', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/20' };
  };

  const balanceStatus = getBalanceStatus();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Teams Grid - First Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team, index) => {
          const colorScheme = TEAM_COLORS[index % TEAM_COLORS.length];
          const teamSkill = team.totalSkills;
          const skillPercentage = (teamSkill / maxSkill) * 100;

          return (
            <Card
              key={index}
              variant="elevated"
              className={`${colorScheme.bg} border-2 ${colorScheme.border} transition-all duration-300 hover:shadow-xl`}
            >
              <div className="space-y-4">
                {/* Team Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-2xl font-bold ${colorScheme.text} mb-1`}>
                      Time {index + 1}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {team.players.length} {team.players.length === 1 ? 'jogador' : 'jogadores'}
                    </p>
                  </div>
                  <div className={`${colorScheme.accent} text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-lg`}>
                    {index + 1}
                  </div>
                </div>

                {/* Skill Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Habilidade Total</span>
                    <span className={`text-lg font-bold ${colorScheme.text}`}>
                      {teamSkill.toFixed(1)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`${colorScheme.accent} h-full transition-all duration-500 ease-out`}
                      style={{ width: `${skillPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Players List */}
                <div className="space-y-2">
                  {team.players.map((player) => {
                    const playerSkill = calculateOverallSkill(player);
                    return (
                      <div
                        key={player.id}
                        className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {player.name}
                            </p>
                            <div className="flex gap-2 mt-1">
                              {player.skillRating !== undefined && (
                                <span className="text-xs text-gray-500">
                                  ⭐ {player.skillRating}
                                </span>
                              )}
                              {player.speed !== undefined && (
                                <span className="text-xs text-gray-500">
                                  ⚡ {player.speed}
                                </span>
                              )}
                              {(player.physicalCondition ?? (player as any).weight) !== undefined && (
                                <span className="text-xs text-gray-500">
                                  💪 {(player.physicalCondition ?? (player as any).weight)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className={`ml-3 px-2 py-1 ${colorScheme.light} rounded text-xs font-bold ${colorScheme.text}`}>
                            {playerSkill.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Team Stats */}
                <div className="pt-3 border-t border-gray-300 dark:border-gray-600">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Avaliação Média</p>
                      <p className={`font-bold ${colorScheme.text}`}>
                        {(teamSkill / team.players.length).toFixed(1)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">vs Média</p>
                      <p className={`font-bold ${teamSkill >= avgSkill ? 'text-green-600' : 'text-red-600'}`}>
                        {teamSkill >= avgSkill ? '+' : ''}
                        {(teamSkill - avgSkill).toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Balance Comparison */}
      {teams.length === 2 && (
        <Card variant="outlined" className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Comparação de Balanceamento</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Diferença de habilidade: {Math.abs(teams[0].totalSkills - teams[1].totalSkills).toFixed(1)} pontos
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Time 1</p>
                <p className="text-2xl font-bold text-blue-600">{teams[0].totalSkills.toFixed(1)}</p>
              </div>
              <div className="text-gray-400 text-2xl">vs</div>
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Time 2</p>
                <p className="text-2xl font-bold text-red-600">{teams[1].totalSkills.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Summary Card - Last Priority */}
      <Card variant="elevated" className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Times</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{teams.length}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Habilidade Média</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgSkill.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Diferença</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{difference.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Balanceamento</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${balanceStatus.bg} ${balanceStatus.color}`}>
              {balanceStatus.label}
            </span>
          </div>
        </div>

        {algorithm && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Algoritmo: <span className="font-semibold text-gray-900 dark:text-white capitalize">{algorithm === 'greedy' ? 'Greedy' : 'Ótimo'}</span>
            </p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <Button
            variant="primary"
            onClick={onNewDraw}
            isLoading={isDrawing}
            disabled={isDrawing}
          >
            Novo Sorteio
          </Button>
        </div>
      </Card>
    </div>
  );
}

