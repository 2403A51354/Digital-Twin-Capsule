import { supabase, isSupabaseConfigured } from './supabase';
import { UserProfile } from '../types';

export const authService = {
  /**
   * Register a new user with Supabase Auth
   */
  async signUp(email: string, password: string, fullName: string): Promise<UserProfile> {
    if (!isSupabaseConfigured()) {
      // Offline/Local Demo Fallback
      const mockUser: UserProfile = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        email,
        full_name: fullName,
        created_at: new Date().toISOString(),
      };
      localStorage.setItem('chronovault_user', JSON.stringify(mockUser));
      return mockUser;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Registration failed. Please check your details.');
    }

    const userProfile: UserProfile = {
      id: data.user.id,
      email: data.user.email || email,
      full_name: fullName,
      created_at: data.user.created_at,
    };

    localStorage.setItem('chronovault_user', JSON.stringify(userProfile));
    return userProfile;
  },

  /**
   * Sign in an existing user with email and password
   */
  async signIn(email: string, password: string): Promise<UserProfile> {
    if (!isSupabaseConfigured()) {
      // Offline/Local Demo Fallback
      const mockUser: UserProfile = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        email,
        full_name: email.split('@')[0] || 'Chrono Traveler',
        created_at: new Date().toISOString(),
      };
      localStorage.setItem('chronovault_user', JSON.stringify(mockUser));
      return mockUser;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('No user returned from login.');
    }

    // Attempt to read profile from public.profiles table
    let fullName = data.user.user_metadata?.full_name || email.split('@')[0];

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', data.user.id)
        .single();

      if (profile?.full_name) {
        fullName = profile.full_name;
      }
    } catch (e) {
      // Profile lookup failed or table not populated yet, use metadata
    }

    const userProfile: UserProfile = {
      id: data.user.id,
      email: data.user.email || email,
      full_name: fullName,
      avatar_url: data.user.user_metadata?.avatar_url,
      created_at: data.user.created_at,
    };

    localStorage.setItem('chronovault_user', JSON.stringify(userProfile));
    return userProfile;
  },

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    localStorage.removeItem('chronovault_user');
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
  },

  /**
   * Get current Supabase session
   */
  async getSession() {
    if (!isSupabaseConfigured()) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  /**
   * Get current JWT access token for API requests to backend
   */
  async getAccessToken(): Promise<string | null> {
    if (!isSupabaseConfigured()) return 'demo-token';
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  },

  /**
   * Update user password
   */
  async updatePassword(newPassword: string): Promise<void> {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw new Error(error.message);
  },

  /**
   * Update user metadata / profile
   */
  async updateProfile(userId: string, updates: { full_name?: string }): Promise<void> {
    if (!isSupabaseConfigured()) return;

    // Update in Supabase auth metadata
    if (updates.full_name) {
      await supabase.auth.updateUser({
        data: { full_name: updates.full_name },
      });

      // Update in public.profiles table
      await supabase
        .from('profiles')
        .update({ full_name: updates.full_name })
        .eq('id', userId);
    }
  },
};
