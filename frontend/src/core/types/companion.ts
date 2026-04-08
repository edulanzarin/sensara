export interface Companion {
  id: string;
  nickname: string;
  bio: string | null;
  age: number;
  height: number | null;
  weight: number | null;
  ethnicity: string | null;
  hairColor: string | null;
  eyeColor: string | null;
  city: string;
  state: string;
  neighborhood: string | null;
  whatsapp: string | null;
  basePrice: number | null;
  profileViews: number;
  verified: boolean;
  profilePictureUrl: string | null;
  reliabilityScore: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}