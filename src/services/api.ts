import { BoardCheckingFilter, LoginCredentials, Quest, RegisterCredentials } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090";

// Helper function for making fetch requests
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    credentials: "include", // Include cookies in the request
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || response.statusText);
  }

  // Check if the response is JSON
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

// Authentication
export const authAPI = {
  adventurerLogin: (credentials: LoginCredentials) =>
    fetchAPI("/authentication/adventurers/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  guildCommanderLogin: (credentials: LoginCredentials) =>
    fetchAPI("/authentication/guild-commanders/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  adventurerRefreshToken: () =>
    fetchAPI("/authentication/adventurers/refresh-token", {
      method: "POST",
    }),

  guildCommanderRefreshToken: () =>
    fetchAPI("/authentication/guild-commanders/refresh-token", {
      method: "POST",
    }),

  registerAdventurer: (data: RegisterCredentials) =>
    fetchAPI("/adventurers", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  registerGuildCommander: (data: RegisterCredentials) =>
    fetchAPI("/guild-commanders", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Quest Operations for Guild Commanders
export const questOpsAPI = {
  addQuest: (data: { name: string; description?: string }) =>
    fetchAPI("/quest-ops", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  editQuest: (questId: number, data: { name: string; description?: string }) =>
    fetchAPI(`/quest-ops/${questId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  removeQuest: (questId: number) =>
    fetchAPI(`/quest-ops/${questId}`, {
      method: "DELETE",
    }),
};

// Quest Viewing
export const questViewingAPI = {
  viewQuestDetails: (questId: number): Promise<Quest> =>
    fetchAPI(`/quest-viewing/${questId}`),

  boardChecking: (filter: BoardCheckingFilter = {}): Promise<Quest[]> => {
    const params = new URLSearchParams();
    if (filter.name) params.append("name", filter.name);
    if (filter.status) params.append("status", filter.status);
    
    return fetchAPI(`/quest-viewing/board-checking?${params.toString()}`);
  },
};

// Crew Switchboard for Adventurers
export const crewSwitchboardAPI = {
  joinQuest: (questId: number) =>
    fetchAPI(`/crew-switchboard/join/${questId}`, {
      method: "POST",
    }),

  leaveQuest: (questId: number) =>
    fetchAPI(`/crew-switchboard/leave/${questId}`, {
      method: "DELETE",
    }),
};

// Journey Ledger for Guild Commanders
export const journeyLedgerAPI = {
  inJourney: (questId: number) =>
    fetchAPI(`/journey-ledger/in-journey/${questId}`, {
      method: "PATCH",
    }),

  toCompleted: (questId: number) =>
    fetchAPI(`/journey-ledger/to-completed/${questId}`, {
      method: "PATCH",
    }),

  toFailed: (questId: number) =>
    fetchAPI(`/journey-ledger/to-failed/${questId}`, {
      method: "PATCH",
    }),
};
