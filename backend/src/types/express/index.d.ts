import { User } from '../../config/passport';

declare global {
  namespace Express {
    interface User {
      accessToken: string;
      refreshToken: string;
    }
  }
}