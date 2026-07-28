export interface CreateRestaurantDto {
  name: string;
  description?: string;
  lat?: number;
  lng?: number;
}
export interface UpdateRestaurantDto {
  name?: string;
  description?: string;
  lat?: number;
  lng?: number;
}

// DTO pou Menu Item
export interface CreateMenuItemDto {
  name: string;
  price: number;
  description: string;
  image?: string;
  categoryId?: string;
  isAvailable?: boolean;
  prepTime?: number;
}
export interface UpdateMenuItemDto {
  name?: string;
  price?: number;
  description?: string;
  image?: string;
  categoryId?: string;
  isAvailable?: boolean;
  prepTime?: number;
}