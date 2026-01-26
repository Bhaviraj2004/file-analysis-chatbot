import { GoogleGenerativeAI } from '@google/generative-ai';
import type { GeminiResponse } from '../types';

// ========== GEMINI AI INITIALIZATION ==========
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-pro" });
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash"    // ✅ Or this
});
// ========== MAIN FUNCTION: FILE ANALYSIS ==========
export const analyzeFileWithGemini = async (
  fileName: string,
  fileContent: string,
  userQuestion: string
): Promise<GeminiResponse> => {
  try {
    // Prepare detailed prompt
    const prompt = `You are an AI assistant analyzing a file. Provide helpful, accurate, and detailed answers based on the file content.

**File Information:**
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
- If analyzing data, provide insights and patterns`;

    // Call Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      text: text,
    };

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    
    return {
      text: '',
      error: error.message || 'Failed to get response from Gemini AI'
    };
  }
};

// ========== HELPER: GENERATE FILE SUMMARY ==========
export const generateFileSummary = async (
  fileName: string,
  fileContent: string
): Promise<string> => {
  try {
    const prompt = `Analyze this file and provide a brief summary (2-3 sentences):

File Name: ${fileName}
File Content:
\`\`\`
${fileContent.substring(0, 5000)} ${fileContent.length > 5000 ? '...(truncated)' : ''}
\`\`\`

Provide a concise summary of what this file contains.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error('Summary generation error:', error);
    return 'Unable to generate summary';
  }
};

// ========== HELPER: VALIDATE API KEY ==========
export const validateGeminiApiKey = (): boolean => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.error('❌ Gemini API key not configured properly');
    return false;
  }
  
  return true;
};