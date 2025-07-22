import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../utils/api';

interface Document {
  id: string;
  filename: string;
  url: string;
  uploadedAt: string;
}

const DocumentsList: React.FC = () => {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    apiRequest('/api/v1/documents')
      .then(data => setDocs(data.documents || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow w-full max-w-md mb-6">
      <h3 className="font-bold mb-2">Uploaded Documents</h3>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <ul>
        {docs.map(doc => (
          <li key={doc.id} className="mb-2 p-2 border rounded flex items-center justify-between">
            <div>
              <div className="font-semibold">{doc.filename}</div>
              <div className="text-xs text-gray-500">Uploaded: {new Date(doc.uploadedAt).toLocaleString()}</div>
            </div>
            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline ml-2">View</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentsList;
