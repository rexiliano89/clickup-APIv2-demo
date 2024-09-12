import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/tasks', async (req: express.Request, res: express.Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const response = await axios.get('https://api.clickup.com/api/v2/list/list_id/task', {
      headers: {
        'Authorization': `Bearer ${req.user.accessToken}`
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

export default router;