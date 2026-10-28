import axios, { AxiosInstance } from 'axios';
import { UserProfile, AuthResponse, RecommendationResponse, Benefit, User } from '../types';

class APIClient {
  private client: AxiosInstance;
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load session from localStorage
    this.token = localStorage.getItem('token');
    this.user = this.readStoredUser();
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

  private readStoredUser(): User | null {
    try {
      const stored = localStorage.getItem('user');
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  }

  private saveSession(auth: AuthResponse): void {
    this.token = auth.token;
    this.user = auth.user;
    localStorage.setItem('token', auth.token);
    localStorage.setItem('user', JSON.stringify(auth.user));
    this.setAuthHeader(auth.token);
  }

  clearSession(): void {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete this.client.defaults.headers.common['Authorization'];
  }

  // Auth endpoints
  async signup(email: string, password: string, firstName: string, lastName: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/signup', {
      email,
      password,
      firstName,
      lastName,
    });
    this.saveSession(response.data);
    return response.data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    this.saveSession(response.data);
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } finally {
      this.clearSession();
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

  getUser(): User | null {
    return this.user;
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
