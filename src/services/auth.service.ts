import axiosClient from '@/lib/axios-client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export interface AuthResponse {
  user: SupabaseUser;
  session: {
    access_token: string;
    refresh_token: string;
  };
}

class AuthService {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axiosClient.post('/auth/v1/token?grant_type=password', credentials);
    return response.data;
  }

  /**
   * Register new user
   */
  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await axiosClient.post('/auth/v1/signup', {
      email: data.email,
      password: data.password,
      data: {
        name: data.name,
        role: data.role || 'gestor',
      },
    });
    return response.data;
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    await axiosClient.post('/auth/v1/logout');
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<SupabaseUser> {
    const response = await axiosClient.get('/auth/v1/user');
    return response.data;
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await axiosClient.post('/auth/v1/token?grant_type=refresh_token', {
      refresh_token: refreshToken,
    });
    return response.data;
  }

  /**
   * Request password reset
   */
  async resetPassword(email: string): Promise<void> {
    await axiosClient.post('/auth/v1/recover', { email });
  }

  /**
   * Update user password
   */
  async updatePassword(newPassword: string): Promise<void> {
    await axiosClient.put('/auth/v1/user', {
      password: newPassword,
    });
  }
}

export default new AuthService();
