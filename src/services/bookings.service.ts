import axiosClient from '@/lib/axios-client';

export interface Booking {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  noiseLevel: 'silent' | 'moderate' | 'loud';
  needsSilence: boolean;
  exclusive: boolean;
  spaceId: string;
  userId?: string;
  recurrence?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateBookingData {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  spaceId: string;
  userId?: string;
  noiseLevel?: 'silent' | 'moderate' | 'loud';
  needsSilence?: boolean;
  exclusive?: boolean;
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
  recurrence?: string;
}

export interface UpdateBookingData extends Partial<CreateBookingData> { }

export interface BookingFilters {
  status?: string;
  startTime?: string;
  endTime?: string;
  userId?: string;
  spaceId?: string;
}

class BookingsService {
  private readonly endpoint = '/rest/v1/Booking';

  /**
   * Get all bookings with optional filters
   */
  async getBookings(filters?: BookingFilters): Promise<Booking[]> {
    const params = new URLSearchParams();

    if (filters?.status) {
      params.append('status', `eq.${filters.status}`);
    }
    if (filters?.startTime) {
      params.append('startTime', `gte.${filters.startTime}`);
    }
    if (filters?.endTime) {
      params.append('endTime', `lte.${filters.endTime}`);
    }
    if (filters?.userId) {
      params.append('userId', `eq.${filters.userId}`);
    }
    if (filters?.spaceId) {
      params.append('spaceId', `eq.${filters.spaceId}`);
    }

    const response = await axiosClient.get(`${this.endpoint}?${params.toString()}`);
    return response.data;
  }

  /**
   * Get single booking by ID
   */
  async getBookingById(id: string): Promise<Booking> {
    const response = await axiosClient.get(`${this.endpoint}?id=eq.${id}&select=*`);
    return response.data[0];
  }

  /**
   * Create new booking
   */
  async createBooking(data: CreateBookingData): Promise<Booking> {
    const response = await axiosClient.post(this.endpoint, data, {
      headers: {
        'Prefer': 'return=representation',
      },
    });
    return response.data[0];
  }

  /**
   * Update booking
   */
  async updateBooking(id: string, data: UpdateBookingData): Promise<Booking> {
    const response = await axiosClient.patch(`${this.endpoint}?id=eq.${id}`, data, {
      headers: {
        'Prefer': 'return=representation',
      },
    });
    return response.data[0];
  }

  /**
   * Delete booking
   */
  async deleteBooking(id: string): Promise<void> {
    await axiosClient.delete(`${this.endpoint}?id=eq.${id}`);
  }

  /**
   * Get bookings by date range
   */
  async getBookingsByDateRange(startDate: string, endDate: string): Promise<Booking[]> {
    const response = await axiosClient.get(
      `${this.endpoint}?startTime=gte.${startDate}&endTime=lte.${endDate}&order=startTime.asc`
    );
    return response.data;
  }

  /**
   * Check availability for date range
   */
  async checkAvailability(startDate: string, endDate: string): Promise<boolean> {
    const response = await axiosClient.get(
      `${this.endpoint}?startTime=lte.${endDate}&endTime=gte.${startDate}&status=neq.cancelled`
    );
    return response.data.length === 0;
  }
}

export default new BookingsService();
