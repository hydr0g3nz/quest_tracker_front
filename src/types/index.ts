export enum QuestStatus {
  Open = "Open",
  InJourney = "InJourney",
  Completed = "Completed",
  Failed = "Failed",
}

export enum UserRole {
  Adventurer = "Adventurer",
  GuildCommander = "GuildCommander",
}

export interface Quest {
  id: number;
  name: string;
  description?: string;
  status: QuestStatus;
  guild_commander_id: number;
  adventurers_count: number;
  created_at: string;
  updated_at: string;
}

export interface AdventurerViewModel {
  id: number;
  username: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  // Any additional registration fields if needed
  name: string;
}

export interface Passport {
  access_token: string;
  refresh_token: string;
}

export interface BoardCheckingFilter {
  name?: string;
  status?: QuestStatus;
}