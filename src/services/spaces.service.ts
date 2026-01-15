import axiosClient from '@/lib/axios-client';
import { Space } from '@/types';

export interface CreateSpaceData extends Omit<Space, 'id'> { }
export interface UpdateSpaceData extends Partial<CreateSpaceData> { }

class SpacesService {
  private readonly endpoint = '/rest/v1/spaces';

  private mapSpace(s: any): Space {
    return {
      ...s,
      hourlyRate: s.hourly_rate,
      mapConfig: s.map_config,
      createdAt: s.created_at ? new Date(s.created_at) : undefined,
      updatedAt: s.updated_at ? new Date(s.updated_at) : undefined,
      capacity: s.capacity,
      image: s.image
    };
  }

  async getSpaces(): Promise<Space[]> {
    const response = await axiosClient.get(`${this.endpoint}?select=*&order=name.asc`);
    return response.data.map((s: any) => this.mapSpace(s));
  }

  async createSpace(data: CreateSpaceData): Promise<Space> {
    const dbData = {
      slug: data.slug,
      name: data.name,
      description: data.description,
      capacity: data.capacity,
      dimensions: data.dimensions,
      type: data.type,
      hourly_rate: data.hourlyRate,
      color: data.color,
      image: data.image,
      map_config: data.mapConfig
    };

    const response = await axiosClient.post(this.endpoint, dbData, {
      headers: { 'Prefer': 'return=representation' }
    });
    return this.mapSpace(response.data[0]);
  }

  async updateSpace(id: string, data: UpdateSpaceData): Promise<Space> {
    const dbData: any = {};
    if (data.slug) dbData.slug = data.slug;
    if (data.name) dbData.name = data.name;
    if (data.description) dbData.description = data.description;
    if (data.capacity !== undefined) dbData.capacity = data.capacity;
    if (data.dimensions) dbData.dimensions = data.dimensions;
    if (data.type) dbData.type = data.type;
    if (data.hourlyRate) dbData.hourly_rate = data.hourlyRate;
    if (data.color) dbData.color = data.color;
    if (data.image) dbData.image = data.image;
    if (data.mapConfig) dbData.map_config = data.mapConfig;

    const response = await axiosClient.patch(`${this.endpoint}?id=eq.${id}`, dbData, {
      headers: { 'Prefer': 'return=representation' }
    });
    return this.mapSpace(response.data[0]);
  }

  async deleteSpace(id: string): Promise<void> {
    await axiosClient.delete(`${this.endpoint}?id=eq.${id}`);
  }
}

export default new SpacesService();
