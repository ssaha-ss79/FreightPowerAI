
import React, { useRef, useState } from 'react';

interface DocumentUploadProps {
  onUpload?: (file: File) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUpload }) => {

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setUploadError('');
    setUploadSuccess('');
    if (file && file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadError('');
    setUploadSuccess('');
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      // Use fetch directly for multipart/form-data
      const token = localStorage.getItem('token');
      const res = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:4000') + '/api/v1/documents/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      setUploadSuccess('Upload successful!');
      if (onUpload) onUpload(selectedFile);
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow w-full max-w-md mb-6">
      <h3 className="font-bold mb-2">Upload Document</h3>
      <input
        type="file"
        accept=".pdf,image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="mb-2"
      />
      {previewUrl && (
        <img src={previewUrl} alt="Preview" className="w-32 h-32 object-contain mb-2 border" />
      )}
      {selectedFile && (
        <div className="mb-2 text-sm">Selected: {selectedFile.name}</div>
      )}
      {uploadError && <div className="text-red-500 mb-2">{uploadError}</div>}
      {uploadSuccess && <div className="text-green-600 mb-2">{uploadSuccess}</div>}
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
};

export default DocumentUpload;
