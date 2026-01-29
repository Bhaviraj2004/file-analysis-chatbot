import React, { useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';


pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

interface FileUploadProps {
  onFileUpload: (file: File, content: string) => void;
  currentFile: File | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, currentFile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ========== PDF TEXT EXTRACTION ==========
  const extractPdfText = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += `\n--- Page ${i} ---\n${pageText}\n`;
      }

      return fullText || '⚠️ No text found in PDF';
    } catch (error) {
      console.error('PDF extraction error:', error);
      return '❌ Failed to extract PDF text';
    }
  };

  // ========== DOCX TEXT EXTRACTION ==========
  const extractDocxText = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value || '⚠️ No text found in DOCX';
    } catch (error) {
      console.error('DOCX extraction error:', error);
      return '❌ Failed to extract DOCX text';
    }
  };

  // ========== IMAGE OCR TEXT EXTRACTION ==========
  const extractImageText = async (file: File): Promise<string> => {
    try {
      const result = await Tesseract.recognize(
        file,
        'eng', // Language: 'eng' for English, 'hin' for Hindi, 'eng+hin' for both
        {
          logger: (m: any) => {
            if (m.status === 'recognizing text') {
              console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          }
        }
      );

      const extractedText = result.data.text.trim();
      
      if (!extractedText) {
        return '⚠️ No text found in image. The image might be:\n- Too blurry\n- Low resolution\n- Contains no text\n- Not in a supported language';
      }

      return `📸 **Extracted Text from Image:**\n\n${extractedText}`;
    } catch (error) {
      console.error('OCR extraction error:', error);
      return '❌ Failed to extract text from image. Please try a clearer image.';
    }
  };

  // ========== MAIN FILE HANDLER ==========
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) return;

    // File size validation (15MB for images, 10MB for others)
    const maxSize = selectedFile.type.startsWith('image/') ? 15 * 1024 * 1024 : 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      alert(`❌ File size should be less than ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    // ✅ File type validation (added image types)
    const validTypes = [
      'text/plain',
      'application/json',
      'text/csv',
      'text/markdown',
      'text/xml',
      'application/xml',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'image/bmp',
      'image/tiff'
    ];

    const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
    
    if (!validTypes.includes(selectedFile.type) && 
        !['txt', 'json', 'csv', 'md', 'xml', 'log', 'pdf', 'doc', 'docx', 'xlsx', 'xls', 'png', 'jpg', 'jpeg', 'webp', 'bmp', 'tiff'].includes(fileExt || '')) {
      alert('❌ Please upload a valid file (.txt, .json, .csv, .md, .xml, .log, .pdf, .doc, .docx, .xlsx, .xls, .png, .jpg, .jpeg, .webp, .bmp, .tiff)');
      return;
    }

    try {
      let content = '';

      // ========== HANDLE DIFFERENT FILE TYPES ==========
      
      // 📸 IMAGE FILES (OCR)
      if (selectedFile.type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'tiff'].includes(fileExt || '')) {
        // Show loading message
        onFileUpload(selectedFile, '🔄 **Processing image with OCR...**\n\nPlease wait while we extract text from your image.\nThis may take 10-30 seconds depending on image size and quality.');
        
        content = await extractImageText(selectedFile);
      }
      // 📄 PDF FILES
      else if (selectedFile.type === 'application/pdf' || fileExt === 'pdf') {
        content = await extractPdfText(selectedFile);
      } 
      // 📝 DOCX FILES
      else if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileExt === 'docx') {
        content = await extractDocxText(selectedFile);
      }
      // 📄 DOC FILES (not supported)
      else if (fileExt === 'doc') {
        content = '⚠️ .doc files are not supported. Please convert to .docx format.';
      }
      // 📊 EXCEL FILES
      else if (selectedFile.type.includes('spreadsheet') || ['xlsx', 'xls'].includes(fileExt || '')) {
        content = '⚠️ Excel files require additional processing. Please upload as CSV.';
      }
      // 📃 TEXT-BASED FILES
      else {
        const reader = new FileReader();
        content = await new Promise<string>((resolve, reject) => {
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsText(selectedFile);
        });
      }

      onFileUpload(selectedFile, content);

    } catch (error) {
      console.error('File processing error:', error);
      alert('❌ Error processing file. Please try again.');
    }
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
        accept=".txt,.json,.csv,.md,.xml,.log,.pdf,.doc,.docx,.xlsx,.xls,.png,.jpg,.jpeg,.webp,.bmp,.tiff"
        className="hidden"
      />
      <div>
        <button
          onClick={handleButtonClick}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-2.5 px-5 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          {currentFile ? 'Change File' : 'Upload File'}
        </button>
      </div>
    </div>
  );
};

export default FileUpload;