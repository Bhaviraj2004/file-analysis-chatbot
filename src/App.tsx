import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import FilePreview from './components/FilePreview';
import Chatbot from './components/Chatbot';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Message } from "./types/index";

function App() {
  // ========== STATE MANAGEMENT ==========
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // ========== GEMINI API SETUP ==========
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
  // const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash"    // ✅ Or this
});

  // ========== FILE UPLOAD HANDLER ==========
  const handleFileUpload = (uploadedFile: File, content: string) => {
    setFile(uploadedFile);
    setFileContent(content);
    
    // Welcome message when file is uploaded
    setMessages([
      {
        role: 'assistant',
        content: `✅ File "${uploadedFile.name}" has been uploaded successfully!\n\n📊 File Details:\n- Size: ${(uploadedFile.size / 1024).toFixed(2)} KB\n- Type: ${uploadedFile.type || 'text file'}\n- Lines: ${content.split('\n').length}\n\nYou can now ask me questions about this file! 🤖`,
        timestamp: new Date()
      }
    ]);
    setInput('');
  };

  // ========== SEND MESSAGE HANDLER ==========
  const handleSendMessage = async () => {
    if (!input.trim() || !fileContent || loading) return;

    // Add user message to chat
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // ========== PREPARE PROMPT FOR GEMINI ==========
      const prompt = `You are an AI assistant analyzing a file. Provide helpful, accurate, and detailed answers based on the file content.

**File Information:**
- File Name: ${file?.name}
- File Size: ${file ? (file.size / 1024).toFixed(2) : '0'} KB
- Total Lines: ${fileContent.split('\n').length}

**File Content:**
\`\`\`
${fileContent}
\`\`\`

**User Question:**
${input}

**Instructions:**
- Answer based ONLY on the file content provided above
- Be specific and cite relevant parts of the file
- If the answer is not in the file, clearly state that
- Format your response in a clear and readable way
- Use bullet points or numbered lists when appropriate`;

      // ========== CALL GEMINI API ==========
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiText = response.text();

      // Add AI response to chat
      const aiMessage: Message = {
        role: 'assistant',
        content: aiText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);

    } catch (error: any) {
      console.error('Gemini API Error:', error);
      
      // Error message
      const errorMessage: Message = {
        role: 'assistant',
        content: `❌ **Error:** Unable to process your request.\n\n**Details:** ${error.message || 'Unknown error occurred'}\n\nPlease try again or check your API key.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // ========== CLEAR/RESET HANDLER ==========
  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear everything? This will remove the uploaded file and chat history.')) {
      setFile(null);
      setFileContent('');
      setMessages([]);
      setInput('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* ========== HEADER ========== */}
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <h1 className="text-3xl font-bold">AI File Analyzer</h1>
                <p className="text-sm text-gray-100 mt-1">Powered by Google Gemini AI</p>
              </div>
            </div>
            
            {file && (
              <button
                onClick={handleClear}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 backdrop-blur-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ========== MAIN CONTENT ========== */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-180px)]">
          
          {/* ========== LEFT DIV: FILE UPLOAD & PREVIEW ========== */}
          <div className="flex flex-col gap-4">
            {/* File Upload Section */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload File
              </h2>
              <FileUpload onFileUpload={handleFileUpload} currentFile={file} />
            </div>

            {/* File Preview Section */}
            <div className="flex-1 min-h-0">
              <FilePreview content={fileContent} fileName={file?.name || ''} />
            </div>
          </div>

          {/* ========== RIGHT DIV: CHATBOT ========== */}
          <div className="flex flex-col">
            <Chatbot
              messages={messages}
              input={input}
              setInput={setInput}
              onSend={handleSendMessage}
              loading={loading}
              disabled={!fileContent}
            />
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;