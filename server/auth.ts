import 'dotenv/config';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';

// Target real authorized admin email from environment or default
export const AUTHORIZED_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'saniyadangre80@gmail.com').toLowerCase().trim();
const JWT_SECRET = process.env.JWT_SECRET || 'rns_shop_enterprise_jwt_secret_key_2026_secured';

export function hashPassword(password: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(String(password).trim(), salt);
}

export function comparePassword(password: string, hash: string): boolean {
  if (!password || !hash) return false;
  try {
    const rawPass = String(password);
    const rawHash = String(hash);
    if (!rawHash.startsWith('$2')) return false;

    // 1. Direct comparison
    if (bcrypt.compareSync(rawPass, rawHash)) return true;
    // 2. Trimmed comparison if different
    if (rawPass.trim() !== rawPass && bcrypt.compareSync(rawPass.trim(), rawHash)) return true;
    return false;
  } catch {
    return false;
  }
}

export function generateToken(payload: { id: number; email: string; role: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days expiration
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): { id: number; email: string; role: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    if (signature !== expectedSig) return null;

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    // Verify only the authorized admin email has admin access
    if (payload.email.toLowerCase().trim() !== AUTHORIZED_ADMIN_EMAIL) {
      return null;
    }
    return payload;
  } catch (err) {
    return null;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export function requireAdminAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication token required' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized: Session invalid, expired, or access denied' });
  }

  req.user = decoded;
  next();
}

// In-memory / persistent reset tokens with 1-hour expiration
interface ResetTokenRecord {
  email: string;
  expiresAt: number;
  token: string;
}

const resetTokens = new Map<string, ResetTokenRecord>();

export function createPasswordResetToken(email: string): string {
  // Generate a cryptographically secure 32-character hex token
  const token = crypto.randomBytes(16).toString('hex').toUpperCase();
  const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

  resetTokens.set(token, {
    email: email.toLowerCase().trim(),
    expiresAt,
    token
  });

  return token;
}

export function verifyPasswordResetToken(token: string): string | null {
  const record = resetTokens.get(token.trim().toUpperCase());
  if (!record) return null;
  if (record.expiresAt < Date.now()) {
    resetTokens.delete(token.trim().toUpperCase());
    return null; // Expired
  }
  return record.email;
}

export function consumePasswordResetToken(token: string): boolean {
  return resetTokens.delete(token.trim().toUpperCase());
}
