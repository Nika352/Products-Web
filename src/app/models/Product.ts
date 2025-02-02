export interface Product {
  id?: number;
  code: string;
  name: string;
  price: number;
  categoryId: number;
  countryId: number;
  createdAt?: string;
  endDate?: string;
  category?: {
      name: string;
      parentId: number;
      id: number;
  };
  country?: {
      name: string;
      id: number;
  };
}