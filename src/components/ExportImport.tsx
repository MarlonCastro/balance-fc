import { useRef } from 'react';
import type { Match, Player, Team } from '../types';
import { exportData, importData, downloadFile, readFile } from '../utils/exportImport';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Modal } from './ui/Modal';
import { useState } from 'react';

interface ExportImportProps {
  matches: Match[];
  players: Player[];
  teams: Team[];
  onImport: (data: { matches: Match[]; players: Player[]; teams: Team[] }) => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function ExportImport({
  matches,
  players,
  teams,
  onImport,
  onSuccess,
  onError,
}: ExportImportProps) {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const data = exportData(matches, players, teams);
      const filename = `balance-fc-export-${new Date().toISOString().split('T')[0]}.json`;
      downloadFile(data, filename);
      onSuccess?.('Dados exportados com sucesso!');
    } catch (error) {
      onError?.('Falha ao exportar dados');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await readFile(file);
      const data = importData(content);

      if (!data) {
        onError?.('Formato de arquivo inválido');
        return;
      }

      onImport({
        matches: data.matches,
        players: data.players,
        teams: data.teams,
      });

      setIsImportModalOpen(false);
      onSuccess?.('Dados importados com sucesso!');
    } catch (error) {
      onError?.('Falha ao importar dados');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card variant="outlined" title="Gerenciamento de Dados">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Exporte ou importe os dados das suas peladas, jogadores e times
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="primary" onClick={handleExport} className="flex-1">
              Exportar Dados
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsImportModalOpen(true)}
              className="flex-1"
            >
              Importar Dados
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <strong>Exportar:</strong> Baixa um arquivo JSON com todos os seus dados
            <br />
            <strong>Importar:</strong> Restaura dados de um arquivo previamente exportado
          </p>
        </div>
      </div>

      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Importar Dados"
        confirmText="Importar"
        onConfirm={() => fileInputRef.current?.click()}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Selecione um arquivo JSON previamente exportado do Balance FC. Isso substituirá seus dados atuais.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ Aviso: A importação substituirá todos os dados atuais. Certifique-se de exportar seus dados atuais primeiro se quiser mantê-los.
            </p>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

