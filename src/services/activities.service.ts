import axiosClient from '@/lib/axios-client';
import { Activity, Contact } from '@/types';
import contactsService from './contacts.service';
export type { Activity };

export interface CreateActivityData extends Omit<Activity, 'id' | 'createdAt' | 'spaces'> {
  spaceIds?: string[];
}

export interface UpdateActivityData extends Partial<CreateActivityData> { }

class ActivitiesService {
  private readonly endpoint = '/rest/v1/activities';
  private readonly junctionEndpoint = '/rest/v1/activity_spaces';

  /**
   * Helper to get a map of spaces and the junction table
   */
  private async getJoinData() {
    const [spacesRes, junctionRes] = await Promise.all([
      axiosClient.get('/rest/v1/spaces?select=*'),
      axiosClient.get(this.junctionEndpoint + '?select=*')
    ]);

    const spacesMap = spacesRes.data.reduce((acc: any, s: any) => {
      // Map DB snake_case space to camelCase Space object
      const space = {
        ...s,
        hourlyRate: s.hourly_rate,
        mapConfig: s.map_config,
        createdAt: s.created_at,
        updatedAt: s.updated_at
      };
      return { ...acc, [s.id]: space };
    }, {});

    const junction = junctionRes.data; // Array of { activity_id, space_id }

    return { spacesMap, junction };
  }

  /**
   * Helper to map DB activity to Activity object
   */
  private mapActivity(a: any): Activity {
    return {
      id: a.id,
      title: a.title,
      description: a.description,
      startAt: new Date(a.start_at),
      endAt: new Date(a.end_at),
      responsible: a.responsible,
      imageUrl: a.image_url,
      videoUrl: a.video_url,
      instagram: a.instagram_handle,
      email: a.email, // Added email back
      responsibleContactIds: a.responsible_contact_ids || [],
      createdAt: a.created_at,
      tags: a.tags || [], // already an array in DB
      ventureId: a.venture_id,
      venture: a.venture // Include venture if joined
    };
  }

  /**
   * Get all activities with their spaces using manual join
   */
  async getActivities(): Promise<Activity[]> {
    try {
      const [{ data: rawActivities }, { spacesMap, junction }, contacts] = await Promise.all([
        axiosClient.get(`${this.endpoint}?select=*,venture:ventures(*)&order=start_at.asc`),
        this.getJoinData(),
        contactsService.getContacts()
      ]);

      const contactMap = contacts.reduce((acc, c) => ({ ...acc, [c.id]: c }), {} as Record<string, Contact>);

      return rawActivities.map((raw: any) => {
        const activity = this.mapActivity(raw);
        const spaceIds = junction
          .filter((j: any) => j.activity_id === activity.id)
          .map((j: any) => j.space_id);

        return {
          ...activity,
          spaces: spaceIds.map((id: string) => spacesMap[id]).filter(Boolean),
          responsibleContacts: activity.responsibleContactIds?.map(id => contactMap[id]).filter(Boolean) || []
        };
      });
    } catch (error) {
      console.error('Error fetching activities:', error);
      return [];
    }
  }

  /**
   * Get single activity by ID with its spaces
   */
  async getActivityById(id: string): Promise<Activity> {
    const [{ data: rawActivities }, { spacesMap, junction }] = await Promise.all([
      axiosClient.get(`${this.endpoint}?id=eq.${id}&select=*`),
      this.getJoinData()
    ]);

    const raw = rawActivities[0];
    if (!raw) return raw;

    const activity = this.mapActivity(raw);
    const spaceIds = junction
      .filter((j: any) => j.activity_id === activity.id)
      .map((j: any) => j.space_id);

    const contacts = await contactsService.getContacts();

    return {
      ...activity,
      spaces: spaceIds.map((sid: string) => spacesMap[sid]).filter(Boolean),
      responsibleContacts: activity.responsibleContactIds?.map(id => contacts.find(c => c.id === id)).filter(Boolean) as Contact[] || []
    };
  }

  /**
   * Create new activity and link spaces
   */
  async createActivity(data: CreateActivityData): Promise<Activity> {
    const { spaceIds, ...activityData } = data;

    // Map camelCase to snake_case for DB
    const dbData: any = {
      title: activityData.title,
      description: activityData.description,
      start_at: activityData.startAt,
      end_at: activityData.endAt,
      responsible: activityData.responsible,
      responsible_contact_ids: activityData.responsibleContactIds,
      image_url: activityData.imageUrl,
      video_url: activityData.videoUrl,
      instagram_handle: activityData.instagram,
      email: activityData.email,
      tags: activityData.tags,
      venture_id: activityData.ventureId
    };

    // 1. Create activity
    const response = await axiosClient.post(this.endpoint, dbData, {
      headers: { 'Prefer': 'return=representation' }
    });
    const raw = response.data[0];
    const activity = this.mapActivity(raw);

    // 2. Link spaces if provided
    if (spaceIds && spaceIds.length > 0) {
      const links = spaceIds.map(spaceId => ({
        activity_id: activity.id,
        space_id: spaceId
      }));
      await axiosClient.post(this.junctionEndpoint, links);
    }

    return activity;
  }

  /**
   * Update activity and sync spaces
   */
  async updateActivity(id: string, data: UpdateActivityData): Promise<Activity> {
    const { spaceIds, ...activityData } = data;

    // Map camelCase to snake_case for DB
    const dbData: any = {};
    if (activityData.title) dbData.title = activityData.title;
    if (activityData.description) dbData.description = activityData.description;
    if (activityData.startAt) dbData.start_at = activityData.startAt;
    if (activityData.endAt) dbData.end_at = activityData.endAt;
    if (activityData.responsible) dbData.responsible = activityData.responsible;
    if (activityData.responsibleContactIds) dbData.responsible_contact_ids = activityData.responsibleContactIds;
    if (activityData.imageUrl) dbData.image_url = activityData.imageUrl;
    if (activityData.videoUrl) dbData.video_url = activityData.videoUrl;
    if (activityData.instagram) dbData.instagram_handle = activityData.instagram;
    if (activityData.email) dbData.email = activityData.email;
    if (activityData.tags) dbData.tags = activityData.tags;
    if (activityData.ventureId) dbData.venture_id = activityData.ventureId;

    // 1. Update activity
    const response = await axiosClient.patch(`${this.endpoint}?id=eq.${id}`, dbData, {
      headers: { 'Prefer': 'return=representation' }
    });
    const raw = response.data[0];
    const activity = this.mapActivity(raw);

    // 2. Sync spaces if provided
    if (spaceIds !== undefined) {
      // Clear existing
      await axiosClient.delete(`${this.junctionEndpoint}?activity_id=eq.${id}`);
      // Add new
      if (spaceIds.length > 0) {
        const links = spaceIds.map(spaceId => ({
          activity_id: id,
          space_id: spaceId
        }));
        await axiosClient.post(this.junctionEndpoint, links);
      }
    }

    return activity;
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
    const today = new Date().toISOString();
    const [{ data: rawActivities }, { spacesMap, junction }] = await Promise.all([
      axiosClient.get(`${this.endpoint}?start_at=gte.${today}&select=*,venture:ventures(*)&order=start_at.asc`),
      this.getJoinData()
    ]);

    return rawActivities.map((raw: any) => {
      const activity = this.mapActivity(raw);
      const spaceIds = junction.filter((j: any) => j.activity_id === activity.id).map((j: any) => j.space_id);
      return {
        ...activity,
        spaces: spaceIds.map((sid: string) => spacesMap[sid]).filter(Boolean)
      };
    });
  }

  /**
   * Get activities by tag
   */
  async getActivitiesByTag(tag: string): Promise<Activity[]> {
    const [{ data: rawActivities }, { spacesMap, junction }] = await Promise.all([
      axiosClient.get(`${this.endpoint}?tags=cs.{${tag}}&select=*,venture:ventures(*)&order=start_at.asc`),
      this.getJoinData()
    ]);

    return rawActivities.map((raw: any) => {
      const activity = this.mapActivity(raw);
      const spaceIds = junction.filter((j: any) => j.activity_id === activity.id).map((j: any) => j.space_id);
      return {
        ...activity,
        spaces: spaceIds.map((sid: string) => spacesMap[sid]).filter(Boolean)
      };
    });
  }
}

export default new ActivitiesService();
