import { authService } from './auth';
import { Capsule, NotificationItem } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await authService.getAccessToken();

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    let errorMessage = `API Request failed with status ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson.error) errorMessage = errorJson.error;
    } catch {
      // Non-JSON response
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export const capsulesApi = {
  async getAll(): Promise<Capsule[]> {
    const data = await apiRequest<{ capsules: Capsule[] }>('/capsules');
    return data.capsules;
  },

  async getById(id: string): Promise<Capsule> {
    const data = await apiRequest<{ capsule: Capsule }>(`/capsules/${id}`);
    return data.capsule;
  },

  async create(formData: FormData): Promise<Capsule> {
    const data = await apiRequest<{ message: string; capsule: Capsule }>('/capsules', {
      method: 'POST',
      body: formData,
    });
    return data.capsule;
  },

  async update(id: string, updates: Partial<Capsule>): Promise<Capsule> {
    const data = await apiRequest<{ message: string; capsule: Capsule }>(`/capsules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.capsule;
  },

  async delete(id: string): Promise<void> {
    await apiRequest<{ message: string }>(`/capsules/${id}`, {
      method: 'DELETE',
    });
  },

  async open(id: string): Promise<Capsule> {
    const data = await apiRequest<{ message: string; capsule: Capsule }>(`/capsules/${id}/open`, {
      method: 'POST',
    });
    return data.capsule;
  },
};

export const notificationsApi = {
  async getAll(): Promise<NotificationItem[]> {
    const data = await apiRequest<{ notifications: NotificationItem[] }>('/notifications');
    return data.notifications;
  },

  async markAsRead(id: string): Promise<void> {
    await apiRequest(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  async markAllRead(): Promise<void> {
    await apiRequest('/notifications/read-all', {
      method: 'PUT',
    });
  },

  async delete(id: string): Promise<void> {
    await apiRequest(`/notifications/${id}`, {
      method: 'DELETE',
    });
  },

  async clearAll(): Promise<void> {
    await apiRequest('/notifications', {
      method: 'DELETE',
    });
  },
};

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    return res.ok;
  } catch {
    return false;
  }
};
