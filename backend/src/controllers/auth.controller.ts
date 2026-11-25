import { Request, Response } from 'express';
import { getSupabase } from '../services/supabase.service.js';
import { isBackendSupabaseConfigured } from '../config/env.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const authController = {
  /**
   * Register user endpoint
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, full_name } = req.body;

      if (!email || !password || !full_name) {
        res.status(400).json({ error: 'Full name, email, and password are required.' });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters.' });
        return;
      }

      if (!isBackendSupabaseConfigured()) {
        res.status(201).json({
          message: 'User registered successfully (Demo Mode)',
          user: {
            id: 'usr_' + Date.now(),
            email,
            full_name,
          },
          token: 'demo-token-' + Date.now(),
        });
        return;
      }

      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name },
        },
      });

      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }

      res.status(201).json({
        message: 'User registered successfully.',
        user: {
          id: data.user?.id,
          email: data.user?.email,
          full_name,
        },
        session: data.session,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Registration failed.' });
    }
  },

  /**
   * Login user endpoint
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required.' });
        return;
      }

      if (!isBackendSupabaseConfigured()) {
        res.status(200).json({
          message: 'Login successful (Demo Mode)',
          user: {
            id: 'usr_demo',
            email,
            full_name: email.split('@')[0],
          },
          token: 'demo-token',
        });
        return;
      }

      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        res.status(401).json({ error: error.message });
        return;
      }

      res.status(200).json({
        message: 'Login successful.',
        user: {
          id: data.user?.id,
          email: data.user?.email,
          full_name: data.user?.user_metadata?.full_name || email.split('@')[0],
        },
        session: data.session,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Login failed.' });
    }
  },

  /**
   * Logout user endpoint
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      if (isBackendSupabaseConfigured()) {
        const supabase = getSupabase();
        await supabase.auth.signOut();
      }
      res.status(200).json({ message: 'Logged out successfully.' });
    } catch (err: any) {
      res.status(500).json({ error: 'Logout failed.' });
    }
  },

  /**
   * Current user profile endpoint
   */
  async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      res.status(200).json({
        user: req.user,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve profile.' });
    }
  },
};
