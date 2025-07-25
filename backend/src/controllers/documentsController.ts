import { Request, Response } from 'express';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Document Management Service
const uploadDocument = async (req: Request, res: Response) => {
  try {
    // File info from multer
    const file = (req as any).file;
    const { driver_id, trip_id, type, tags } = req.body;
    const uploaded_at = new Date().toISOString();
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    if (!driver_id || !type) {
      return res.status(400).json({ error: 'Missing required fields: driver_id, type' });
    }
    const filename = file.originalname;
    const storage_url = file.path;
    const document = await prisma.document.create({
      data: { driver_id, trip_id, type, filename, storage_url, tags, uploaded_at },
    });
    console.log('[DOCUMENTS] Document uploaded successfully');
    res.status(201).json({ status: 'success', document });
  } catch (err) {
    console.error('[DOCUMENTS] Error uploading document:', err);
    res.status(500).json({ 
      error: 'Failed to upload document', 
      details: err instanceof Error ? err.message : String(err) 
    });
  }
};

const listDocuments = async (req: Request, res: Response) => {
  try {
    const { driver_id, trip_id } = req.query;
    console.log('[DOCUMENTS] listDocuments called:', { driver_id, trip_id });
    
    if (!driver_id && !trip_id) {
      return res.status(400).json({ error: 'Either driver_id or trip_id required' });
    }
    
    const where: any = {};
    if (driver_id) where.driver_id = driver_id;
    if (trip_id) where.trip_id = trip_id;
    
    const documents = await prisma.document.findMany({
      where,
      orderBy: { uploaded_at: 'desc' },
    });
    
    console.log('[DOCUMENTS] Documents listed successfully');
    res.json({ status: 'success', documents });
  } catch (err) {
    console.error('[DOCUMENTS] Error listing documents:', err);
    res.status(500).json({ 
      error: 'Failed to list documents', 
      details: err instanceof Error ? err.message : String(err) 
    });
  }
};

const getDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log('[DOCUMENTS] getDocument called for ID:', id);
    
    if (!id) {
      return res.status(400).json({ error: 'Document ID required' });
    }
    
    const document = await prisma.document.findUnique({
      where: { id }
    });
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    // Add direct file URL for preview/download
    const fileUrl = `/api/v1/documents/file/${document.storage_url.split('/').pop()}`;
    console.log('[DOCUMENTS] Document retrieved successfully');
    res.json({ status: 'success', document: { ...document, fileUrl } });
  } catch (err) {
    console.error('[DOCUMENTS] Error getting document:', err);
    res.status(500).json({ 
      error: 'Failed to get document', 
      details: err instanceof Error ? err.message : String(err) 
    });
  }
};

export { uploadDocument, listDocuments, getDocument };
