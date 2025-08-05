import { FusionAuthClient } from '@fusionauth/typescript-client';
import type {
  FusionAuthConfig,
  CreateUserParams,
  SearchUsersParams,
  UpdateUserParams,
  DeleteUserParams,
  CreateApplicationParams,
  FusionAuthToolResult
} from './types.js';

export class FusionAuthTools {
  private client: FusionAuthClient;

  constructor(config: FusionAuthConfig) {
    this.client = new FusionAuthClient(config.apiKey, config.baseUrl, config.tenantId || '');
  }

  async createUser(params: CreateUserParams): Promise<FusionAuthToolResult> {
    try {
      const response = await this.client.createUser('', {
        user: {
          email: params.email,
          password: params.password,
          firstName: params.firstName,
          lastName: params.lastName,
          username: params.username,
          data: params.data,
        }
      });
      return {
        success: response.wasSuccessful(),
        statusCode: response.statusCode,
        data: response.response?.user,
        raw: response
      };
    } catch (error: any) {
      return {
        success: false,
        statusCode: error?.statusCode,
        error: error?.message || error?.toString() || 'Unknown error',
        raw: error
      };
    }
  }

  async getUser(userId?: string, email?: string): Promise<FusionAuthToolResult> {
    try {
      let response;
      if (userId) {
        response = await this.client.retrieveUser(userId);
      } else if (email) {
        response = await this.client.retrieveUserByEmail(email);
      } else {
        return {
          success: false,
          error: 'Either userId or email must be provided',
        };
      }
      return {
        success: response.wasSuccessful(),
        statusCode: response.statusCode,
        data: response.response?.user,
        raw: response
      };
    } catch (error: any) {
      return {
        success: false,
        statusCode: error?.statusCode,
        error: error?.message || error?.toString() || 'Unknown error',
        raw: error
      };
    }
  }

  async searchUsers(params: SearchUsersParams): Promise<FusionAuthToolResult> {
    try {
      const response = await this.client.searchUsersByQuery({
        search: {
          queryString: params.queryString,
          numberOfResults: params.numberOfResults || 25,
          startRow: params.startRow || 0,
          sortFields: params.sortFields?.map(field => ({
            name: field.name,
            order: field.order as any
          })),
        },
      });
      return {
        success: response.wasSuccessful(),
        statusCode: response.statusCode,
        data: {
          users: response.response?.users,
          total: response.response?.total,
        },
        raw: response
      };
    } catch (error: any) {
      return {
        success: false,
        statusCode: error?.statusCode,
        error: error?.message || error?.toString() || 'Unknown error',
        raw: error
      };
    }
  }

  async updateUser(params: UpdateUserParams): Promise<FusionAuthToolResult> {
    try {
      const response = await this.client.updateUser(params.userId, {
        user: params.user,
      });
      return {
        success: response.wasSuccessful(),
        statusCode: response.statusCode,
        data: response.response?.user,
        raw: response
      };
    } catch (error: any) {
      return {
        success: false,
        statusCode: error?.statusCode,
        error: error?.message || error?.toString() || 'Unknown error',
        raw: error
      };
    }
  }

  async deleteUser(params: DeleteUserParams): Promise<FusionAuthToolResult> {
    try {
      const response = await this.client.deleteUser(params.userId);
      return {
        success: response.wasSuccessful(),
        statusCode: response.statusCode,
        data: response.response,
        raw: response
      };
    } catch (error: any) {
      return {
        success: false,
        statusCode: error?.statusCode,
        error: error?.message || error?.toString() || 'Unknown error',
        raw: error
      };
    }
  }

  async createApplication(params: CreateApplicationParams): Promise<FusionAuthToolResult> {
    try {
      const response = await this.client.createApplication('', {
        application: {
          name: params.name,
          roles: params.roles,
          oauthConfiguration: params.oauthConfiguration,
          jwtConfiguration: params.jwtConfiguration,
        },
      });
      return {
        success: response.wasSuccessful(),
        statusCode: response.statusCode,
        data: response.response?.application,
        raw: response
      };
    } catch (error: any) {
      return {
        success: false,
        statusCode: error?.statusCode,
        error: error?.message || error?.toString() || 'Unknown error',
        raw: error
      };
    }
  }

  async getApplications(): Promise<FusionAuthToolResult> {
    try {
      const response = await this.client.retrieveApplications();
      return {
        success: response.wasSuccessful(),
        statusCode: response.statusCode,
        data: response.response?.applications,
        raw: response
      };
    } catch (error: any) {
      return {
        success: false,
        statusCode: error?.statusCode,
        error: error?.message || error?.toString() || 'Unknown error',
        raw: error
      };
    }
  }
}