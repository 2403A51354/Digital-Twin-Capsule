import { useState, useEffect, useCallback } from 'react';
import { Capsule } from '../types';
import { capsulesApi, checkBackendHealth } from '../services/api';

const LOCAL_STORAGE_KEY = 'chronovault_capsules';

export const useCapsules = (userId?: string) => {
  const [capsules, setCapsules] = useState<Capsule[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);

  // Sync to local storage for instant offline availability
  useEffect(() => {
    if (capsules.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(capsules));
    }
  }, [capsules]);

  // Fetch capsules from the backend API
  const fetchCapsules = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const isOnline = await checkBackendHealth();
      setBackendOnline(isOnline);

      if (isOnline) {
        const remoteCapsules = await capsulesApi.getAll();
        setCapsules(remoteCapsules);
      } else {
        console.warn('Backend currently offline, using local cached capsules.');
      }
    } catch (err: any) {
      console.error('Failed to fetch capsules from API:', err);
      setError(err.message || 'Error connecting to capsules service');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCapsules();
  }, [fetchCapsules]);

  // Create capsule through backend API
  const createCapsule = async (
    data: Partial<Capsule>,
    files: File[]
  ): Promise<Capsule> => {
    try {
      if (backendOnline) {
        // Build multipart/form-data payload
        const formData = new FormData();
        formData.append('title', data.title || '');
        formData.append('description', data.description || '');
        formData.append('message', data.message || '');
        formData.append('category', data.category || 'Personal');
        formData.append('opening_date', data.opening_date || '');
        formData.append('timezone', data.timezone || 'UTC');

        files.forEach((file) => {
          formData.append('files', file);
        });

        const created = await capsulesApi.create(formData);
        setCapsules((prev) => [created, ...prev]);
        return created;
      } else {
        // Fallback for offline mode
        const localId = 'cap_' + Date.now();
        const fallbackCapsule: Capsule = {
          id: localId,
          user_id: userId || 'usr_demo',
          title: data.title || 'Untitled Capsule',
          description: data.description || '',
          message: data.message || '',
          category: data.category || 'Personal',
          created_at: new Date().toISOString(),
          opening_date: data.opening_date || new Date().toISOString(),
          timezone: data.timezone || 'UTC',
          status: 'locked',
          files_count: files.length,
          files: files.map((f, i) => ({
            id: `f_${localId}_${i}`,
            capsule_id: localId,
            file_name: f.name,
            file_type: f.type,
            file_size: f.size,
            storage_path: `capsules/${localId}/${f.name}`,
            uploaded_at: new Date().toISOString(),
          })),
        };

        setCapsules((prev) => [fallbackCapsule, ...prev]);
        return fallbackCapsule;
      }
    } catch (err: any) {
      console.error('Error creating capsule:', err);
      throw err;
    }
  };

  // Open capsule through backend API
  const openCapsule = async (capsule: Capsule): Promise<Capsule> => {
    try {
      if (backendOnline) {
        const unsealed = await capsulesApi.open(capsule.id);
        setCapsules((prev) =>
          prev.map((c) => (c.id === capsule.id ? unsealed : c))
        );
        return unsealed;
      } else {
        // Offline unseal fallback
        const unsealed: Capsule = {
          ...capsule,
          status: 'opened',
          opened_at: new Date().toISOString(),
        };
        setCapsules((prev) =>
          prev.map((c) => (c.id === capsule.id ? unsealed : c))
        );
        return unsealed;
      }
    } catch (err: any) {
      console.error('Error opening capsule:', err);
      throw err;
    }
  };

  // Delete capsule through backend API
  const deleteCapsule = async (id: string): Promise<void> => {
    try {
      if (backendOnline) {
        await capsulesApi.delete(id);
      }
      setCapsules((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      console.error('Error deleting capsule:', err);
      throw err;
    }
  };

  return {
    capsules,
    loading,
    error,
    backendOnline,
    refreshCapsules: fetchCapsules,
    createCapsule,
    openCapsule,
    deleteCapsule,
  };
};
