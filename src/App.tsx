import { useState } from 'react';
import FileUpload from './components/FileUpload';
import FilePreview from './components/FilePreview';
import Chatbot from './components/Chatbot';
import type { Message } from "./types/index";
import Groq from 'groq-sdk';
import Swal from 'sweetalert2';

function App() {
  // ========== STATE MANAGEMENT ==========
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // ========== GROQ API SETUP ==========
  const groq = new Groq({ 
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true
  });

  // ========== FILE UPLOAD HANDLER ==========
  const handleFileUpload = (uploadedFile: File, content: string) => {
    setFile(uploadedFile);
    setFileContent(content);
    
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

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an AI assistant analyzing a file. Provide helpful, accurate, and detailed answers based on the file content."
          },
          {
            role: "user",
            content: `**File Information:**
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
- Format your response in a clear and readable way`
          }
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 1000,
      });

      const aiText = chatCompletion.choices[0]?.message?.content || "No response received";

      const aiMessage: Message = {
        role: 'assistant',
        content: aiText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);

    } catch (error: any) {
      console.error('Groq API Error:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: `❌ **Error:** Unable to process your request.\n\n**Details:** ${error.message || 'Unknown error occurred'}\n\nPlease check your Groq API key in .env file.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // ========== CLEAR/RESET HANDLER ==========
  const handleClear = async () => {
    const result = await Swal.fire({
      title: '🗑️ Clear Everything?',
      html: '<p style="color: #666;">This will remove:</p><ul style="text-align: left; color: #666; margin-top: 10px;"><li>📄 Uploaded file</li><li>💬 Chat history</li><li>✏️ Current input</li></ul>',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Clear All!',
      cancelButtonText: 'Cancel',
      background: '#fff',
      backdrop: 'rgba(0,0,0,0.4)',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        title: 'text-2xl font-bold',
        confirmButton: 'px-6 py-2 rounded-lg font-semibold',
        cancelButton: 'px-6 py-2 rounded-lg font-semibold'
      }
    });

    if (result.isConfirmed) {
      setFile(null);
      setFileContent('');
      setMessages([]);
      setInput('');
      
      Swal.fire({
        title: 'Cleared!',
        text: 'All data has been removed successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        background: '#fff',
        customClass: {
          popup: 'rounded-xl shadow-2xl'
        }
      });
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      {/* ========== HEADER ========== */}
      <header className="flex-shrink-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <h1 className="text-3xl font-bold">AI File Analyzer</h1>
                <p className="text-sm text-gray-100 mt-1">Powered by AI ⚡</p>
              </div>
            </div>
            
            {/* Upload & Clear Buttons */}
            <div className="flex items-center gap-3">
              {file && (
                <button
                  onClick={handleClear}
                  className="cursor-pointer bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 backdrop-blur-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear All
                </button>
              )}
              
              {/* Upload Button in Header */}
              <FileUpload onFileUpload={handleFileUpload} currentFile={file} />
            </div>
          </div>
        </div>
      </header>

      {/* ========== MAIN CONTENT ========== */}
      <main className="flex-1 overflow-hidden">
        <div className="container mx-auto px-4 py-6 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            
            {/* ========== LEFT: FILE PREVIEW (Internal Scroll) ========== */}
            <div className="h-full overflow-hidden">
              <FilePreview content={fileContent} />
            </div>

            {/* ========== RIGHT: CHATBOT (Internal Scroll) ========== */}
            <div className="h-full overflow-hidden">
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
        </div>
      </main>
    </div>
  );
}

export default App;