import express from 'express';
import passport from 'passport';

const router = express.Router();

router.get('/clickup', passport.authenticate('clickup', { scope: ['task:read', 'task:write'] }));

router.get('/clickup/callback', 
  passport.authenticate('clickup', { failureRedirect: '/login' }),
  (req: express.Request, res: express.Response) => {
    // Successful authentication, redirect home.
    res.redirect('/');
  }
);

router.get('/logout', (req: express.Request, res: express.Response) => {
  req.logout((err: any) => {
    if (err) {
      console.error('Error during logout:', err);
    }
    res.redirect('/');
  });
});

export default router;