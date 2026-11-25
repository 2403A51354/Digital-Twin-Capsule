export type CapsuleCategory = 'Personal' | 'Friends' | 'Family' | 'Education' | 'Travel' | 'Career' | 'Love';

export type CapsuleStatus = 'locked' | 'opened';

export interface CapsuleFile {
  id: string;
  capsule_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  uploaded_at: string;
  url?: string;
}

export interface Capsule {
  id: string;
  user_id: string;
  title: string;
  description: string;
  message?: string; // Hidden on server when locked
  category: CapsuleCategory;
  created_at: string;
  opening_date: string;
  timezone: string;
  status: CapsuleStatus;
  opened_at?: string | null;
  files?: CapsuleFile[];
  files_count?: number;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at?: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  capsule_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  capsule_title?: string;
}
