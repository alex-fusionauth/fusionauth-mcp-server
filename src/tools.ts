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

      if (response.wasSuccessful()) {
        return {
          success: true,
          data: response.response.user,
        };
      } else {
        return {
          success: false,
          error: response.exception?.message || 'Failed to create user',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
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

      if (response.wasSuccessful()) {
        return {
          success: true,
          data: response.response.user,
        };
      } else {
        return {
          success: false,
          error: response.exception?.message || 'Failed to retrieve user',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
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

      if (response.wasSuccessful()) {
        return {
          success: true,
          data: {
            users: response.response.users,
            total: response.response.total,
          },
        };
      } else {
        return {
          success: false,
          error: response.exception?.message || 'Failed to search users',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async updateUser(params: UpdateUserParams): Promise<FusionAuthToolResult> {
    try {
      const response = await this.client.updateUser(params.userId, {
        user: params.user,
      });

      if (response.wasSuccessful()) {
        return {
          success: true,
          data: response.response.user,
        };
      } else {
        return {
          success: false,
          error: response.exception?.message || 'Failed to update user',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async deleteUser(params: DeleteUserParams): Promise<FusionAuthToolResult> {
    try {
      const response = await this.client.deleteUser(params.userId);

      if (response.wasSuccessful()) {
        return {
          success: true,
          data: { deleted: true },
        };
      } else {
        return {
          success: false,
          error: response.exception?.message || 'Failed to delete user',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
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

      if (response.wasSuccessful()) {
        return {
          success: true,
          data: response.response.application,
        };
      } else {
        return {
          success: false,
          error: response.exception?.message || 'Failed to create application',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getApplications(): Promise<FusionAuthToolResult> {
    try {
      const response = await this.client.retrieveApplications();

      if (response.wasSuccessful()) {
        return {
          success: true,
          data: response.response.applications,
        };
      } else {
        return {
          success: false,
          error: response.exception?.message || 'Failed to retrieve applications',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}