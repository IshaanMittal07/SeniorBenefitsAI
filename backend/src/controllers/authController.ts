import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { authConfig } from '../config/auth';
import { v4 as uuidv4 } from 'uuid';

interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  first_name: string;
  last_name: string;
}

// Simple in-memory user storage for development, keyed by normalized email
const users: Map<string, StoredUser> = new Map();

const BCRYPT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Lowercase and trim emails so the same address can't register twice
 */
function normalizeEmail(email: unknown): string {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function issueToken(user: StoredUser): string {
  return jwt.sign({ userId: user.id, email: user.email }, authConfig.jwtSecret, {
    expiresIn: authConfig.jwtExpiration,
  } as SignOptions);
}

function toPublicUser(user: StoredUser) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
  };
}

/**
 * Register a new user
 */
export async function signup(req: Request, res: Response): Promise<void> {
  try {
    const { password, firstName, lastName } = req.body as SignupRequest;
    const email = normalizeEmail(req.body?.email);

    // Validate input
    if (!email || !password || !firstName?.trim() || !lastName?.trim()) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    if (!EMAIL_PATTERN.test(email)) {
      res.status(400).json({ error: 'Please enter a valid email address' });
      return;
    }

    if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
      res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
      return;
    }

    if (users.has(email)) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    const user: StoredUser = {
      id: uuidv4(),
      email,
      passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
    };

    // Store user in memory
    users.set(email, user);

    res.status(201).json({
      user: toPublicUser(user),
      token: issueToken(user),
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
}

/**
 * Login user
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { password } = req.body as LoginRequest;
    const email = normalizeEmail(req.body?.email);

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }

    const user = users.get(email);
    const passwordMatches = user && typeof password === 'string' && (await bcrypt.compare(password, user.passwordHash));

    // Same message for unknown email and wrong password, so accounts can't be enumerated
    if (!user || !passwordMatches) {
      res.status(401).json({ error: 'Incorrect email or password' });
      return;
    }

    res.json({
      user: toPublicUser(user),
      token: issueToken(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Find user by ID from token
    let foundUser: StoredUser | null = null;
    for (const user of users.values()) {
      if (user.id === req.userId) {
        foundUser = user;
        break;
      }
    }

    // The token is valid but the account no longer exists (e.g. server restarted)
    if (!foundUser) {
      res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
      return;
    }

    res.json(toPublicUser(foundUser));
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}

/**
 * Logout user (client-side token removal)
 */
export async function logout(req: Request, res: Response): Promise<void> {
  res.json({ message: 'Logged out successfully' });
}
