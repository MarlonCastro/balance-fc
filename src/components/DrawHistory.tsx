import type { Team, Player } from '../types';
import { calculateOverallSkill } from '../utils/balancingAlgorithm';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface DrawHistoryItem {
  id: string;
  teams: Team[];
  difference: number;
  algorithm: string;
  timestamp: string;
  playerCount: number;
}

interface DrawHistoryProps {
  history: DrawHistoryItem[];
  onRedraw: (teams: Team[]) => void;
  players: Player[];
}

export function DrawHistory({ history, onRedraw, players }: DrawHistoryProps) {
  if (history.length === 0) {
    return (
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Nenhum histórico de sorteio</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Sorteie times para ver o histórico aqui
          </p>
        </div>
      </Card>
    );
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('pt-BR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getBalanceColor = (difference: number) => {
    if (difference < 5) return 'text-green-600 dark:text-green-400';
    if (difference < 10) return 'text-blue-600 dark:text-blue-400';
    if (difference < 20) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <Card title="Histórico de Sorteios" variant="elevated">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Data
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Times
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Jogadores
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Algoritmo
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Balanceamento
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {history.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(item.timestamp)}
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">
                  {item.teams.length}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                  {item.playerCount}
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 capitalize">
                    {item.algorithm === 'greedy' ? 'Greedy' : 'Ótimo'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`text-sm font-semibold ${getBalanceColor(item.difference)}`}>
                    {item.difference.toFixed(1)}%
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRedraw(item.teams)}
                  >
                    Refazer
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

