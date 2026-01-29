// File content ka preview dikhata hai (left div mein)
import React from 'react';

interface FilePreviewProps {
  content: string;
}

const FilePreview: React.FC<FilePreviewProps> = ({ content }) => {
  if (!content) {
    return (
      <div className="bg-white rounded-lg shadow-md h-full flex items-center justify-center">
        <div className="text-center text-gray-400">
          <svg className="w-20 h-20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <p className="text-lg font-medium">No file uploaded</p>
          <p className="text-sm mt-2">Upload a file to see its preview</p>
        </div>
      </div>
    );
  }

  const lines = content.split('\n');
  const previewLines = lines.slice(0, 500); // First 500 lines

  return (
    <div className="bg-white rounded-lg shadow-md h-full flex flex-col overflow-hidden">
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-4 py-3 rounded-t-lg">
        <h3 className="font-semibold flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          File Preview
        </h3>
        <p className="text-sm text-gray-300 mt-1">
          Showing {previewLines.length} of {lines.length} lines
        </p>
      </div>
      
      {/* Content area with internal scroll */}
      <div className="flex-1 overflow-y-auto p-4">
        <pre className="text-sm text-gray-700 font-mono whitespace-pre-wrap break-words">
          {previewLines.join('\n')}
        </pre>
        
        {lines.length > 500 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            ⚠️ Preview truncated. Showing first 500 lines only.
          </div>
        )}
      </div>
    </div>
  );
};

export default FilePreview;