import { Request, Response } from 'express';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


const getDriverNotifications = async (req: Request, res: Response) => {
  try {
    const { driver_id } = req.params;
    const { status } = req.query;
    if (!driver_id) return res.status(400).json({ error: 'driver_id required' });
    const where: any = { driver_id };
    if (status) where.status = status;
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { received_at: 'desc' },
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get notifications', details: (err as any).message });
  }
};

const markAsRead = async (req: Request, res: Response) => {
  try {
    const { notification_id } = req.params;
    const notification = await prisma.notification.update({
      where: { id: notification_id },
      data: { status: 'read' },
    });
    res.json({ status: 'success', notification });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification as read', details: (err as any).message });
  }
};

const ingestNotification = async (req: Request, res: Response) => {
  try {
    const { driver_id, message_content, source_system, status, received_at } = req.body;
    if (!driver_id || !message_content || !source_system || !status || !received_at) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const notification = await prisma.notification.create({
      data: { driver_id, message_content, source_system, status, received_at },
    });
    res.status(201).json({ notification });
  } catch (err) {
    res.status(500).json({ error: 'Failed to ingest notification', details: (err as any).message });
  }
};

export { getDriverNotifications, markAsRead, ingestNotification };
