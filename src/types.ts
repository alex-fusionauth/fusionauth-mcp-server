import type { 
  User, 
  Application, 
  Group, 
  UserRegistration,
  LoginRequest,
  SearchRequest 
} from '@fusionauth/typescript-client';

export interface FusionAuthConfig {
  apiKey: string;
  baseUrl: string;
  tenantId?: string;
}

export interface CreateUserParams {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  data?: Record<string, any>;
  userRegistration?: UserRegistration;
}

export interface SearchUsersParams {
  queryString?: string;
  numberOfResults?: number;
  startRow?: number;
  sortFields?: Array<{
    name: string;
    order?: 'asc' | 'desc';
  }>;
}

export interface UpdateUserParams {
  userId: string;
  user: Partial<User>;
}

export interface DeleteUserParams {
  userId: string;
  hardDelete?: boolean;
}

export interface CreateApplicationParams {
  name: string;
  roles?: Array<{
    name: string;
    description?: string;
  }>;
  oauthConfiguration?: any;
  jwtConfiguration?: any;
}

export interface FusionAuthToolResult {
  success: boolean;
  data?: any;
  error?: string;
}