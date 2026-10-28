import { Request, Response } from 'express';
import { getUserProfile } from '../models/userProfile';
import { findMatchingBenefits, getBenefitDetailsForProfile } from '../services/benefitMatchingService';
import llmService from '../services/llmService';
import { getAllBenefits } from '../models/userProfile';

interface RecommendationRequest {
  profile_id?: string;
}

interface NaturalLanguageRequest {
  query: string;
}

/**
 * Get benefit recommendations for user's profile
 */
export async function getRecommendations(req: Request, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Get user's profile
    const profile = await getUserProfile(req.userId);
    if (!profile) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }

    // Find matching benefits
    const recommendations = await findMatchingBenefits(profile);

    res.json({
      profile_id: profile.id,
      user_id: profile.user_id,
      recommendations,
      total_matches: recommendations.length,
      generated_at: new Date(),
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
}

/**
 * Get benefit details for a specific benefit and user profile
 */
export async function getBenefitDetails(req: Request, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { benefitId } = req.params;

    const profile = await getUserProfile(req.userId);
    if (!profile) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }

    const details = await getBenefitDetailsForProfile(benefitId, profile);

    res.json(details);
  } catch (error) {
    console.error('Get benefit details error:', error);
    res.status(500).json({ error: 'Failed to fetch benefit details' });
  }
}

/**
 * Get all available benefits
 */
export async function listBenefits(req: Request, res: Response): Promise<void> {
  try {
    const benefits = await getAllBenefits();

    res.json({
      total: benefits.length,
      benefits,
    });
  } catch (error) {
    console.error('List benefits error:', error);
    res.status(500).json({ error: 'Failed to fetch benefits' });
  }
}

/**
 * Natural language query for benefit recommendations
 */
export async function naturalLanguageRecommendation(req: Request, res: Response): Promise<void> {
  try {
    const { query } = req.body as NaturalLanguageRequest;

    if (!query) {
      res.status(400).json({ error: 'Query is required' });
      return;
    }

    if (!llmService.isConfigured()) {
      res.status(503).json({ error: 'Natural language search is not available right now. Please use your profile instead.' });
      return;
    }

    // Parse query using LLM
    const parsedData = await llmService.parseNaturalLanguageQuery(query);

    // If user is authenticated and has a profile, use it; otherwise use parsed data
    let profile;
    if (req.userId) {
      profile = await getUserProfile(req.userId);
    }

    if (!profile && !parsedData.age) {
      res.status(400).json({ error: 'Unable to parse query. Please provide age, province, or create a profile.' });
      return;
    }

    // Merge parsed data with existing profile
    const enrichedProfile = profile || {
      age: parsedData.age || 65,
      province: parsedData.province || 'ON',
      residency_status: parsedData.residencyStatus || 'canadian_citizen',
      income_range: parsedData.incomeLevel || 'medium',
      medical_conditions: parsedData.medicalConditions || [],
    };

    // Get benefits
    const benefits = await getAllBenefits();

    // Generate LLM recommendations
    const llmRecommendations = await llmService.generateRecommendations({
      age: enrichedProfile.age,
      province: enrichedProfile.province,
      residencyStatus: enrichedProfile.residency_status,
      incomeRange: enrichedProfile.income_range,
      medicalConditions: enrichedProfile.medical_conditions,
      availableBenefits: benefits.map((b) => ({
        name: b.name,
        description: b.description,
        provider: b.provider,
      })),
    });

    res.json({
      query,
      parsed_profile: parsedData,
      recommendations: llmRecommendations,
      generated_at: new Date(),
    });
  } catch (error) {
    console.error('Natural language recommendation error:', error);
    res.status(500).json({ error: 'Failed to process query' });
  }
}
