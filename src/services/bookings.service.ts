import axiosClient from '@/lib/axios-client';
import { Booking, Contact } from '@/types';
import contactsService from './contacts.service';

export type { Booking };

export interface CreateBookingData extends Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'user' | 'contact' | 'space'> { }

export interface UpdateBookingData extends Partial<CreateBookingData> { }

export interface BookingFilters {
  status?: string;
  startTime?: string;
  endTime?: string;
  userId?: string;
  contactId?: string;
  spaceId?: string;
}

class BookingsService {
  private readonly endpoint = '/rest/v1/bookings';
  private readonly rpcEndpoint = '/rest/v1/rpc/get_users';

  /**
   * Internal mapper to convert DB snake_case to Application camelCase
   */
  private mapBooking(b: any): Booking {
    return {
      ...b,
      userId: b.user_id,
      contactId: b.contact_id,
      spaceId: b.space_id,
      startTime: new Date(b.start_time),
      endTime: new Date(b.end_time),
      activityType: b.activity_type,
      noiseLevel: b.noise_level,
      needsSilence: b.needs_silence,
      exclusive: b.exclusive,
      status: b.status,
      adminNotes: b.admin_notes,
      totalPrice: b.total_price,
      responsible: b.responsible,
      responsibleContactIds: b.responsible_contact_ids || [],
      recurrence: b.recurrence,
      createdAt: new Date(b.created_at),
      updatedAt: new Date(b.updated_at)
    };
  }

  /**
   * Get all bookings with optional filters, user metadata, and contact data
   */
  async getBookings(filters?: BookingFilters): Promise<Booking[]> {
    let url = `${this.endpoint}?select=*`;

    if (filters?.status) url += `&status=eq.${filters.status}`;
    if (filters?.userId) url += `&user_id=eq.${filters.userId}`;
    if (filters?.contactId) url += `&contact_id=eq.${filters.contactId}`;
    if (filters?.spaceId) url += `&space_id=eq.${filters.spaceId}`;
    if (filters?.startTime) url += `&start_time=gte.${filters.startTime}`;
    if (filters?.endTime) url += `&end_time=lte.${filters.endTime}`;

    url += '&order=start_time.asc';

    const [bookingsRes, usersRes, contacts] = await Promise.all([
      axiosClient.get(url),
      this.getUsersMap(),
      contactsService.getContacts()
    ]);

    const rawBookings = bookingsRes.data;
    const contactMap = contacts.reduce((acc, c) => ({ ...acc, [c.id]: c }), {} as Record<string, Contact>);

    return rawBookings.map((raw: any) => {
      const booking = this.mapBooking(raw);
      return {
        ...booking,
        user: booking.userId ? usersRes[booking.userId] : undefined,
        contact: booking.contactId ? contactMap[booking.contactId] : undefined,
        responsibleContacts: booking.responsibleContactIds?.map(id => contactMap[id]).filter(Boolean) || []
      };
    });
  }

  /**
   * Helper to get a map of users from RPC
   */
  public async getUsersMap(): Promise<Record<string, { name: string; email: string }>> {
    try {
      const response = await axiosClient.post(this.rpcEndpoint, {});
      const users: any[] = response.data;
      const userMap: Record<string, { name: string; email: string }> = {};

      if (Array.isArray(users)) {
        users.forEach(u => {
          userMap[u.id] = {
            name: u.name || u.email?.split('@')[0] || 'Usuario',
            email: u.email
          };
        });
      }
      return userMap;
    } catch (error: any) {
      console.error('Error fetching users map:', error);
      return {};
    }
  }

  /**
   * Get single booking by ID
   */
  async getBookingById(id: string): Promise<Booking> {
    const [bookingRes, usersRes, contacts] = await Promise.all([
      axiosClient.get(`${this.endpoint}?id=eq.${id}&select=*`),
      this.getUsersMap(),
      contactsService.getContacts()
    ]);

    const raw = bookingRes.data[0];
    if (!raw) return raw;

    const booking = this.mapBooking(raw);
    booking.user = booking.userId ? usersRes[booking.userId] : undefined;
    booking.contact = booking.contactId ? contacts.find(c => c.id === booking.contactId) : undefined;
    booking.responsibleContacts = booking.responsibleContactIds?.map(id => contacts.find(c => c.id === id)).filter(Boolean) as Contact[] || [];

    return booking;
  }

  /**
   * Create new booking
   */
  async createBooking(data: CreateBookingData): Promise<Booking> {
    const dbData = {
      title: data.title,
      description: data.description,
      start_time: data.startTime,
      end_time: data.endTime,
      activity_type: data.activityType,
      status: data.status,
      noise_level: data.noiseLevel,
      needs_silence: data.needsSilence,
      exclusive: data.exclusive,
      admin_notes: data.adminNotes,
      total_price: data.totalPrice,
      responsible: data.responsible,
      responsible_contact_ids: data.responsibleContactIds,
      recurrence: data.recurrence,
      user_id: data.userId,
      contact_id: data.contactId,
      space_id: data.spaceId
    };

    const response = await axiosClient.post(this.endpoint, dbData, {
      headers: { 'Prefer': 'return=representation' }
    });
    return this.mapBooking(response.data[0]);
  }

  /**
   * Update booking
   */
  async updateBooking(id: string, data: UpdateBookingData): Promise<Booking> {
    const dbData: any = {};
    if (data.title) dbData.title = data.title;
    if (data.description) dbData.description = data.description;
    if (data.startTime) dbData.start_time = data.startTime;
    if (data.endTime) dbData.end_time = data.endTime;
    if (data.activityType) dbData.activity_type = data.activityType;
    if (data.status) dbData.status = data.status;
    if (data.noiseLevel) dbData.noise_level = data.noiseLevel;
    if (data.needsSilence !== undefined) dbData.needs_silence = data.needsSilence;
    if (data.exclusive !== undefined) dbData.exclusive = data.exclusive;
    if (data.adminNotes) dbData.admin_notes = data.adminNotes;
    if (data.totalPrice !== undefined) dbData.total_price = data.totalPrice;
    if (data.responsible) dbData.responsible = data.responsible;
    if (data.responsibleContactIds) dbData.responsible_contact_ids = data.responsibleContactIds;
    if (data.recurrence) dbData.recurrence = data.recurrence;
    if (data.userId) dbData.user_id = data.userId;
    if (data.contactId) dbData.contact_id = data.contactId;
    if (data.spaceId) dbData.space_id = data.spaceId;

    const response = await axiosClient.patch(`${this.endpoint}?id=eq.${id}`, dbData, {
      headers: { 'Prefer': 'return=representation' }
    });
    return this.mapBooking(response.data[0]);
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
    return this.getBookings({ startTime: startDate, endTime: endDate });
  }

  /**
   * Check availability for date range
   */
  async checkAvailability(startDate: string, endDate: string, excludeId?: string): Promise<boolean> {
    let url = `${this.endpoint}?start_time=lt.${endDate}&end_time=gt.${startDate}&status=eq.approved`;
    if (excludeId) {
      url += `&id=neq.${excludeId}`;
    }
    const response = await axiosClient.get(url);
    return response.data.length === 0;
  }
}

export default new BookingsService();
