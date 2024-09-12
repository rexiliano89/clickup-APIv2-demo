import express from 'express';
import axios from 'axios';

const router = express.Router();

// Updated isAuthenticated middleware
const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  // Check for Bearer token in Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7, authHeader.length);
    (req as any).user = { accessToken: token };
    return next();
  }
  
  res.status(401).json({ error: 'Unauthorized' });
};

// Helper function to get access token
const getAccessToken = (req: express.Request): string => {
  if (req.user && 'accessToken' in req.user) {
    return req.user.accessToken;
  }
  throw new Error('Access token not found');
};

// Get user info
router.get('/user', isAuthenticated, async (req: express.Request, res: express.Response) => {
  try {
    const response = await axios.get('https://api.clickup.com/api/v2/user', {
      headers: {
        'Authorization': `Bearer ${getAccessToken(req)}`
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
});

// Get workspaces
router.get('/workspaces', isAuthenticated, async (req: express.Request, res: express.Response) => {
  try {
    const response = await axios.get('https://api.clickup.com/api/v2/team', {
      headers: {
        'Authorization': `Bearer ${getAccessToken(req)}`
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    res.status(500).json({ error: 'Failed to fetch workspaces' });
  }
});

// Get tasks (you'll need to provide a list_id)
router.get('/tasks/:listId', isAuthenticated, async (req: express.Request, res: express.Response) => {
  try {
    const response = await axios.get(`https://api.clickup.com/api/v2/list/${req.params.listId}/task`, {
      headers: {
        'Authorization': `Bearer ${getAccessToken(req)}`
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Create a webhook
router.post('/webhook', isAuthenticated, async (req: express.Request, res: express.Response) => {
  try {
    const { workspace_id, endpoint } = req.body;
    const response = await axios.post(`https://api.clickup.com/api/v2/team/${workspace_id}/webhook`, {
      endpoint,
      events: ['taskUpdated', 'taskCreated'],
      status: 'active'
    }, {
      headers: {
        'Authorization': `Bearer ${getAccessToken(req)}`
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error creating webhook:', error);
    res.status(500).json({ error: 'Failed to create webhook' });
  }
});

// List webhooks
router.get('/webhooks/:workspace_id', isAuthenticated, async (req: express.Request, res: express.Response) => {
  try {
    const response = await axios.get(`https://api.clickup.com/api/v2/team/${req.params.workspace_id}/webhook`, {
      headers: {
        'Authorization': `Bearer ${getAccessToken(req)}`
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    res.status(500).json({ error: 'Failed to fetch webhooks' });
  }
});

export default router;