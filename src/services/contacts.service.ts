import axiosClient from '@/lib/axios-client';
import { Contact } from '@/types';

export interface CreateContactData {
  name: string;
  email?: string;
  phone?: string;
  metadata?: any;
  ventureId?: string;
}

export interface UpdateContactData extends Partial<CreateContactData> { }

class ContactsService {
  private readonly endpoint = '/rest/v1/contacts';

  private mapContact(c: any): Contact {
    return {
      ...c,
      ventureId: c.venture_id,
      createdAt: c.created_at,
      updatedAt: c.updated_at
    };
  }

  /**
   * Get all contacts
   */
  async getContacts(): Promise<Contact[]> {
    const response = await axiosClient.get(`${this.endpoint}?select=*&order=name.asc`);
    return response.data.map((c: any) => this.mapContact(c));
  }

  /**
   * Get single contact by ID
   */
  async getContactById(id: string): Promise<Contact> {
    const response = await axiosClient.get(`${this.endpoint}?id=eq.${id}&select=*`);
    return response.data[0] ? this.mapContact(response.data[0]) : response.data[0];
  }

  /**
   * Create new contact
   */
  async createContact(data: CreateContactData): Promise<Contact> {
    const dbData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      metadata: data.metadata,
      venture_id: data.ventureId
    };

    const response = await axiosClient.post(this.endpoint, dbData, {
      headers: { 'Prefer': 'return=representation' }
    });
    return this.mapContact(response.data[0]);
  }

  /**
   * Update contact
   */
  async updateContact(id: string, data: UpdateContactData): Promise<Contact> {
    const dbData: any = {};
    if (data.name) dbData.name = data.name;
    if (data.email) dbData.email = data.email;
    if (data.phone) dbData.phone = data.phone;
    if (data.metadata) dbData.metadata = data.metadata;
    if (data.ventureId) dbData.venture_id = data.ventureId;

    const response = await axiosClient.patch(`${this.endpoint}?id=eq.${id}`, dbData, {
      headers: { 'Prefer': 'return=representation' }
    });
    return this.mapContact(response.data[0]);
  }

  /**
   * Delete contact
   */
  async deleteContact(id: string): Promise<void> {
    await axiosClient.delete(`${this.endpoint}?id=eq.${id}`);
  }
}

export default new ContactsService();
