import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { FusionAuthTools } from '@fusionauth/mcp-tools';

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize FusionAuth tools
const fusionAuth = new FusionAuthTools({
  apiKey: process.env.FUSIONAUTH_API_KEY || 'bf69486b-4733-4470-a592-f1bfce7af580',
  baseUrl: process.env.FUSIONAUTH_BASE_URL || 'http://localhost:9011',
});

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'FusionAuth MCP Express Example',
    endpoints: [
      'GET /users/search - Search users',
      'POST /users - Create user',
      'GET /users/:id - Get user by ID',
      'PUT /users/:id - Update user',
      'DELETE /users/:id - Delete user',
      'GET /applications - Get applications',
      'POST /applications - Create application',
    ],
  });
});

// User routes
app.post('/users/search', async (req, res) => {
  try {
    const result = await fusionAuth.searchUsers(req.body);
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/users', async (req, res) => {
  try {
    const result = await fusionAuth.createUser(req.body);
    if (result.success) {
      res.status(201).json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/users/:id', async (req, res) => {
  try {
    const result = await fusionAuth.getUser(req.params.id);
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/users/:id', async (req, res) => {
  try {
    const result = await fusionAuth.updateUser({
      userId: req.params.id,
      user: req.body,
    });
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/users/:id', async (req, res) => {
  try {
    const result = await fusionAuth.deleteUser({
      userId: req.params.id,
      hardDelete: req.query.hard === 'true',
    });
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Application routes
app.get('/applications', async (req, res) => {
  try {
    const result = await fusionAuth.getApplications();
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/applications', async (req, res) => {
  try {
    const result = await fusionAuth.createApplication(req.body);
    if (result.success) {
      res.status(201).json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`FusionAuth MCP Express example running on port ${port}`);
});