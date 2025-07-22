import { Request, Response } from 'express';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


const uploadDocument = async (req: Request, res: Response) => {
  try {
    const { driver_id, trip_id, type, filename, storage_url, tags, uploaded_at } = req.body;
    if (!driver_id || !type || !filename || !storage_url || !uploaded_at) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const document = await prisma.document.create({
      data: { driver_id, trip_id, type, filename, storage_url, tags, uploaded_at },
    });
    res.status(201).json({ document });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload document', details: (err as any).message });
  }
};

const listDocuments = async (req: Request, res: Response) => {
  try {
    const { driver_id } = req.params;
    if (!driver_id) return res.status(400).json({ error: 'driver_id required' });
    const documents = await prisma.document.findMany({
      where: { driver_id },
      orderBy: { uploaded_at: 'desc' },
    });
    res.json(documents);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list documents', details: (err as any).message });
  }
};

export { uploadDocument, listDocuments };
