import axiosClient from '@/lib/axios-client';
import { Venture, Product } from '@/types';

export interface CreateVentureData extends Omit<Venture, 'id' | 'createdAt' | 'updatedAt' | 'products'> { }
export interface UpdateVentureData extends Partial<CreateVentureData> { }

export interface CreateProductData {
  name: string;
  description?: string;
  price?: number;
  currency?: string;
  category?: string;
  type?: 'product' | 'service';
  size?: string;
  dimensions?: string;
  imageUrl?: string;
  videoUrl?: string;
  ventureId: string;
}

export interface UpdateProductData extends Partial<CreateProductData> { }

class VenturesService {
  private readonly endpoint = '/rest/v1/ventures';
  private readonly productEndpoint = '/rest/v1/products';

  private mapProduct(p: any): Product {
    return {
      ...p,
      imageUrl: p.image_url,
      videoUrl: p.video_url,
      ventureId: p.venture_id,
      createdAt: p.created_at
    };
  }

  private mapVenture(v: any): Venture {
    return {
      ...v,
      logoUrl: v.logo_url,
      ownerImageUrl: v.owner_image_url,
      ownerId: v.owner_id,
      createdAt: v.created_at,
      updatedAt: v.updated_at,
      products: v.products ? v.products.map((p: any) => this.mapProduct(p)) : undefined
    };
  }

  /**
   * Get all ventures with products
   */
  async getVentures(): Promise<Venture[]> {
    const response = await axiosClient.get(`${this.endpoint}?select=*,products(*)`);
    return response.data.map((v: any) => this.mapVenture(v));
  }

  /**
   * Get single venture by ID with products
   */
  async getVentureById(id: string): Promise<Venture> {
    const response = await axiosClient.get(`${this.endpoint}?id=eq.${id}&select=*,products(*)`);
    return response.data[0] ? this.mapVenture(response.data[0]) : response.data[0];
  }

  /**
   * Create new venture
   */
  async createVenture(data: CreateVentureData): Promise<Venture> {
    const dbData = {
      name: data.name,
      owner: data.owner,
      description: data.description,
      logo_url: data.logoUrl,
      owner_image_url: data.ownerImageUrl,
      whatsapp: data.whatsapp,
      instagram: data.instagram,
      facebook: data.facebook,
      website: data.website,
      email: data.email,
      owner_id: data.ownerId
    };

    const response = await axiosClient.post(this.endpoint, dbData, {
      headers: { 'Prefer': 'return=representation' }
    });
    return this.mapVenture(response.data[0]);
  }

  /**
   * Update venture
   */
  async updateVenture(id: string, data: UpdateVentureData): Promise<Venture> {
    const dbData: any = {};
    if (data.name) dbData.name = data.name;
    if (data.owner) dbData.owner = data.owner;
    if (data.description) dbData.description = data.description;
    if (data.logoUrl) dbData.logo_url = data.logoUrl;
    if (data.ownerImageUrl) dbData.owner_image_url = data.ownerImageUrl;
    if (data.whatsapp) dbData.whatsapp = data.whatsapp;
    if (data.instagram) dbData.instagram = data.instagram;
    if (data.facebook) dbData.facebook = data.facebook;
    if (data.website) dbData.website = data.website;
    if (data.email) dbData.email = data.email;
    if (data.ownerId) dbData.owner_id = data.ownerId;

    const response = await axiosClient.patch(`${this.endpoint}?id=eq.${id}`, dbData, {
      headers: { 'Prefer': 'return=representation' }
    });
    return this.mapVenture(response.data[0]);
  }

  /**
   * Delete venture
   */
  async deleteVenture(id: string): Promise<void> {
    await axiosClient.delete(`${this.endpoint}?id=eq.${id}`);
  }

  /**
   * Search ventures by name
   */
  async searchVentures(query: string): Promise<Venture[]> {
    const response = await axiosClient.get(`${this.endpoint}?name=ilike.*${query}*&select=*`);
    return response.data.map((v: any) => this.mapVenture(v));
  }

  /**
   * Get products by venture
   */
  async getProductsByVenture(ventureId: string): Promise<Product[]> {
    const response = await axiosClient.get(`${this.productEndpoint}?venture_id=eq.${ventureId}&select=*`);
    return response.data.map((p: any) => this.mapProduct(p));
  }

  /**
   * Create product
   */
  async createProduct(data: CreateProductData): Promise<Product> {
    const dbData = {
      name: data.name,
      description: data.description,
      price: data.price,
      currency: data.currency,
      category: data.category,
      type: data.type,
      size: data.size,
      dimensions: data.dimensions,
      image_url: data.imageUrl,
      video_url: data.videoUrl,
      venture_id: data.ventureId
    };

    const response = await axiosClient.post(this.productEndpoint, dbData, {
      headers: { 'Prefer': 'return=representation' }
    });
    return this.mapProduct(response.data[0]);
  }

  /**
   * Update product
   */
  async updateProduct(id: string, data: UpdateProductData): Promise<Product> {
    const dbData: any = {};
    if (data.name) dbData.name = data.name;
    if (data.description) dbData.description = data.description;
    if (data.price !== undefined) dbData.price = data.price;
    if (data.currency) dbData.currency = data.currency;
    if (data.category) dbData.category = data.category;
    if (data.type) dbData.type = data.type;
    if (data.size) dbData.size = data.size;
    if (data.dimensions) dbData.dimensions = data.dimensions;
    if (data.imageUrl) dbData.image_url = data.imageUrl;
    if (data.videoUrl) dbData.video_url = data.videoUrl;
    if (data.ventureId) dbData.venture_id = data.ventureId;

    const response = await axiosClient.patch(`${this.productEndpoint}?id=eq.${id}`, dbData, {
      headers: { 'Prefer': 'return=representation' }
    });
    return this.mapProduct(response.data[0]);
  }

  /**
   * Delete product
   */
  async deleteProduct(id: string): Promise<void> {
    await axiosClient.delete(`${this.productEndpoint}?id=eq.${id}`);
  }
}

export default new VenturesService();
