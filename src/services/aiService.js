// AI Service API Configuration
console.log('Environment variables:', {
  CLAUDE_KEY: import.meta.env.VITE_ANTHROPIC_API_KEY,
  GEMINI_KEY: import.meta.env.VITE_GEMINI_API_KEY,
  CLAUDE_URL: import.meta.env.VITE_CLAUDE_PROXY_URL
});

const API_CONFIG = {
  openai: {
    url: import.meta.env.VITE_OPENAI_API_URL || 'https://api.openai.com/v1',
    key: import.meta.env.VITE_OPENAI_API_KEY,
    model: 'gpt-4-turbo-preview'
  },
  gemini: {
    url: import.meta.env.VITE_GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1/models',
    key: import.meta.env.VITE_GEMINI_API_KEY,
    model: 'gemini-pro'
  },
  claude: {
    url: import.meta.env.VITE_CLAUDE_PROXY_URL || 'http://localhost:3001/api/claude',
    key: import.meta.env.VITE_ANTHROPIC_API_KEY,
    model: 'claude-2.1'
  }
};

// Log the actual config we're using
console.log('API Config:', {
  gemini: { url: API_CONFIG.gemini.url, key: API_CONFIG.gemini.key?.substring(0, 10) },
  claude: { url: API_CONFIG.claude.url, key: API_CONFIG.claude.key?.substring(0, 10) }
});

const generateSystemPrompt = () => {
  console.log(' [AI Service] Generating system prompt');
  return `You are an AI assistant specialized in helping people with ADHD break down tasks. 
  Your role is to:
  1. Break complex tasks into smaller, manageable steps
  2. Estimate realistic time durations for each step
  3. Alternate between easy and challenging tasks to maintain engagement
  4. Suggest strategic break points
  5. Keep instructions clear and actionable`;
};

const generateUserPrompt = (taskDescription) => {
  console.log(' [AI Service] Generating user prompt for task:', taskDescription);
  return `Please break down this task into manageable steps:
  "${taskDescription}"
  
  Provide the response in the following JSON format:
  {
    "title": "Original task name",
    "subtasks": [
      {
        "id": "unique-id",
        "title": "Clear, action-oriented title",
        "description": "Detailed but concise description",
        "estimatedDuration": number (in minutes),
        "difficulty": "easy" | "medium" | "hard",
        "status": "pending"
      }
    ],
    "suggestions": {
      "breakStrategy": "When to take breaks",
      "timeManagement": "Tips for managing time"
    }
  }`;
};

// Helper function to extract JSON from text
const extractJSON = (text) => {
  try {
    // First try direct parse
    return JSON.parse(text);
  } catch (e) {
    try {
      // Try to find JSON object in the text
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        const jsonStr = match[0].trim();
        // Remove any markdown code block markers
        const cleanJson = jsonStr.replace(/```(json)?\n?|\n?```/g, '').trim();
        return JSON.parse(cleanJson);
      }

      // Look for content between triple backticks
      const codeBlockMatch = text.match(/```(?:json)?([\s\S]*?)```/);
      if (codeBlockMatch) {
        return JSON.parse(codeBlockMatch[1].trim());
      }
    } catch (e2) {
      console.error('Failed to extract JSON:', e2);
      console.log('Raw text:', text);
    }
    throw new Error('Could not extract valid JSON from response');
  }
};

// Helper function to call an AI provider
const callAIProvider = async (provider, taskDescription) => {
  const config = API_CONFIG[provider];
  if (!config.key) return null;

  console.log(` [AI Service] Attempting ${provider} API...`);
  
  try {
    let response;
    
    switch (provider) {
      case 'openai':
        response = await fetch(`${config.url}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.key}`
          },
          body: JSON.stringify({
            model: config.model,
            messages: [
              { role: 'system', content: generateSystemPrompt() },
              { role: 'user', content: generateUserPrompt(taskDescription) }
            ],
            temperature: 0.7,
            max_tokens: 1000
          })
        });
        break;
        
      case 'gemini':
        response = await fetch(`${config.url}/${config.model}:generateContent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': config.key
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${generateSystemPrompt()}\n\n${generateUserPrompt(taskDescription)}` }]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000
            }
          })
        });
        break;
        
      case 'claude':
        if (!config.key) {
          console.error('No Claude API key found');
          throw new Error('Claude API key is required');
        }
        console.log('Using Claude API key:', config.key.substring(0, 10) + '...');
        
        response = await fetch(config.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            apiKey: config.key,
            messages: [{
              role: 'user',
              content: `${generateSystemPrompt()}\n\n${generateUserPrompt(taskDescription)}`
            }]
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Claude error response:', errorText);
          throw new Error(`Claude API error: ${response.statusText} - ${errorText}`);
        }

        const claudeData = await response.json();
        console.log('Claude raw response:', claudeData);
        
        // Extract JSON from Claude's response - check both response and content fields
        let claudeText = claudeData.response || claudeData.content;
        if (!claudeText) {
          console.error('Claude response structure:', claudeData);
          throw new Error('No response field in Claude data');
        }
        
        const claudeResult = extractJSON(claudeText);
        console.log('Extracted JSON:', claudeResult);
        return { ...claudeResult, aiProvider: 'Anthropic Claude' };
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }

    if (!response.ok) {
      throw new Error(`${provider} API failed with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle different response formats
    switch (provider) {
      case 'openai':
        const openaiResult = extractJSON(data.choices[0].message.content);
        return { ...openaiResult, aiProvider: 'OpenAI GPT-4' };
      case 'gemini':
        const geminiText = data.candidates[0].content.parts[0].text;
        // Remove markdown code block markers if present
        const jsonStr = geminiText.replace(/```(json)?\n?|\n?```/g, '').trim();
        const geminiResult = extractJSON(jsonStr);
        return { ...geminiResult, aiProvider: 'Google Gemini Pro' };
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  } catch (error) {
    console.error(` [AI Service] ${provider} error:`, error);
    return null;
  }
};

export const analyzeTask = async (taskDescription) => {
  console.log(' [AI Service] Starting task analysis');

  // Try providers in order of preference
  const providers = ['claude', 'gemini', 'openai'];
  
  for (const provider of providers) {
    const result = await callAIProvider(provider, taskDescription);
    if (result) {
      console.log(` [AI Service] Successfully analyzed task with ${provider}`);
      return result;
    }
  }

  // If all providers fail, return a basic task breakdown
  console.log(' [AI Service] All providers failed, using fallback');
  return {
    title: taskDescription,
    subtasks: [
      {
        id: generateSubtaskId(),
        title: "Plan the mission",
        description: "Break down the mission into smaller steps",
        estimatedDuration: 15,
        difficulty: "easy",
        status: "pending"
      },
      {
        id: generateSubtaskId(),
        title: "Execute the mission",
        description: "Complete the main task",
        estimatedDuration: 30,
        difficulty: "medium",
        status: "pending"
      },
      {
        id: generateSubtaskId(),
        title: "Review and adjust",
        description: "Check your work and make any necessary adjustments",
        estimatedDuration: 15,
        difficulty: "easy",
        status: "pending"
      }
    ],
    suggestions: {
      breakStrategy: "Take short breaks between subtasks to maintain focus",
      timeManagement: "Start with the planning phase, then tackle the main task when your energy is highest"
    },
    aiProvider: 'Fallback'
  };
};

// Helper function to generate unique IDs for subtasks
export const generateSubtaskId = () => {
  const id = 'subtask-' + Math.random().toString(36).substr(2, 9);
  console.log(' [AI Service] Generated subtask ID:', id);
  return id;
};

// Function to validate and format AI response
export const formatAIResponse = (aiResponse) => {
  console.log(' [AI Service] Formatting AI response...');
  
  const formattedSubtasks = aiResponse.subtasks.map(subtask => {
    console.log(' [AI Service] Processing subtask:', subtask.title);
    return {
      id: generateSubtaskId(),
      title: subtask.title,
      description: subtask.description,
      estimatedDuration: parseInt(subtask.estimatedDuration) || 15,
      difficulty: subtask.difficulty || 'medium',
      status: 'pending'
    };
  });

  return {
    ...aiResponse,
    subtasks: formattedSubtasks
  };
};
