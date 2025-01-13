import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env file
const envPath = path.resolve(__dirname, '../.env');
console.log('Attempting to load .env from:', envPath);
dotenv.config({ path: envPath });

const app = express();
const port = process.env.PORT || 3001;

// Enhanced logging with API key masking
console.log('Server starting...');
console.log('Environment Variables:');
console.log('VITE_ANTHROPIC_API_KEY:', process.env.VITE_ANTHROPIC_API_KEY 
  ? `sk-ant-api03-${process.env.VITE_ANTHROPIC_API_KEY.slice(-8)}` 
  : '***MISSING***');

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Validate API key before creating Anthropic client
if (!process.env.VITE_ANTHROPIC_API_KEY) {
  console.error('CRITICAL: Anthropic API key is missing!');
  process.exit(1);
}

// Safely create Anthropic client
let anthropic;
try {
  anthropic = new Anthropic({
    apiKey: process.env.VITE_ANTHROPIC_API_KEY,
  });
} catch (error) {
  console.error('Failed to create Anthropic client:', {
    name: error.name,
    message: error.message
  });
  process.exit(1);
}

// Retry mechanism for API calls
async function retryAPICall(fn, maxRetries = 3) {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      console.warn(`API call attempt ${retries + 1} failed:`, error.message);
      
      // Check if the error is retryable
      if (error.headers && error.headers['x-should-retry'] === 'true') {
        retries++;
        
        // Exponential backoff
        const waitTime = Math.pow(2, retries) * 1000; // 2s, 4s, 8s
        console.log(`Waiting ${waitTime/1000} seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}

// Fallback AI response generator
function generateFallbackResponse(taskDescription) {
  return {
    title: "Task Breakdown (Fallback)",
    subtasks: [
      {
        title: "Initial Planning",
        description: `Break down the task: "${taskDescription}"`,
        estimatedDuration: 15,
        difficulty: "medium",
        status: "pending"
      },
      {
        title: "Detailed Analysis",
        description: "Manually review and refine task steps",
        estimatedDuration: 20,
        difficulty: "medium", 
        status: "pending"
      }
    ],
    suggestions: {
      breakStrategy: "Take short breaks every 25 minutes",
      timeManagement: "Use the Pomodoro technique for focus"
    }
  };
}

app.post('/api/analyze-task', async (req, res) => {
  try {
    const { taskDescription } = req.body;
    
    console.log('Received task analysis request');
    console.log('Task Description:', taskDescription);

    if (!taskDescription) {
      console.warn('No task description provided');
      return res.status(400).json({ error: 'Task description is required' });
    }

    const systemPrompt = `You are an AI assistant specialized in helping people with ADHD break down tasks. 
    Your role is to:
    1. Break complex tasks into smaller, manageable steps
    2. Estimate realistic time durations for each step
    3. Alternate between easy and challenging tasks to maintain engagement
    4. Suggest strategic break points
    5. Keep instructions clear and actionable`;

    console.log('Sending request to Anthropic...');
    
    let completion;
    try {
      completion = await retryAPICall(async () => {
        return await anthropic.messages.create({
          model: 'claude-2.1',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: `${systemPrompt}\n\nPlease break down this task into manageable steps: "${taskDescription}"\n\nProvide the response in this exact JSON format:
{
  "title": "Original Task Title",
  "subtasks": [
    {
      "title": "Subtask Title",
      "description": "Detailed subtask description",
      "estimatedDuration": 15,
      "difficulty": "easy|medium|hard",
      "status": "pending"
    }
  ],
  "suggestions": {
    "breakStrategy": "Recommended break approach",
    "timeManagement": "Time management tips"
  }
}`
            }
          ],
        });
      });
    } catch (anthropicError) {
      console.error('Anthropic API Error:', {
        type: anthropicError.type,
        message: anthropicError.message
      });
      
      // If API is overloaded or fails, use fallback
      console.warn('Falling back to generated response');
      return res.json(generateFallbackResponse(taskDescription));
    }

    console.log('Anthropic response received');

    // Extract JSON from response
    const responseText = completion.content[0].text;
    console.log('Full AI Response:', responseText);

    // Try to extract JSON, with multiple fallback methods
    let parsedResponse;
    try {
      // Try extracting from markdown code block
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[1]);
      } else {
        // If no code block, try parsing the entire text
        parsedResponse = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('JSON Parsing Error:', {
        message: parseError.message,
        name: parseError.name
      });
      
      // Fallback to generated response if parsing fails
      return res.json(generateFallbackResponse(taskDescription));
    }

    // Validate parsed response
    if (!parsedResponse.subtasks || !Array.isArray(parsedResponse.subtasks)) {
      console.error('Invalid response structure');
      return res.json(generateFallbackResponse(taskDescription));
    }

    console.log('Sending parsed response');
    res.json(parsedResponse);

  } catch (error) {
    console.error('Comprehensive Error in Task Analysis:', {
      name: error.name,
      message: error.message
    });
    res.status(500).json({ 
      error: 'Failed to analyze task', 
      details: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
