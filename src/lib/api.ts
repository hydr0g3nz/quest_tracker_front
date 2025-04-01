import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth services
export const authService = {
  // Adventurer auth
  adventurerLogin: async (username: string, password: string) => {
    return await api.post('/authentication/adventurers/login', { username, password });
  },
  adventurerRegister: async (username: string, password: string) => {
    return await api.post('/adventurers', { username, password });
  },
  adventurerRefreshToken: async () => {
    return await api.post('/authentication/adventurers/refresh-token');
  },

  // Guild Commander auth
  guildCommanderLogin: async (username: string, password: string) => {
    return await api.post('/authentication/guild-commanders/login', { username, password });
  },
  guildCommanderRegister: async (username: string, password: string) => {
    return await api.post('/guild-commanders', { username, password });
  },
  guildCommanderRefreshToken: async () => {
    return await api.post('/authentication/guild-commanders/refresh-token');
  },
};

// Quest types
export interface Quest {
  id: number;
  name: string;
  description?: string;
  status: 'Open' | 'InJourney' | 'Completed' | 'Failed';
  guild_commander_id: number;
  adventurers_count: number;
  created_at: string;
  updated_at: string;
}

export interface QuestFilter {
  name?: string;
  status?: string;
}

// Quest services
export const questService = {
  // Quest viewing (public)
  getQuest: async (questId: number) => {
    return await api.get<Quest>(`/quest-viewing/${questId}`);
  },
  getQuests: async (filter: QuestFilter = {}) => {
    return await api.get<Quest[]>('/quest-viewing/board-checking', { params: filter });
  },

  // Quest operations (Guild Commander only)
  createQuest: async (name: string, description?: string) => {
    return await api.post('/quest-ops', { name, description });
  },
  updateQuest: async (questId: number, name: string, description?: string) => {
    return await api.patch(`/quest-ops/${questId}`, { name, description });
  },
  deleteQuest: async (questId: number) => {
    return await api.delete(`/quest-ops/${questId}`);
  },

  // Journey ledger operations (Guild Commander only)
  setQuestInJourney: async (questId: number) => {
    return await api.patch(`/journey-ledger/in-journey/${questId}`);
  },
  setQuestCompleted: async (questId: number) => {
    return await api.patch(`/journey-ledger/to-completed/${questId}`);
  },
  setQuestFailed: async (questId: number) => {
    return await api.patch(`/journey-ledger/to-failed/${questId}`);
  },

  // Crew switchboard operations (Adventurer only)
  joinQuest: async (questId: number) => {
    return await api.post(`/crew-switchboard/join/${questId}`);
  },
  leaveQuest: async (questId: number) => {
    return await api.delete(`/crew-switchboard/leave/${questId}`);
  },
};

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't already tried to refresh
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try both token refresh methods (we'll determine user type from cookies)
        try {
          await authService.adventurerRefreshToken();
        } catch {
          await authService.guildCommanderRefreshToken();
        }
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
