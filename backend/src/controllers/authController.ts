import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { authConfig } from '../config/auth';
import { v4 as uuidv4 } from 'uuid';

// Simple in-memory user storage for development
const users: Map<string, any> = new Map();

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
 * Register a new user
 */
export async function signup(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, firstName, lastName } = req.body as SignupRequest;

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Create user with mock data
    const userId = uuidv4();
    const user = {
      id: userId,
      email,
      password,
      first_name: firstName,
      last_name: lastName,
    };
    
    // Store user in memory
    users.set(email, user);

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      authConfig.jwtSecret,
      { expiresIn: authConfig.jwtExpiration } as SignOptions
    );

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      token,
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
    const { email, password } = req.body as LoginRequest;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }

    // Check if user exists, if not create one on the fly
    let user = users.get(email);
    if (!user) {
      // Create a new user on the fly for development
      const userId = uuidv4();
      user = {
        id: userId,
        email,
        password,
        first_name: email.split('@')[0],
        last_name: 'User',
      };
      users.set(email, user);
    }

    // Generate token (password is not validated in dev mode)
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      authConfig.jwtSecret,
      { expiresIn: authConfig.jwtExpiration } as SignOptions
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      token,
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
    let foundUser = null;
    for (const user of users.values()) {
      if (user.id === req.userId) {
        foundUser = user;
        break;
      }
    }

    if (!foundUser) {
      // Create a placeholder user if not found
      foundUser = {
        id: req.userId,
        email: 'user@example.com',
        first_name: 'Test',
        last_name: 'User',
      };
    }

    res.json({
      id: foundUser.id,
      email: foundUser.email,
      firstName: foundUser.first_name,
      lastName: foundUser.last_name,
    });
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
