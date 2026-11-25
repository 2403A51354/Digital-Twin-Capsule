import { Request, Response, NextFunction } from 'express';
import { getSupabase } from '../services/supabase.service.js';
import { isBackendSupabaseConfigured } from '../config/env.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      res.status(401).json({ error: 'Access denied. Bearer token missing.' });
      return;
    }

    if (!isBackendSupabaseConfigured()) {
      // In local demo mode, extract user ID from custom token or default
      req.user = {
        id: token.startsWith('usr_') ? token : 'usr_demo',
        email: 'user@chronovault.com',
      };
      next();
      return;
    }

    const supabase = getSupabase();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: 'Invalid or expired authentication token.' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email || '',
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication verification failed.' });
  }
};
