const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

import { Request, Response } from 'express';

const bcrypt = require('bcryptjs');

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  console.log('[LOGIN] User found:', user);
  if (!user) {
    console.log('[LOGIN] No user found for email:', email);
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const valid = await bcrypt.compare(password, user.password);
  console.log('[LOGIN] Password valid:', valid);
  if (!valid) {
    console.log('[LOGIN] Password mismatch for user:', email);
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  // Issue JWT
  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '12h' });
  // res.json({ token, user: { ...user, password: undefined } });
  const safeUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    created_at: user.created_at
    // add any other fields you want to expose
  };
  res.json({ token, user: safeUser });
};

export { login };
