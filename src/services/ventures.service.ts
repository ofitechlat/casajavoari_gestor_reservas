import axiosClient from '@/lib/axios-client';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  currency: string;
  category?: string;
  type: 'product' | 'service';
  size?: string;
  dimensions?: string;
  imageUrl?: string;
  videoUrl?: string;
  ventureId: string;
  createdAt?: string;
}

export interface Venture {
  id: string;
  name: string;
  owner: string;
  description?: string;
  logoUrl?: string;
  ownerImageUrl?: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  website?: string;
  email?: string;
  userId?: string;
  createdAt: string;
  Product?: Product[];
}

export interface CreateVentureData {
  name: string;
  owner: string;
  description?: string;
  logoUrl?: string;
  ownerImageUrl?: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  website?: string;
  email?: string;
}

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
  private readonly endpoint = '/rest/v1/Venture';
  private readonly productEndpoint = '/rest/v1/Product';

  /**
   * Get all ventures
   */
  async getVentures(): Promise<Venture[]> {
    const response = await axiosClient.get(`${this.endpoint}?order=name.asc`);
    return response.data;
  }

  /**
   * Get single venture by ID with optional products
   */
  async getVentureById(id: string, includeProducts = true): Promise<Venture> {
    const select = includeProducts ? '*, Product(*)' : '*';
    const response = await axiosClient.get(`${this.endpoint}?id=eq.${id}&select=${select}`);
    return response.data[0];
  }

  /**
   * Create new venture
   */
  async createVenture(data: CreateVentureData): Promise<Venture> {
    const response = await axiosClient.post(this.endpoint, data, {
      headers: {
        'Prefer': 'return=representation',
      },
    });
    return response.data[0];
  }

  /**
   * Update venture
   */
  async updateVenture(id: string, data: UpdateVentureData): Promise<Venture> {
    const response = await axiosClient.patch(`${this.endpoint}?id=eq.${id}`, data, {
      headers: {
        'Prefer': 'return=representation',
      },
    });
    return response.data[0];
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
    const response = await axiosClient.get(
      `${this.endpoint}?name=ilike.*${query}*&order=name.asc`
    );
    return response.data;
  }

  /**
   * Create product
   */
  async createProduct(data: CreateProductData): Promise<Product> {
    const response = await axiosClient.post(this.productEndpoint, data, {
      headers: {
        'Prefer': 'return=representation',
      },
    });
    return response.data[0];
  }

  /**
   * Update product
   */
  async updateProduct(id: string, data: UpdateProductData): Promise<Product> {
    const response = await axiosClient.patch(`${this.productEndpoint}?id=eq.${id}`, data, {
      headers: {
        'Prefer': 'return=representation',
      },
    });
    return response.data[0];
  }

  /**
   * Delete product
   */
  async deleteProduct(id: string): Promise<void> {
    await axiosClient.delete(`${this.productEndpoint}?id=eq.${id}`);
  }
}

export default new VenturesService();
