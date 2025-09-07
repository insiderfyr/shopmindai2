const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock data
const mockData = {
  config: {
    version: '0.7.9-rc1',
    appTitle: 'Shop Mind AI',
    appDescription: 'AI-powered shopping assistant',
    socialLogins: [],
    emailLoginEnabled: true,
    registrationEnabled: true,
    passwordResetEnabled: true,
    openidLoginEnabled: false,
    openidAutoRedirect: false,
    openidLabel: '',
    openidImageUrl: '',
    serverDomain: '',
    registration: {
      allowed: true,
      socialLogins: []
    },
    interface: {
      modelSelect: true,
      sidebarPanel: true,
      messageAlignment: true
    },
    modelSpecs: {
      addedEndpoints: ['xAI', 'openAI', 'anthropic', 'google']
    }
  },
  
  banner: {
    enabled: false,
    message: '',
    type: 'info'
  },
  
  endpoints: {
    xAI: {
      enabled: true,
      order: 1,
      userProvide: false,
      type: 'xAI',
      iconURL: '/assets/xai.png',
      models: {
        'grok-beta': {
          name: 'Grok Beta',
          description: 'xAI Grok Beta model'
        }
      }
    },
    openAI: {
      enabled: true,
      order: 2,
      userProvide: true,
      type: 'openAI',
      iconURL: '/assets/openai.svg',
      models: {
        'gpt-4': {
          name: 'GPT-4',
          description: 'OpenAI GPT-4 model'
        },
        'gpt-3.5-turbo': {
          name: 'GPT-3.5 Turbo',
          description: 'OpenAI GPT-3.5 Turbo model'
        }
      }
    },
    anthropic: {
      enabled: true,
      order: 3,
      userProvide: true,
      type: 'anthropic',
      iconURL: '/assets/anthropic.png',
      models: {
        'claude-3-opus': {
          name: 'Claude 3 Opus',
          description: 'Anthropic Claude 3 Opus model'
        },
        'claude-3-sonnet': {
          name: 'Claude 3 Sonnet',
          description: 'Anthropic Claude 3 Sonnet model'
        }
      }
    },
    google: {
      enabled: true,
      order: 4,
      userProvide: true,
      type: 'google',
      iconURL: '/assets/google.svg',
      models: {
        'gemini-pro': {
          name: 'Gemini Pro',
          description: 'Google Gemini Pro model'
        }
      }
    }
  },
  
  user: {
    id: 'mock-user-1',
    username: 'demo_user',
    email: 'demo@shopmindai.com',
    name: 'Demo User',
    avatar: null,
    role: 'USER',
    plan: 'FREE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  conversations: [],
  
  presets: [
    {
      id: 'preset-1',
      title: 'Shopping Assistant',
      endpoint: 'openAI',
      model: 'gpt-4',
      promptPrefix: 'You are a helpful shopping assistant. Help users find products, compare prices, and make informed purchasing decisions.',
      temperature: 0.7,
      maxOutputTokens: 2000,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'preset-2',
      title: 'Product Researcher',
      endpoint: 'anthropic',
      model: 'claude-3-sonnet',
      promptPrefix: 'You are a product research specialist. Analyze products, provide detailed comparisons, and give expert recommendations.',
      temperature: 0.5,
      maxOutputTokens: 3000,
      topP: 0.9,
      frequencyPenalty: 0,
      presencePenalty: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  
  files: [],
  
  health: {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '0.7.9-rc1'
  }
};

// Routes
app.get('/api/config', (req, res) => {
  console.log('GET /api/config');
  res.json(mockData.config);
});

app.get('/api/banner', (req, res) => {
  console.log('GET /api/banner');
  res.json(mockData.banner);
});

app.get('/api/endpoints', (req, res) => {
  console.log('GET /api/endpoints');
  res.json(mockData.endpoints);
});

app.get('/api/user', (req, res) => {
  console.log('GET /api/user');
  res.json(mockData.user);
});

app.get('/api/conversations', (req, res) => {
  console.log('GET /api/conversations');
  res.json(mockData.conversations);
});

app.get('/api/presets', (req, res) => {
  console.log('GET /api/presets');
  res.json(mockData.presets);
});

app.get('/api/files', (req, res) => {
  console.log('GET /api/files');
  res.json(mockData.files);
});

app.get('/api/convos', (req, res) => {
  console.log('GET /api/convos');
  res.json(mockData.conversations);
});

app.get('/api/search/enable', (req, res) => {
  console.log('GET /api/search/enable');
  res.json({ enabled: true });
});

app.get('/api/models', (req, res) => {
  console.log('GET /api/models');
  res.json({
    'openAI': ['gpt-4', 'gpt-3.5-turbo'],
    'anthropic': ['claude-3-opus', 'claude-3-sonnet'],
    'google': ['gemini-pro'],
    'xAI': ['grok-beta']
  });
});

app.get('/api/balance', (req, res) => {
  console.log('GET /api/balance');
  res.json({
    balance: 100.0,
    currency: 'USD',
    lastUpdated: new Date().toISOString()
  });
});

app.get('/api/files/speech/config/get', (req, res) => {
  console.log('GET /api/files/speech/config/get');
  res.json({
    enabled: true,
    provider: 'openai',
    voices: [
      { id: 'alloy', name: 'Alloy' },
      { id: 'echo', name: 'Echo' },
      { id: 'fable', name: 'Fable' },
      { id: 'onyx', name: 'Onyx' },
      { id: 'nova', name: 'Nova' },
      { id: 'shimmer', name: 'Shimmer' }
    ]
  });
});

app.get('/api/roles/:roleName', (req, res) => {
  console.log('GET /api/roles/' + req.params.roleName);
  const roleName = req.params.roleName;
  
  const mockRoles = {
    'user': {
      id: 'user',
      name: 'User',
      permissions: ['read', 'write', 'chat'],
      description: 'Standard user role'
    },
    'admin': {
      id: 'admin', 
      name: 'Admin',
      permissions: ['read', 'write', 'chat', 'admin', 'manage_users'],
      description: 'Administrator role'
    }
  };
  
  const role = mockRoles[roleName];
  if (role) {
    res.json(role);
  } else {
    res.status(404).json({
      message: 'Role not found'
    });
  }
});

app.get('/api/health', (req, res) => {
  console.log('GET /api/health');
  res.json(mockData.health);
});

// Auth routes
app.post('/api/auth/refresh', (req, res) => {
  console.log('POST /api/auth/refresh');
  res.json({
    user: mockData.user,
    token: 'mock-jwt-token-' + Date.now()
  });
});

app.post('/api/auth/login', (req, res) => {
  console.log('POST /api/auth/login', req.body);
  const { email, password } = req.body;
  
  if (email === 'demo@shopmindai.com' && password === 'demo123') {
    res.json({
      user: mockData.user,
      token: 'mock-jwt-token-' + Date.now(),
      twoFAPending: false,
      tempToken: null
    });
  } else {
    res.status(401).json({
      message: 'Invalid credentials'
    });
  }
});

app.post('/api/auth/logout', (req, res) => {
  console.log('POST /api/auth/logout');
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// Conversation routes
app.post('/api/conversations', (req, res) => {
  console.log('POST /api/conversations', req.body);
  const newConversation = {
    id: 'conv-' + Date.now(),
    title: req.body.title || 'New Conversation',
    endpoint: req.body.endpoint || 'openAI',
    model: req.body.model || 'gpt-4',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: []
  };
  
  mockData.conversations.push(newConversation);
  res.json(newConversation);
});

app.get('/api/conversations/:id', (req, res) => {
  console.log('GET /api/conversations/' + req.params.id);
  const conversation = mockData.conversations.find(c => c.id === req.params.id);
  
  if (conversation) {
    res.json(conversation);
  } else {
    res.status(404).json({
      success: false,
      message: 'Conversation not found'
    });
  }
});

// Chat completion endpoint
app.post('/api/chat/completions', (req, res) => {
  console.log('POST /api/chat/completions', req.body);
  
  const { messages, model, stream } = req.body;
  const lastMessage = messages[messages.length - 1];
  
  if (stream) {
    // Set up Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });
    
    const mockResponse = `I understand you're asking about "${lastMessage.content}". This is a mock response from the ${model} model. In a real implementation, this would be the actual AI model response.`;
    
    // Simulate streaming response
    const words = mockResponse.split(' ');
    let index = 0;
    
    const sendChunk = () => {
      if (index < words.length) {
        const chunk = {
          id: 'chatcmpl-' + Date.now(),
          object: 'chat.completion.chunk',
          created: Math.floor(Date.now() / 1000),
          model: model,
          choices: [{
            index: 0,
            delta: {
              content: words[index] + ' '
            },
            finish_reason: null
          }]
        };
        
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        index++;
        setTimeout(sendChunk, 100); // Simulate delay
      } else {
        // Send final chunk
        const finalChunk = {
          id: 'chatcmpl-' + Date.now(),
          object: 'chat.completion.chunk',
          created: Math.floor(Date.now() / 1000),
          model: model,
          choices: [{
            index: 0,
            delta: {},
            finish_reason: 'stop'
          }]
        };
        
        res.write(`data: ${JSON.stringify(finalChunk)}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      }
    };
    
    sendChunk();
  } else {
    // Non-streaming response
    res.json({
      id: 'chatcmpl-' + Date.now(),
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: model,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: `I understand you're asking about "${lastMessage.content}". This is a mock response from the ${model} model. In a real implementation, this would be the actual AI model response.`
        },
        finish_reason: 'stop'
      }],
      usage: {
        prompt_tokens: 50,
        completion_tokens: 100,
        total_tokens: 150
      }
    });
  }
});

// File upload endpoint
app.post('/api/files/upload', (req, res) => {
  console.log('POST /api/files/upload');
  res.json({
    success: true,
    message: 'File uploaded successfully',
    file: {
      id: 'file-' + Date.now(),
      name: 'uploaded-file.txt',
      size: 1024,
      type: 'text/plain',
      url: '/uploads/uploaded-file.txt',
      createdAt: new Date().toISOString()
    }
  });
});

// Catch-all for undefined routes
app.use('/api/*', (req, res) => {
  console.log(`${req.method} ${req.originalUrl} - Not implemented`);
  res.status(404).json({
    success: false,
    message: 'Endpoint not implemented in mock server',
    path: req.originalUrl,
    method: req.method
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock server running on http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET  /api/config`);
  console.log(`   GET  /api/banner`);
  console.log(`   GET  /api/endpoints`);
  console.log(`   GET  /api/user`);
  console.log(`   GET  /api/conversations`);
  console.log(`   GET  /api/convos`);
  console.log(`   GET  /api/presets`);
  console.log(`   GET  /api/files`);
  console.log(`   GET  /api/models`);
  console.log(`   GET  /api/balance`);
  console.log(`   GET  /api/search/enable`);
  console.log(`   GET  /api/files/speech/config/get`);
  console.log(`   GET  /api/roles/:roleName`);
  console.log(`   GET  /api/health`);
  console.log(`   POST /api/auth/login`);
  console.log(`   POST /api/auth/logout`);
  console.log(`   POST /api/auth/refresh`);
  console.log(`   POST /api/conversations`);
  console.log(`   POST /api/chat/completions`);
  console.log(`   POST /api/files/upload`);
  console.log(`\n🔧 Demo credentials:`);
  console.log(`   Email: demo@shopmindai.com`);
  console.log(`   Password: demo123`);
});
