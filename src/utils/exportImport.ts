import type { Match, Player, Team } from '../types';

export interface ExportData {
  matches: Match[];
  players: Player[];
  teams: Team[];
  exportedAt: string;
  version: string;
}

const CURRENT_VERSION = '1.0.0';

export function exportData(matches: Match[], players: Player[], teams: Team[]): string {
  const data: ExportData = {
    matches,
    players,
    teams,
    exportedAt: new Date().toISOString(),
    version: CURRENT_VERSION,
  };

  return JSON.stringify(data, null, 2);
}

export function importData(jsonString: string): ExportData | null {
  try {
    const data: ExportData = JSON.parse(jsonString);

    // Validate structure
    if (!data.matches || !data.players || !data.teams) {
      throw new Error('Invalid data structure');
    }

    // Check version compatibility
    if (data.version !== CURRENT_VERSION) {
      console.warn(`Version mismatch: ${data.version} vs ${CURRENT_VERSION}`);
    }

    return data;
  } catch (error) {
    console.error('Import error:', error);
    return null;
  }
}

export function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

