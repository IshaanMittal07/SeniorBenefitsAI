import axios, { AxiosInstance } from 'axios';
import { UserProfile, AuthResponse, RecommendationResponse, Benefit, User, NaturalLanguageResponse } from '../types';
import * as demoApi from './demo/demoApi';
import { DEMO_MODE } from './demo/demoApi';

export { DEMO_MODE };

class APIClient {
  private client: AxiosInstance;
  private token: string | null = null;
  private user: User | null = null;
  private sessionExpiredHandler: (() => void) | null = null;

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

    // An expired or invalid token can't be fixed by retrying: sign the user out
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const url: string = error.config?.url || '';
        // Only clear the session that made this request, not one created after it was sent
        const sentWithCurrentToken = error.config?.headers?.Authorization === `Bearer ${this.token}`;
        if (error.response?.status === 401 && this.token && sentWithCurrentToken && !url.startsWith('/auth/')) {
          this.clearSession();
          this.sessionExpiredHandler?.();
        }
        return Promise.reject(error);
      },
    );
  }

  /**
   * Register a callback that runs when the server rejects the current session
   */
  onSessionExpired(handler: (() => void) | null): void {
    this.sessionExpiredHandler = handler;
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

  /**
   * Run a demo-mode call, applying the same session-expiry handling as the HTTP client
   */
  private async demo<T>(call: () => Promise<T>): Promise<T> {
    try {
      return await call();
    } catch (error: any) {
      if (error.response?.status === 401 && this.token) {
        this.clearSession();
        this.sessionExpiredHandler?.();
      }
      throw error;
    }
  }

  // Auth endpoints
  async signup(email: string, password: string, firstName: string, lastName: string): Promise<AuthResponse> {
    const auth = DEMO_MODE
      ? await demoApi.signup(email, password, firstName, lastName)
      : (await this.client.post<AuthResponse>('/auth/signup', { email, password, firstName, lastName })).data;
    this.saveSession(auth);
    return auth;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const auth = DEMO_MODE
      ? await demoApi.login(email, password)
      : (await this.client.post<AuthResponse>('/auth/login', { email, password })).data;
    this.saveSession(auth);
    return auth;
  }

  async logout(): Promise<void> {
    try {
      if (!DEMO_MODE) {
        await this.client.post('/auth/logout');
      }
    } finally {
      this.clearSession();
    }
  }

  // Profile endpoints
  async createProfile(
    profile: Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
  ): Promise<UserProfile> {
    if (DEMO_MODE) return this.demo(() => demoApi.createProfile(this.token, profile));
    const response = await this.client.post<UserProfile>('/profiles', profile);
    return response.data;
  }

  async getProfile(): Promise<UserProfile> {
    if (DEMO_MODE) return this.demo(() => demoApi.getProfile(this.token));
    const response = await this.client.get<UserProfile>('/profiles');
    return response.data;
  }

  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    if (DEMO_MODE) return this.demo(() => demoApi.updateProfile(this.token, profile));
    const response = await this.client.put<UserProfile>('/profiles', profile);
    return response.data;
  }

  // Recommendation endpoints
  async getRecommendations(): Promise<RecommendationResponse> {
    if (DEMO_MODE) return this.demo(() => demoApi.getRecommendations(this.token));
    const response = await this.client.post<RecommendationResponse>('/recommendations', {});
    return response.data;
  }

  async getBenefits(): Promise<Benefit[]> {
    if (DEMO_MODE) return demoApi.getBenefits();
    const response = await this.client.get<{ total: number; benefits: Benefit[] }>('/recommendations/benefits');
    return response.data.benefits;
  }

  async naturalLanguageQuery(query: string): Promise<NaturalLanguageResponse> {
    if (DEMO_MODE) return demoApi.naturalLanguageQuery(this.token, query);
    const response = await this.client.post<NaturalLanguageResponse>('/recommendations/natural-language', { query });
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
