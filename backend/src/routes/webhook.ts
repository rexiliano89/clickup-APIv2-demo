import express from 'express';
import axios from 'axios';
import crypto from 'crypto';

const router = express.Router();

interface ClickUpTask {
  id: string;
  custom_fields: {
    id: string;
    name: string;
    type: string;
    value: any;
  }[];
  // Add other relevant fields as needed
}

function verifyWebhookSignature(req: express.Request, secret: string): boolean {
  const signature = req.headers['x-signature'] as string;
  const body = JSON.stringify(req.body);
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(body).digest('hex');
  return signature === digest;
}

async function processAutoRollup(taskId: string, accessToken: string) {
  try {
    // Fetch the task details
    const taskResponse = await axios.get<ClickUpTask>(`https://api.clickup.com/api/v2/task/${taskId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const task = taskResponse.data;

    // Check if Auto Rollup is true
    const autoRollupField = task.custom_fields.find(field => field.name === 'Auto Rollup');
    if (autoRollupField && autoRollupField.value) {
      console.log(`Processing Auto Rollup for task ${taskId}`);
      // Implement your Auto Rollup logic here
      // This might involve fetching subtasks, calculating values, and updating the parent task
      console.log(`Auto Rollup is true for task ${taskId}`);
    }
  } catch (error) {
    console.error('Error processing Auto Rollup:', error);
  }
}

router.post('/clickup', async (req, res) => {
  // Verify the webhook signature
  if (!verifyWebhookSignature(req, process.env.CLICKUP_WEBHOOK_SECRET!)) {
    return res.status(401).send('Invalid signature');
  }

  const { event, task_id, webhook_id } = req.body;

  // Handle different event types
  switch (event) {
    case 'taskCreated':
    case 'taskUpdated':
    case 'taskStatusUpdated':
    case 'subtaskCreated':
    case 'subtaskUpdated':
    case 'subtaskStatusUpdated':
      // In a real-world scenario, you'd fetch the access token for the workspace
      // For now, we'll use a placeholder
      const accessToken = '108004935_bb25b619339938968e8457ec42b79c577f777b60a8c0949d4ba6123d627192af';
      await processAutoRollup(task_id, accessToken);
      break;
    // Add more cases for other event types as needed
    default:
      console.log(`Unhandled event type: ${event}`);
  }

  res.status(200).send('Webhook received');
});

export default router;