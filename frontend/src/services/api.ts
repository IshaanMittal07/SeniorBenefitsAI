import axios, { AxiosInstance } from 'axios';
import { UserProfile, AuthResponse, RecommendationResponse, Benefit } from '../types';

class APIClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load token from localStorage
    this.token = localStorage.getItem('token');
    if (this.token) {
      this.setAuthHeader(this.token);
    }

    // Add request interceptor to include token
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });
  }

  private setAuthHeader(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Auth endpoints
  async signup(email: string, password: string, firstName: string, lastName: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/signup', {
      email,
      password,
      firstName,
      lastName,
    });
    this.token = response.data.token;
    localStorage.setItem('token', this.token);
    this.setAuthHeader(this.token);
    return response.data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    this.token = response.data.token;
    localStorage.setItem('token', this.token);
    this.setAuthHeader(this.token);
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } finally {
      this.token = null;
      localStorage.removeItem('token');
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

  // Profile endpoints
  async createProfile(profile: Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<UserProfile> {
    const response = await this.client.post<UserProfile>('/profiles', profile);
    return response.data;
  }

  async getProfile(): Promise<UserProfile> {
    const response = await this.client.get<UserProfile>('/profiles');
    return response.data;
  }

  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const response = await this.client.put<UserProfile>('/profiles', profile);
    return response.data;
  }

  // Recommendation endpoints
  async getRecommendations(): Promise<RecommendationResponse> {
    const response = await this.client.post<RecommendationResponse>('/recommendations', {});
    return response.data;
  }

  async getBenefits(): Promise<Benefit[]> {
    const response = await this.client.get<{ total: number; benefits: Benefit[] }>('/recommendations/benefits');
    return response.data.benefits;
  }

  async naturalLanguageQuery(query: string): Promise<any> {
    const response = await this.client.post('/recommendations/natural-language', { query });
    return response.data;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
    this.setAuthHeader(token);
  }
}

const api = new APIClient();

export default api;
