# ShopMindAI Mock Server

A mock server for ShopMindAI frontend development that simulates the backend API endpoints.

## Features

- **Complete API Coverage**: Mocks all major API endpoints used by the frontend
- **Realistic Responses**: Provides realistic mock data that matches the expected API structure
- **Streaming Support**: Supports Server-Sent Events for chat completions
- **Authentication**: Includes mock authentication with demo credentials
- **File Upload**: Simulates file upload functionality
- **CORS Enabled**: Properly configured for frontend development

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the mock server**:
   ```bash
   npm start
   ```

3. **Start the frontend** (in another terminal):
   ```bash
   cd client
   npm run dev
   ```

The mock server will run on `http://localhost:3080` and the frontend will run on `http://localhost:3090`.

## Available Endpoints

### Configuration
- `GET /api/config` - Application configuration
- `GET /api/banner` - Banner settings
- `GET /api/endpoints` - Available AI endpoints
- `GET /api/health` - Health check

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Token refresh
- `GET /api/user` - Current user data

### Conversations
- `GET /api/conversations` - List conversations
- `POST /api/conversations` - Create conversation
- `GET /api/conversations/:id` - Get specific conversation

### AI Chat
- `POST /api/chat/completions` - Chat completion (supports streaming)

### Files
- `GET /api/files` - List files
- `POST /api/files/upload` - Upload file

### Presets
- `GET /api/presets` - List conversation presets

## Demo Credentials

- **Email**: `demo@shopmindai.com`
- **Password**: `demo123`

## Mock Data

The server includes realistic mock data for:

- **User Profile**: Demo user with standard permissions
- **AI Endpoints**: xAI, OpenAI, Anthropic, Google models
- **Conversation Presets**: Shopping Assistant and Product Researcher
- **Configuration**: App settings, interface options, model specifications

## Development Mode

For development with auto-restart:

```bash
npm run dev
```

This uses `nodemon` to automatically restart the server when files change.

## Customization

You can modify the mock data in `mock-server.js`:

- Update `mockData` object to change responses
- Add new endpoints by following the existing pattern
- Modify authentication logic in the login endpoint
- Adjust streaming behavior in the chat completions endpoint

## Integration with Frontend

The mock server is designed to work seamlessly with the Vite development server. The frontend's `vite.config.ts` is already configured to proxy API requests to `http://localhost:3080`.

## Troubleshooting

- **Port conflicts**: If port 3080 is in use, change the `PORT` variable in `mock-server.js`
- **CORS issues**: The server includes CORS middleware, but check browser console for any issues
- **Missing endpoints**: Add new endpoints to the mock server as needed for your development

## Contributing

When adding new features to the frontend that require new API endpoints:

1. Add the endpoint to the mock server
2. Include realistic mock data
3. Update this README with the new endpoint documentation
4. Test the integration with the frontend
