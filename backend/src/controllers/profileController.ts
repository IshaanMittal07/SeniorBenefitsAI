import { Request, Response } from 'express';
import { getUserProfile, createUserProfile, updateUserProfile } from '../models/userProfile';

interface CreateProfileRequest {
  age: number;
  province: string;
  postal_code?: string;
  residency_status: 'canadian_citizen' | 'permanent_resident' | 'temporary_resident';
  income_range: 'low' | 'medium' | 'high';
  medical_conditions: string[];
}

/**
 * Create a new user profile
 */
export async function createProfile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const data = req.body as CreateProfileRequest;

    // Validate required fields
    if (!data.age || !data.province || !data.residency_status || !data.income_range) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const profile = await createUserProfile({
      user_id: req.userId,
      age: data.age,
      province: data.province,
      postal_code: data.postal_code,
      residency_status: data.residency_status,
      income_range: data.income_range,
      medical_conditions: data.medical_conditions || [],
    });

    res.status(201).json(profile);
  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({ error: 'Failed to create profile' });
  }
}

/**
 * Get user's profile
 */
export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const profile = await getUserProfile(req.userId);
    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
}

/**
 * Update user's profile
 */
export async function updateProfile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const data = req.body;
    const profile = await updateUserProfile(req.userId, data);

    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    res.json(profile);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}
