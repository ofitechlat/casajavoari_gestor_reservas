import axiosClient from '@/lib/axios-client';

export interface Activity {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  responsible?: string;
  imageUrl?: string;
  videoUrl?: string;
  instagram?: string;
  email?: string;
  tags?: string;
  createdAt: string;
}

export interface CreateActivityData {
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  responsible?: string;
  imageUrl?: string;
  videoUrl?: string;
  instagram?: string;
  email?: string;
  tags?: string;
}

export interface UpdateActivityData extends Partial<CreateActivityData> { }

class ActivitiesService {
  private readonly endpoint = '/rest/v1/Activity';

  /**
   * Get all activities
   */
  async getActivities(): Promise<Activity[]> {
    const response = await axiosClient.get(`${this.endpoint}?order=startDate.asc`);
    return response.data;
  }

  /**
   * Get single activity by ID
   */
  async getActivityById(id: string): Promise<Activity> {
    const response = await axiosClient.get(`${this.endpoint}?id=eq.${id}&select=*`);
    return response.data[0];
  }

  /**
   * Create new activity
   */
  async createActivity(data: CreateActivityData): Promise<Activity> {
    const response = await axiosClient.post(this.endpoint, data, {
      headers: {
        'Prefer': 'return=representation',
      },
    });
    return response.data[0];
  }

  /**
   * Update activity
   */
  async updateActivity(id: string, data: UpdateActivityData): Promise<Activity> {
    const response = await axiosClient.patch(`${this.endpoint}?id=eq.${id}`, data, {
      headers: {
        'Prefer': 'return=representation',
      },
    });
    return response.data[0];
  }

  /**
   * Delete activity
   */
  async deleteActivity(id: string): Promise<void> {
    await axiosClient.delete(`${this.endpoint}?id=eq.${id}`);
  }

  /**
   * Get upcoming activities
   */
  async getUpcomingActivities(): Promise<Activity[]> {
    const today = new Date().toISOString().split('T')[0];
    const response = await axiosClient.get(
      `${this.endpoint}?startDate=gte.${today}&order=startDate.asc`
    );
    return response.data;
  }

  /**
   * Get activities by tag (previously category)
   */
  async getActivitiesByTag(tag: string): Promise<Activity[]> {
    const response = await axiosClient.get(
      `${this.endpoint}?tags=ilike.*${tag}*&order=startDate.asc`
    );
    return response.data;
  }
}

export default new ActivitiesService();
