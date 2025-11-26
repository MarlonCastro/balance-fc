export interface Player {
  id: string;
  name: string;
  matchId?: string; // Link player to a specific match
  speed?: number;
  physicalCondition?: number; // Renamed from weight
  skillRating?: number;
  isParticipating?: boolean; // For draw participation
  isRecurring?: boolean; // Jogador recorrente (participa regularmente)
}

export interface Team {
  players: Player[];
  totalSkills: number;
}

export interface Match {
  id: string;
  name: string;
  day: string;
  time: string;
  numberOfPeople: number;
}

export interface DrawConfiguration {
  matchId: string;
  numberOfTeams: number;
  balanceBySkill: boolean;
  balanceByWeight: boolean;
  balanceBySpeed: boolean;
  createdAt: string;
}
