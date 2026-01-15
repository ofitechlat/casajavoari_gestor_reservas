import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { createClient } from '@/lib/supabase/client';

// Create axios instance with Supabase configuration
const axiosClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authentication token
axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const supabase = createClient();

    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();

    // Add Authorization header if token exists
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }

    // Add apikey header for Supabase
    if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      config.headers.apikey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    // Handle specific error cases
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Unauthorized - token expired or invalid
          console.error('Authentication error:', error.response.data);
          // You could redirect to login here if needed
          break;
        case 403:
          // Forbidden - user doesn't have permission
          console.error('Permission denied:', error.response.data);
          break;
        case 404:
          // Not found
          console.error('Resource not found:', error.response.data);
          break;
        case 500:
          // Server error
          console.error('Server error:', error.response.data);
          break;
        default:
          console.error(`API error (${error.response.status}) on ${error.config.method} ${error.config.url}:`, error.response.data || error.message);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network error:', error.message);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
