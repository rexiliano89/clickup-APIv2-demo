import { Request, Response, NextFunction } from 'express';
import { refreshToken } from '../services/tokenRefresher';

export async function tokenRefresherMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user && 'refreshToken' in req.user) {
    try {
      const newAccessToken = await refreshToken(req.user.refreshToken);
      req.user.accessToken = newAccessToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Optionally, you could log out the user here if the refresh fails
    }
  }
  next();
}