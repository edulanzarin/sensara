export interface Companion {
  id: string;
  nickname: string;
  age: number;
  city: string;
  state: string;
  basePrice: number;
  profileViews: number;
  verified: boolean;
  // futuramente adicionaremos a foto de perfil aqui
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}