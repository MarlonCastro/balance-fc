import type { Team } from '../types';

/**
 * Formata os times em um texto copiável para WhatsApp
 */
export function formatTeamsForWhatsApp(teams: Team[], matchName?: string): string {
  let text = '';

  if (matchName) {
    text += `⚽ *${matchName}*\n\n`;
  }

  text += '📋 *TIMES SORTEADOS*\n\n';

  teams.forEach((team, index) => {
    text += `*Time ${index + 1}* ⚽\n`;
    
    team.players.forEach((player, playerIndex) => {
      text += `${playerIndex + 1}. ${player.name}\n`;
    });

    if (index < teams.length - 1) {
      text += '\n';
    }
  });

  text += '\n✅ Boa pelada para todos!';

  return text;
}

