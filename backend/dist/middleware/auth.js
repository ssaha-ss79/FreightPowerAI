"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
function authenticateToken(req, res, next) {
    console.log(`[AUTH] ${req.method} ${req.originalUrl} - Checking for token...`);
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        console.log('[AUTH] No Authorization header');
        return res.status(401).json({ error: 'No token provided' });
    }
    // Expect format: 'Bearer <token>'
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        console.log('[AUTH] Malformed Authorization header:', authHeader);
        return res.status(401).json({ error: 'Malformed token' });
    }
    const token = parts[1];
    console.log('[AUTH] Received token:', token);
    console.log('[AUTH] Received token:', token);
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('[AUTH] Decoded payload:', decoded);
        req.user = decoded;
        next();
    }
    catch (err) {
        console.log('[AUTH] Token verification failed:', err);
        return res.status(401).json({ error: 'Invalid token' });
    }
}
function requireRole(role) {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ error: 'Forbidden: insufficient role' });
        }
        next();
    };
}
module.exports = { authenticateToken, requireRole };
