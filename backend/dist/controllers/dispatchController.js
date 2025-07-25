"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDriverMessages = exports.getMessages = exports.sendVoiceMessage = void 0;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// Dispatch Communication Service
const sendVoiceMessage = async (req, res) => {
    try {
        const { sender_id, receiver_id, message_type, content_url, text_content, timestamp, status } = req.body;
        console.log('[DISPATCH] sendVoiceMessage called:', { sender_id, receiver_id, message_type });
        if (!sender_id || !receiver_id || !message_type || !timestamp || !status) {
            return res.status(400).json({ error: 'Missing required fields: sender_id, receiver_id, message_type, timestamp, status' });
        }
        const message = await prisma.dispatchMessage.create({
            data: { sender_id, receiver_id, message_type, content_url, text_content, timestamp, status },
        });
        console.log('[DISPATCH] Voice message sent successfully');
        res.status(201).json({ status: 'success', message });
    }
    catch (err) {
        console.error('[DISPATCH] Error sending message:', err);
        res.status(500).json({
            error: 'Failed to send message',
            details: err instanceof Error ? err.message : String(err)
        });
    }
};
exports.sendVoiceMessage = sendVoiceMessage;
const getMessages = async (req, res) => {
    try {
        const { driver_id, dispatcher_id, status } = req.query;
        console.log('[DISPATCH] getMessages called:', { driver_id, dispatcher_id, status });
        if (!driver_id && !dispatcher_id) {
            return res.status(400).json({ error: 'Either driver_id or dispatcher_id required' });
        }
        const where = {};
        if (driver_id) {
            where.OR = [
                { sender_id: driver_id },
                { receiver_id: driver_id }
            ];
        }
        if (dispatcher_id) {
            where.OR = [
                { sender_id: dispatcher_id },
                { receiver_id: dispatcher_id }
            ];
        }
        if (status) {
            where.status = status;
        }
        const messages = await prisma.dispatchMessage.findMany({
            where,
            orderBy: { timestamp: 'desc' },
        });
        console.log('[DISPATCH] Messages retrieved successfully');
        res.json({ status: 'success', messages });
    }
    catch (err) {
        console.error('[DISPATCH] Error getting messages:', err);
        res.status(500).json({
            error: 'Failed to get messages',
            details: err instanceof Error ? err.message : String(err)
        });
    }
};
exports.getMessages = getMessages;
const getDriverMessages = async (req, res) => {
    try {
        const { driver_id } = req.params;
        console.log('[DISPATCH] getDriverMessages called for driver:', driver_id);
        if (!driver_id) {
            return res.status(400).json({ error: 'driver_id required' });
        }
        const messages = await prisma.dispatchMessage.findMany({
            where: { receiver_id: driver_id },
            orderBy: { timestamp: 'desc' },
        });
        console.log('[DISPATCH] Driver messages retrieved successfully');
        res.json({ status: 'success', messages });
    }
    catch (err) {
        console.error('[DISPATCH] Error getting driver messages:', err);
        res.status(500).json({
            error: 'Failed to get messages',
            details: err instanceof Error ? err.message : String(err)
        });
    }
};
exports.getDriverMessages = getDriverMessages;
