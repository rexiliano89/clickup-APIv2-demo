import passport from 'passport';
import { Strategy as OAuth2Strategy, VerifyFunction } from 'passport-oauth2';
import dotenv from 'dotenv';
import { Request } from 'express';

dotenv.config();

// Extend the Express.User interface
declare global {
  namespace Express {
    interface User {
      accessToken: string;
      refreshToken: string;
    }
  }
}

const verifyFunction: VerifyFunction = (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: Express.User) => void) => {
  // Store user information in your database here
  // For now, we'll just pass the tokens
  const user: Express.User = { accessToken, refreshToken };
  done(null, user);
};

passport.use('clickup', new OAuth2Strategy({
    authorizationURL: 'https://app.clickup.com/api',
    tokenURL: 'https://api.clickup.com/api/v2/oauth/token',
    clientID: process.env.CLICKUP_CLIENT_ID!,
    clientSecret: process.env.CLICKUP_CLIENT_SECRET!,
    callbackURL: process.env.CLICKUP_CALLBACK_URL!,
  },
  verifyFunction
));

passport.serializeUser((user: Express.User, done: (err: any, id?: any) => void) => {
  done(null, user);
});

passport.deserializeUser((user: Express.User, done: (err: any, user?: Express.User) => void) => {
  done(null, user);
});

export default passport;