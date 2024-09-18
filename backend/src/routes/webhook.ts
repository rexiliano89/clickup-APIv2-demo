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
// These custom fields have been manually created in ClickUp 
enum RollupFieldsIds {
    AutoRollup = 'a571297b-82bb-4063-844a-72ba69808e33',
    TotalRollupValue = '61dea4a8-5803-4ddc-a2bf-94709bbbdf05',
    SubTaskValue = '6b7b8eaa-4684-45a1-84fc-fa1ae6aa50c0'
}

// Access token hard coded from login redirect page
// Needs to be changed to get from DB
const accessToken = '108004935_bb25b619339938968e8457ec42b79c577f777b60a8c0949d4ba6123d627192af';

function verifyWebhookSignature(req: express.Request, secret: string): boolean {
  const signature = req.headers['x-signature'] as string;
  const body = JSON.stringify(req.body);
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(body).digest('hex');
  return signature === digest;
}

/***
 * Sums up the value of all subtasks custom field values
 * and updates the parent task's TotalRollupValue custom field
 * if the parent task has the AutoRollup custom field set to true.
 * 
 * @param body Webhook request body
 */
async function processAutoRollup(body: any) {
    const { history_items, task_id } = body;

    for (const item of history_items) {
        if (item.field !== "custom_field") {
            return;
        }
        // get parent task
        let itemTask: ClickUpTask;
        let parentTask: ClickUpTask;
        try {
            const taskResponse = await axios.get(`https://api.clickup.com/api/v2/task/${task_id}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            itemTask = taskResponse.data as ClickUpTask;
            console.log('HTTP itemTask', itemTask.id);
            if (itemTask.parent === null) {
                return;
            }
       
            const parentResponse = await axios.get(`https://api.clickup.com/api/v2/task/${itemTask.parent}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            parentTask = parentResponse.data as ClickUpTask;

            // Check if the parent task has the AutoRollup custom field, and apply changes to parent task
            if (parentTask.custom_fields.find(field => field.id === RollupFieldsIds.AutoRollup && (field.value === true || field.value === "true"))) {
              // Get the current value of the TotalRollupValue custom field
              // Manual casting from sring to number, since webhook API returns string
              const currentValue = +(parentTask.custom_fields.find(field => field.id === RollupFieldsIds.TotalRollupValue)!.value ?? 0);
              const newValue = currentValue + (Number(item.after) || 0) - (Number(item.before) || 0);
              
              const updateResponse = await axios.post(
                  `https://api.clickup.com/api/v2/task/${parentTask.id}/field/${RollupFieldsIds.TotalRollupValue}`,
                  {
                      value: newValue
                  },
                  {
                      headers: {
                          'Authorization': `Bearer ${accessToken}`,
                          'Content-Type': 'application/json'
                      }
                  }
              );
              console.log(`Successfully updated TotalRollupValue for parent task ${parentTask.id} to ${newValue}`);
            }
            console.log(`Successfully fetched parent task`);
        } catch (error) {
            console.error(`Error GET or POST task`, error);
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

  // Handle different webhook events
  switch (event) {
    case 'taskCreated':
    case 'taskUpdated':
    case 'taskStatusUpdated':
    case 'taskMoved':
      console.log(`Processing event: ${event}`);
      await processAutoRollup(req.body);
      break;
    // Add more cases for other event types as needed
    // see https://clickup.com/api/developer-portal/webhooks/
    default:
      console.log(`Unhandled event type: ${event}`);
  }

  res.status(200).send('Webhook received');
});

export default router;