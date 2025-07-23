import { Request, Response } from 'express';
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

interface AuthRequest extends Request {
  user?: any;
}

const register = async (req: Request, res: Response) => {
  const { email, name, role, password } = req.body;
  if (!email || !name || !role || !password) {
    return res.status(400).json({ error: 'All fields required' });
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: 'User already exists' });
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, name, role, password: hashed, created_at: new Date().toISOString() }
  });
  
  // Create Driver record if user role is 'driver'
  if (role === 'driver') {
    await prisma.driver.create({
      data: { id: user.id }
    });
  }
  
  // Issue JWT after registration
  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '12h' });
  const safeUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    created_at: user.created_at
  };
  res.status(201).json({ token, user: safeUser });
};

const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, created_at: true }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllUsers = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany();
  res.json(users);
};

const getUserById = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
};

export { register, getUserProfile, getAllUsers, getUserById };
