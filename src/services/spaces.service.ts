import axiosClient from '@/lib/axios-client';
import { Space, SpaceId } from '@/types';

export interface CreateSpaceData extends Omit<Space, 'id'> { }
export interface UpdateSpaceData extends Partial<CreateSpaceData> { }

class SpacesService {
  private readonly endpoint = '/rest/v1/Space';

  async getSpaces(): Promise<Space[]> {
    const response = await axiosClient.get(this.endpoint);
    return response.data;
  }

  async createSpace(data: CreateSpaceData): Promise<Space> {
    const response = await axiosClient.post(this.endpoint, data, {
      headers: {
        'Prefer': 'return=representation',
      },
    });
    return response.data[0];
  }

  async updateSpace(id: string, data: UpdateSpaceData): Promise<Space> {
    const response = await axiosClient.patch(`${this.endpoint}?id=eq.${id}`, data, {
      headers: {
        'Prefer': 'return=representation',
      },
    });
    return response.data[0];
  }

  async deleteSpace(id: string): Promise<void> {
    await axiosClient.delete(`${this.endpoint}?id=eq.${id}`);
  }
}

export default new SpacesService();
