import OpenAI from 'openai';
import { llmConfig } from '../config/auth';

interface BenefitContext {
  age: number;
  province: string;
  residencyStatus: string;
  incomeRange: string;
  medicalConditions: string[];
  availableBenefits: Array<{
    name: string;
    description: string;
    provider: string;
  }>;
}

interface LLMRecommendation {
  benefits: string[];
  explanation: string;
  nextSteps: string[];
}

export class LLMService {
  private openai: OpenAI | null = null;

  /**
   * Whether an OpenAI API key is configured
   */
  isConfigured(): boolean {
    return !!llmConfig.apiKey;
  }

  /**
   * Lazily create the OpenAI client so the API can start without a key
   */
  private get client(): OpenAI {
    if (!this.openai) {
      if (!this.isConfigured()) {
        throw new Error('OPENAI_API_KEY is not configured');
      }
      this.openai = new OpenAI({ apiKey: llmConfig.apiKey });
    }
    return this.openai;
  }

  /**
   * Parse natural language query and extract benefit-related information
   */
  async parseNaturalLanguageQuery(query: string): Promise<{
    age?: number;
    province?: string;
    residencyStatus?: string;
    medicalConditions?: string[];
    incomeLevel?: string;
  }> {
    const prompt = `Extract the following information from the user query if present:
- Age (number)
- Province (Canadian province abbreviation like ON, BC, AB, etc.)
- Residency Status (canadian_citizen, permanent_resident, temporary_resident, or not mentioned)
- Medical Conditions (list)
- Income Level (low, medium, high, or not mentioned)

User query: "${query}"

Return as JSON object with keys: age, province, residencyStatus, medicalConditions, incomeLevel
Use null for missing values.`;

    try {
      const response = await this.client.chat.completions.create({
        model: llmConfig.model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: llmConfig.temperature,
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content || '{}';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return {};
    } catch (error) {
      console.error('Error parsing natural language query:', error);
      throw new Error('Failed to parse query');
    }
  }

  /**
   * Generate personalized benefit recommendations
   */
  async generateRecommendations(context: BenefitContext): Promise<LLMRecommendation> {
    const benefitsList = context.availableBenefits
      .map((b) => `- ${b.name} (${b.provider}): ${b.description}`)
      .join('\n');

    const prompt = `You are a Canadian senior benefits advisor. Based on the following profile, recommend the most relevant government and health benefits:

User Profile:
- Age: ${context.age} years old
- Province: ${context.province}
- Residency Status: ${context.residencyStatus}
- Income Level: ${context.incomeRange}
- Medical Conditions: ${context.medicalConditions.join(', ')}

Available Benefits:
${benefitsList}

Provide:
1. List of recommended benefits (by name exactly as listed)
2. Explanation of why these benefits are suitable
3. Next steps to apply

Format response as JSON with keys: benefits (array of benefit names), explanation (string), nextSteps (array of strings)`;

    try {
      const response = await this.client.chat.completions.create({
        model: llmConfig.model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: llmConfig.temperature,
        max_tokens: llmConfig.maxTokens,
      });

      const content = response.choices[0]?.message?.content || '{}';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { benefits: [], explanation: '', nextSteps: [] };
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw new Error('Failed to generate recommendations');
    }
  }

  /**
   * Generate explanation for eligibility
   */
  async generateEligibilityExplanation(benefitName: string, context: BenefitContext): Promise<string> {
    const prompt = `Explain in simple terms why a ${context.age}-year-old ${context.residencyStatus} in ${context.province} 
with ${context.medicalConditions.join(', ')} and ${context.incomeRange} income might be eligible for "${benefitName}". 
Keep it under 150 words.`;

    try {
      const response = await this.client.chat.completions.create({
        model: llmConfig.model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error generating explanation:', error);
      throw new Error('Failed to generate explanation');
    }
  }

  /**
   * Check API connectivity
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.models.list();
      return !!response;
    } catch (error) {
      console.error('LLM health check failed:', error);
      return false;
    }
  }
}

export default new LLMService();
