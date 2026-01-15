# API Integration Standard: Casa Javorai

To ensure consistency, reliability, and ease of maintenance, all API integrations in this project MUST follow this standardized architectural pattern.

## 1. Architecture Overview
We follow a 3-layer architecture for data:
1.  **Database (Supabase)**: Uses `snake_case` (e.g., `start_time`, `user_id`).
2.  **Service Layer (`@/services/`)**: The ONLY place where `axiosClient` is used. Standardizes mapping between DB and Frontend.
3.  **Hook Layer (`@/hooks/queries/`)**: Wraps services with `TanStack Query` for caching and state management.
4.  **UI Layer (`@/app/` & `@/components/`)**: ONLY uses hooks. Never calls axios directly.

## 2. The Standard Service Pattern

Every service must implement a private mapping function and separate DB types from Domain types.

### Example Service Structure
```typescript
class ExampleService {
  private readonly endpoint = '/rest/v1/examples';

  // Maps DB (snake_case) to Domain (camelCase)
  private mapExample(e: any): Example {
    return {
      ...e,
      propertyName: e.property_name, // Mapping
      createdAt: e.created_at ? new Date(e.created_at) : undefined
    };
  }

  async getExamples(): Promise<Example[]> {
    const response = await axiosClient.get(this.endpoint);
    return response.data.map((item: any) => this.mapExample(item));
  }

  async createExample(data: CreateExampleData): Promise<Example> {
    const dbData = {
      property_name: data.propertyName, // Inverse mapping
      // ...
    };
    const response = await axiosClient.post(this.endpoint, dbData);
    return this.mapExample(response.data[0]);
  }
}
```

## 3. Best Practices
- **Never Stringify JSONB**: When sending data to a `JSONB` column, send the Javascript object directly. `axiosClient` handles the conversion correctly for Supabase.
- **Always use Shared Types**: Import interfaces from `@/types` to ensure type safety across the entire application.
- **Consistent Dates**: Standardize on using `Date` objects in the Domain logic and ISO strings for DB transmission (handled by service layer).
- **Case Sensitivity**: The database is strictly `snake_case`. The application is strictly `camelCase`.
