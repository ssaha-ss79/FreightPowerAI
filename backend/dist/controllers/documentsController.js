"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDocument = exports.listDocuments = exports.uploadDocument = void 0;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// Document Management Service
const uploadDocument = async (req, res) => {
    try {
        const { driver_id, trip_id, type, filename, storage_url, tags, uploaded_at } = req.body;
        console.log('[DOCUMENTS] uploadDocument called:', { driver_id, trip_id, type, filename });
        if (!driver_id || !type || !filename || !storage_url || !uploaded_at) {
            return res.status(400).json({ error: 'Missing required fields: driver_id, type, filename, storage_url, uploaded_at' });
        }
        const document = await prisma.document.create({
            data: { driver_id, trip_id, type, filename, storage_url, tags, uploaded_at },
        });
        console.log('[DOCUMENTS] Document uploaded successfully');
        res.status(201).json({ status: 'success', document });
    }
    catch (err) {
        console.error('[DOCUMENTS] Error uploading document:', err);
        res.status(500).json({
            error: 'Failed to upload document',
            details: err instanceof Error ? err.message : String(err)
        });
    }
};
exports.uploadDocument = uploadDocument;
const listDocuments = async (req, res) => {
    try {
        const { driver_id, trip_id } = req.query;
        console.log('[DOCUMENTS] listDocuments called:', { driver_id, trip_id });
        if (!driver_id && !trip_id) {
            return res.status(400).json({ error: 'Either driver_id or trip_id required' });
        }
        const where = {};
        if (driver_id)
            where.driver_id = driver_id;
        if (trip_id)
            where.trip_id = trip_id;
        const documents = await prisma.document.findMany({
            where,
            orderBy: { uploaded_at: 'desc' },
        });
        console.log('[DOCUMENTS] Documents listed successfully');
        res.json({ status: 'success', documents });
    }
    catch (err) {
        console.error('[DOCUMENTS] Error listing documents:', err);
        res.status(500).json({
            error: 'Failed to list documents',
            details: err instanceof Error ? err.message : String(err)
        });
    }
};
exports.listDocuments = listDocuments;
const getDocument = async (req, res) => {
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
        console.log('[DOCUMENTS] Document retrieved successfully');
        res.json({ status: 'success', document });
    }
    catch (err) {
        console.error('[DOCUMENTS] Error getting document:', err);
        res.status(500).json({
            error: 'Failed to get document',
            details: err instanceof Error ? err.message : String(err)
        });
    }
};
exports.getDocument = getDocument;
