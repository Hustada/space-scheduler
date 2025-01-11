// AI Service for task breakdown and analysis
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1';
const CLAUDE_PROXY_URL = 'http://localhost:3001/api/claude';

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

export const analyzeTask = async (taskDescription, apiKey) => {
  console.log(' [AI Service] Starting task analysis');
  
  // Try Deepseek first
  try {
    console.log(' [AI Service] Attempting Deepseek API...');
    const response = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: generateSystemPrompt()
          },
          {
            role: 'user',
            content: generateUserPrompt(taskDescription)
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      console.warn(' [AI Service] Deepseek API failed, status:', response.status);
      throw new Error('Deepseek API request failed');
    }

    console.log(' [AI Service] Deepseek API response received');
    const data = await response.json();
    console.log(' [AI Service] Parsing Deepseek response...');
    const parsedResponse = JSON.parse(data.choices[0].message.content);
    console.log(' [AI Service] Successfully parsed Deepseek response:', parsedResponse);
    return parsedResponse;
  } catch (deepseekError) {
    console.error(' [AI Service] Deepseek error:', deepseekError);
    
    // Try Claude as fallback
    try {
      console.log(' [AI Service] Falling back to Claude API via proxy...');
      const claudeResponse = await fetch(CLAUDE_PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-2.1',
          messages: [{
            role: 'user',
            content: `${generateSystemPrompt()}\n\n${generateUserPrompt(taskDescription)}`
          }],
          max_tokens: 1000
        })
      });

      if (!claudeResponse.ok) {
        console.error(' [AI Service] Claude API failed, status:', claudeResponse.status);
        throw new Error('Claude API request failed');
      }

      console.log('✅ [AI Service] Claude API response received');
      const claudeData = await claudeResponse.json();
      console.log('📊 [AI Service] Raw Claude response:', JSON.stringify(claudeData, null, 2));
      
      // Extract the content from Claude's response
      const text = claudeData.content?.[0]?.text;
      if (!text) {
        console.error('❌ [AI Service] No text content in Claude response');
        throw new Error('Invalid response format from Claude API');
      }

      console.log('📝 [AI Service] Extracted text content:', text);

      // Extract JSON from markdown code block
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      if (!jsonMatch) {
        console.error('❌ [AI Service] No JSON found in Claude response');
        throw new Error('Invalid response format from Claude API');
      }

      try {
        const parsedResponse = JSON.parse(jsonMatch[1]);
        console.log('✨ [AI Service] Successfully parsed JSON:', parsedResponse);
        
        // Ensure the response has the required structure
        if (!parsedResponse.subtasks || !parsedResponse.suggestions) {
          throw new Error('Response missing required fields');
        }

        // Generate new IDs for subtasks
        const formattedResponse = {
          ...parsedResponse,
          subtasks: parsedResponse.subtasks.map(subtask => ({
            ...subtask,
            id: generateSubtaskId()
          }))
        };

        console.log('🎯 [AI Service] Final formatted response:', formattedResponse);
        return formattedResponse;
      } catch (parseError) {
        console.error('❌ [AI Service] Failed to parse JSON:', parseError);
        throw new Error('Failed to parse AI response');
      }
    } catch (claudeError) {
      console.error(' [AI Service] Claude fallback failed:', claudeError);
      throw new Error('All AI services failed');
    }
  }
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
  
  // Ensure each subtask has required fields
  const formattedSubtasks = aiResponse.subtasks.map(subtask => {
    console.log(' [AI Service] Processing subtask:', subtask.title);
    return {
      id: generateSubtaskId(),
      title: subtask.title,
      description: subtask.description,
      estimatedDuration: parseInt(subtask.estimatedDuration) || 15,
      difficulty: ['easy', 'medium', 'hard'].includes(subtask.difficulty) 
        ? subtask.difficulty 
        : 'medium',
      status: 'pending'
    };
  });

  const formatted = {
    title: aiResponse.title,
    subtasks: formattedSubtasks,
    suggestions: {
      breakStrategy: aiResponse.suggestions?.breakStrategy || 'Take breaks as needed',
      timeManagement: aiResponse.suggestions?.timeManagement || 'Work at your own pace'
    }
  };

  console.log(' [AI Service] Formatted response:', formatted);
  return formatted;
};
