# ClickUp APIv2 Demo app

This repository contains a demo application showcasing a ClickUp to ClickUp integration. It demonstrates basic REST functionality, webhook handling, and OAuth implementation using the ClickUp API v2.

## Features

- OAuth authentication with ClickUp
- Webhook integration for real-time updates
- Basic REST operations with ClickUp API

## Architecture

The application is split into two main parts:

1. **Backend**: A Node.js server handling API requests, webhooks, and OAuth flow.
2. **Frontend**: A React-based web application for user interaction.

Key components:
- `backend/src/routes/auth.ts`: Manages OAuth authentication flow
- `backend/src/routes/clickup.ts`: Handles ClickUp API interactions
- `backend/src/routes/webhook.ts`: Processes incoming webhooks from ClickUp
- `frontend/frontend/app`: Contains the React components for the user interface

## Local Development Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/clickup-APIv2-demo.git
   cd clickup-APIv2-demo
   ```

2. Install dependencies:
   ```
   cd backend && npm install
   cd ../frontend/frontend && npm install
   ```

3. Set up environment variables:
   Setup `.env`
    ```
    cp backend/env.template backend/.env
    ```
   Fill in the required parameters in `.env`:
    ```
    CLICKUP_CLIENT_ID=your_client_id
    CLICKUP_CLIENT_SECRET=your_client_secret
    REDIRECT_URI=http://localhost:3000/auth/callback
    ```

4. Update the access token:
   After logging in, replace the `access_token` in `backend/src/routes/webhook.ts` with the token you received.

5. Set up Smee.io for webhook forwarding:
   - Visit [smee.io](https://smee.io/) and create a new channel
   - Update the webhook URL in your ClickUp app settings with the Smee.io URL
   - Run the Smee client:
    ```
    npx smee -u https://smee.io/your_channel_id -t http://localhost:3000/webhook
    ```

6. Start the development servers:
   ```
   # In the backend directory
   npm run dev

   # In the frontend/frontend directory
   npm run dev
   ```

7. Open your browser and navigate to `http://localhost:3000` to use the application.

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## License

This project is licensed under the Apache License, Version 2.0 - see the [LICENSE](LICENSE) file for details.

