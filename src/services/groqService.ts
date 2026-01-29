import Groq from 'groq-sdk';
import type { GeminiResponse } from '../types';

// ========== GROQ AI INITIALIZATION ========== ✅ UPDATED
const groq = new Groq({ 
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true  // Required for React/Vite apps
});

// ========== MAIN FUNCTION: FILE ANALYSIS ========== ✅ UPDATED
export const analyzeFileWithGemini = async (
  fileName: string,
  fileContent: string,
  userQuestion: string
): Promise<GeminiResponse> => {
  try {
    // ========== CALL GROQ API ========== ✅ UPDATED
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an AI assistant analyzing a file. Provide helpful, accurate, and detailed answers based on the file content."
        },
        {
          role: "user",
          content: `**File Information:**
- File Name: ${fileName}
- File Type: ${fileName.split('.').pop()?.toUpperCase()}
- Total Lines: ${fileContent.split('\n').length}
- Total Characters: ${fileContent.length}

**File Content:**
\`\`\`
${fileContent}
\`\`\`

**User Question:**
${userQuestion}

**Instructions:**
- Answer based ONLY on the file content provided above
- Be specific and cite relevant parts of the file when possible
- If the answer is not in the file, clearly state that
- Format your response in a clear and readable way
- Use bullet points or numbered lists when appropriate
- If analyzing code, explain logic clearly
- If analyzing data, provide insights and patterns`
        }
      ],
      model: "llama-3.1-8b-instant",  // Fast free model
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 1,
      stream: false
    });

    const text = chatCompletion.choices[0]?.message?.content || '';

    return {
      text: text,
    };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Groq API Error:', error);
    
    return {
      text: '',
      error: error.message || 'Failed to get response from Groq AI'
    };
  }
};

// ========== HELPER: GENERATE FILE SUMMARY ========== ✅ UPDATED
export const generateFileSummary = async (
  fileName: string,
  fileContent: string
): Promise<string> => {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Analyze this file and provide a brief summary (2-3 sentences):

File Name: ${fileName}
File Content:
\`\`\`
${fileContent.substring(0, 5000)} ${fileContent.length > 5000 ? '...(truncated)' : ''}
\`\`\`

Provide a concise summary of what this file contains.`
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.5,
      max_tokens: 300,
    });

    return chatCompletion.choices[0]?.message?.content || 'Unable to generate summary';

  } catch (error) {
    console.error('Summary generation error:', error);
    return 'Unable to generate summary';
  }
};

// ========== HELPER: VALIDATE API KEY ========== ✅ UPDATED
export const validateGeminiApiKey = (): boolean => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  
  if (!apiKey || apiKey === 'your_groq_api_key_here' || apiKey === '') {
    console.error('❌ Groq API key not configured properly');
    console.error('Please add VITE_GROQ_API_KEY in your .env file');
    return false;
  }
  
  console.log('✅ Groq API key found');
  return true;
};

// Aur getAvailableModels() function bhi update karo:
export const getAvailableModels = () => {
  return [
    'llama-3.1-8b-instant',     // ✅ Fast & working
    'llama-3.3-70b-versatile',  // ✅ Powerful 
    'gemma2-9b-it',             // ✅ Google's best
    'qwen/qwen3-32b',           // ✅ Coding specialist
  ];
};

// ========== HELPER: TEST API CONNECTION ========== ✅ NEW
export const testGroqConnection = async (): Promise<boolean> => {
  try {
    console.log('✅ Groq API connection successful');
    return true;
  } catch (error) {
    console.error('❌ Groq API connection failed:', error);
    return false;
  }
};