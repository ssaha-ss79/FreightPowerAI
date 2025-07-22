import { Request, Response } from 'express';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


const sendVoiceMessage = async (req: Request, res: Response) => {
  try {
    const { sender_id, receiver_id, message_type, content_url, text_content, timestamp, status } = req.body;
    if (!sender_id || !receiver_id || !message_type || !timestamp || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const message = await prisma.dispatchMessage.create({
      data: { sender_id, receiver_id, message_type, content_url, text_content, timestamp, status },
    });
    res.status(201).json({ message });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message', details: (err as any).message });
  }
};

const getDriverMessages = async (req: Request, res: Response) => {
  try {
    const { driver_id } = req.params;
    if (!driver_id) return res.status(400).json({ error: 'driver_id required' });
    const messages = await prisma.dispatchMessage.findMany({
      where: { receiver_id: driver_id },
      orderBy: { timestamp: 'desc' },
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get messages', details: (err as any).message });
  }
};

export { sendVoiceMessage, getDriverMessages };
