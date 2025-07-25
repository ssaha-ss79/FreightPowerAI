import React, { useEffect, useState } from 'react';

interface Document {
  id: string;
  driver_id: string;
  trip_id?: string;
  type: string;
  filename: string;
  storage_url: string;
  tags: string;
  uploaded_at: string;
  fileUrl?: string;
}

interface DocumentsListProps {
  driverId: string;
  tripId?: string;
}

const DocumentsList: React.FC<DocumentsListProps> = ({ driverId, tripId }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        params.append('driver_id', driverId);
        if (tripId) params.append('trip_id', tripId);
        const res = await fetch(`/api/v1/documents/list?${params.toString()}`);
        const data = await res.json();
        if (data.status === 'success') {
          setDocuments(data.documents);
        } else {
          setError(data.error || 'Failed to fetch documents');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch documents');
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, [driverId, tripId]);

  return (
    <div className="bg-white p-4 rounded shadow w-full max-w-2xl mb-6">
      <h3 className="font-bold mb-4">Uploaded Documents</h3>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : documents.length === 0 ? (
        <div className="text-gray-500">No documents found.</div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left">Filename</th>
              <th className="p-2 text-left">Tags</th>
              <th className="p-2 text-left">Uploaded At</th>
              <th className="p-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {documents.map(doc => (
              <tr key={doc.id} className="border-b">
                <td className="p-2">{doc.type}</td>
                <td className="p-2">{doc.filename}</td>
                <td className="p-2">{doc.tags}</td>
                <td className="p-2">{new Date(doc.uploaded_at).toLocaleString()}</td>
                <td className="p-2">
                  <a
                    href={doc.fileUrl || `/api/v1/documents/file/${doc.storage_url.split('/').pop()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Preview/Download
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DocumentsList;
