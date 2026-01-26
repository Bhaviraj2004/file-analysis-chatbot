// File-related helper functions - validation, formatting, etc.

// File size formatter
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Get file icon based on extension
export const getFileIcon = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  const iconMap: { [key: string]: string } = {
    txt: '📄',
    json: '📋',
    csv: '📊',
    md: '📝',
    xml: '📰',
    log: '📜',
    default: '📁'
  };
  
  return iconMap[extension || 'default'] || iconMap.default;
};

// Validate file type
export const isValidFileType = (file: File): boolean => {
  const validTypes = [
    'text/plain',
    'application/json',
    'text/csv',
    'text/markdown',
    'text/xml',
    'application/xml'
  ];
  
  const validExtensions = ['.txt', '.json', '.csv', '.md', '.xml', '.log'];
  const hasValidType = validTypes.includes(file.type);
  const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
  
  return hasValidType || hasValidExtension;
};

// Validate file size (max 5MB)
export const isValidFileSize = (file: File, maxSizeMB: number = 5): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

// Get line count from content
export const getLineCount = (content: string): number => {
  return content.split('\n').length;
};

// Truncate content for preview
export const truncateContent = (content: string, maxLines: number = 500): string => {
  const lines = content.split('\n');
  
  if (lines.length <= maxLines) {
    return content;
  }
  
  return lines.slice(0, maxLines).join('\n') + '\n\n... (content truncated)';
};