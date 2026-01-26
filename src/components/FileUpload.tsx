// File upload button aur file reading logic handle karta hai

import React, { useRef } from 'react';
import type { FileInfo } from "../types";

interface FileUploadProps {
  onFileUpload: (file: File, content: string) => void;
  currentFile: File | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, currentFile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) return;

    // File size validation (5MB limit)
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert('❌ File size should be less than 5MB');
      return;
    }

    // File type validation
    const validTypes = [
      'text/plain',
      'application/json',
      'text/csv',
      'text/markdown',
      'text/xml',
      'application/xml'
    ];

    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(txt|json|csv|md|xml|log)$/)) {
      alert('❌ Please upload a text-based file (.txt, .json, .csv, .md, .xml, .log)');
      return;
    }

    // Read file content
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onFileUpload(selectedFile, content);
    };

    reader.onerror = () => {
      alert('❌ Error reading file. Please try again.');
    };

    reader.readAsText(selectedFile);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept=".txt,.json,.csv,.md,.xml,.log"
        className="hidden"
      />
      
      <button
        onClick={handleButtonClick}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        {currentFile ? 'Change File' : 'Upload File'}
      </button>

      {currentFile && (
        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800 truncate">{currentFile.name}</p>
              <p className="text-sm text-gray-500">
                {(currentFile.size / 1024).toFixed(2)} KB • {currentFile.type || 'text file'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;