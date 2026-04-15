export interface CustomerRegisteredEvent {
  id: number;
  userId: string;
  name: string;
  phone: string;
  address: string;
  address2: string | null;
  city: string;
  state: string;
  zipcode: string;
}