// Message type for chat
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

// File info type
export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

// API Response type
export interface GeminiResponse {
  text: string;
  error?: string;
}

// Chat state type
export interface ChatState {
  messages: Message[];
  loading: boolean;
  error: string | null;
}

// File state type
export interface FileState {
  file: File | null;
  content: string;
  isUploading: boolean;
  error: string | null;
}