import express from 'express';
import axios from 'axios';
import crypto from 'crypto';

const router = express.Router();

interface ClickUpTask {
  id: string;
  parent: string | null;
  subtasks: {
    id: string;
    name: string;
    value: any;
    custom_fields: {
        id: string;
        name: string;
        type: string;
        value: any;
      }[];
  }[];
  custom_fields: {
    id: string;
    name: string;
    type: string;
    value: any;
  }[];
  // Add other relevant fields as needed
}

// Subtask IDs for different custom fields
// TODO:Needs to go to DB later
enum RollupFieldsIds {
    AutoRollup = '6b7b8eaa-4684-45a1-84fc-fa1ae6aa50c0',
    TotalRollupValue = '61dea4a8-5803-4ddc-a2bf-94709bbbdf05',
    SubTaskValue = '6b7b8eaa-4684-45a1-84fc-fa1ae6aa50c0'
}

//TODO: Remove
const accessToken = '108004935_bb25b619339938968e8457ec42b79c577f777b60a8c0949d4ba6123d627192af';

function verifyWebhookSignature(req: express.Request, secret: string): boolean {
  const signature = req.headers['x-signature'] as string;
  const body = JSON.stringify(req.body);
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(body).digest('hex');
  return signature === digest;
}

async function processAutoRollup(body: any) {
  
    // Extract relevant information from the webhook payload
    const { history_items, task_id } = body;

    // Function to process a single history item
    const processHistoryItem = async (item: any) => {
        if (item.parent_id == null || item.field !== "custom_field") {
            return;
        }
        console.log(`Processing history item for task ${task_id}, parent ${item.parent_id}`);
        // Make API request to get parent task
        let parentTask: ClickUpTask;
        try {
            const response = await axios.get(`https://api.clickup.com/api/v2/task/${item.parent_id}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            parentTask = response.data as ClickUpTask;

            if (parentTask.custom_fields.find(field => field.id === RollupFieldsIds.AutoRollup && field.value === true)) {
                console.log(`Auto Rollup is enabled for parent task ${item.parent_id}`);
                const currentValue = parentTask.custom_fields.find(field => field.id === RollupFieldsIds.TotalRollupValue)?.value ?? 0;
                const newValue = currentValue + (item.new_value ?? 0) - (item.old_value ?? 0);
                console.log(`Current value: ${currentValue}, New value: ${newValue}`);
            }
            console.log(`Successfully fetched parent task ${item.parent_id}`);
        } catch (error) {
            console.error(`Error fetching parent task ${item.parent_id}:`, error);
            throw error;
        }
    
    };

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
    case 'taskMoved':
    
      // In a real-world scenario, you'd fetch the access token for the workspace
      // For now, we'll use a placeholder
      const accessToken = '108004935_bb25b619339938968e8457ec42b79c577f777b60a8c0949d4ba6123d627192af';
      console.log(`Processing event: ${event}`);
    //   await processAutoRollup(req.body);
      break;
    // Add more cases for other event types as needed
    default:
      console.log(`Unhandled event type: ${event}`);
  }

  res.status(200).send('Webhook received');
});

export default router;