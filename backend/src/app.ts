import express from 'express';
import session from 'express-session';
import passport from './config/passport';
import authRoutes from './routes/auth';
import clickupRoutes from './routes/clickup';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Add this new route
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.send('Authenticated! You can now use the ClickUp API.');
  } else {
    res.send('Welcome! Please <a href="/auth/clickup">login with ClickUp</a>');
  }
});

app.use('/auth', authRoutes);
app.use('/clickup', clickupRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;