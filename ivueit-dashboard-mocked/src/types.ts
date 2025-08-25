export type PropertyStatus = 'available' | 'pending' | 'sold';
export interface Property {
  id: string;
  name: string;
  price: number;
  status: PropertyStatus;
  location: string;
}
