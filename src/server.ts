import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { FusionAuthTools } from './tools.js';
import {
  CreateUserSchema,
  SearchUsersSchema,
  UpdateUserSchema,
  DeleteUserSchema,
  CreateApplicationSchema,
  GetUserSchema,
} from './schemas.js';
import type { FusionAuthConfig } from './types.js';

export class FusionAuthMCPServer {
  private server: Server;
  private fusionAuth: FusionAuthTools;

  constructor(config: FusionAuthConfig) {
    this.server = new Server(
      {
        name: 'fusionauth-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.fusionAuth = new FusionAuthTools(config);
    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'create_user',
            description: 'Create a new user in FusionAuth',
            inputSchema: {
              type: 'object',
              properties: {
                email: {
                  type: 'string',
                  format: 'email',
                  description: 'User email address',
                },
                password: {
                  type: 'string',
                  description: 'User password (optional)',
                },
                firstName: {
                  type: 'string',
                  description: 'User first name (optional)',
                },
                lastName: {
                  type: 'string',
                  description: 'User last name (optional)',
                },
                username: {
                  type: 'string',
                  description: 'Username (optional)',
                },
                data: {
                  type: 'object',
                  description: 'Additional user data (optional)',
                },
              },
              required: ['email'],
            },
          },
          {
            name: 'get_user',
            description: 'Retrieve a user by ID or email',
            inputSchema: {
              type: 'object',
              properties: {
                userId: {
                  type: 'string',
                  format: 'uuid',
                  description: 'User ID',
                },
                email: {
                  type: 'string',
                  format: 'email',
                  description: 'User email address',
                },
              },
            },
          },
          {
            name: 'search_users',
            description: 'Search for users using a query string',
            inputSchema: {
              type: 'object',
              properties: {
                queryString: {
                  type: 'string',
                  description: 'Search query string (optional)',
                },
                numberOfResults: {
                  type: 'number',
                  minimum: 1,
                  maximum: 500,
                  description: 'Number of results to return (default: 25)',
                },
                startRow: {
                  type: 'number',
                  minimum: 0,
                  description: 'Starting row for pagination (default: 0)',
                },
              },
            },
          },
          {
            name: 'update_user',
            description: 'Update an existing user',
            inputSchema: {
              type: 'object',
              properties: {
                userId: {
                  type: 'string',
                  format: 'uuid',
                  description: 'User ID',
                },
                user: {
                  type: 'object',
                  properties: {
                    email: {
                      type: 'string',
                      format: 'email',
                      description: 'User email address',
                    },
                    firstName: {
                      type: 'string',
                      description: 'User first name',
                    },
                    lastName: {
                      type: 'string',
                      description: 'User last name',
                    },
                    username: {
                      type: 'string',
                      description: 'Username',
                    },
                    data: {
                      type: 'object',
                      description: 'Additional user data',
                    },
                  },
                },
              },
              required: ['userId', 'user'],
            },
          },
          {
            name: 'delete_user',
            description: 'Delete a user from FusionAuth',
            inputSchema: {
              type: 'object',
              properties: {
                userId: {
                  type: 'string',
                  format: 'uuid',
                  description: 'User ID',
                },
                hardDelete: {
                  type: 'boolean',
                  description: 'Whether to hard delete the user (default: false)',
                },
              },
              required: ['userId'],
            },
          },
          {
            name: 'create_application',
            description: 'Create a new application in FusionAuth',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Application name',
                },
                roles: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string',
                        description: 'Role name',
                      },
                      description: {
                        type: 'string',
                        description: 'Role description',
                      },
                    },
                    required: ['name'],
                  },
                  description: 'Application roles (optional)',
                },
              },
              required: ['name'],
            },
          },
          {
            name: 'get_applications',
            description: 'Retrieve all applications',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case 'create_user': {
            const validatedArgs = CreateUserSchema.parse(args);
            const result = await this.fusionAuth.createUser(validatedArgs);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'get_user': {
            const validatedArgs = GetUserSchema.parse(args);
            const result = await this.fusionAuth.getUser(
              validatedArgs.userId,
              validatedArgs.email
            );
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'search_users': {
            const validatedArgs = SearchUsersSchema.parse(args);
            const result = await this.fusionAuth.searchUsers(validatedArgs);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'update_user': {
            const validatedArgs = UpdateUserSchema.parse(args);
            const result = await this.fusionAuth.updateUser(validatedArgs);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'delete_user': {
            const validatedArgs = DeleteUserSchema.parse(args);
            const result = await this.fusionAuth.deleteUser(validatedArgs);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'create_application': {
            const validatedArgs = CreateApplicationSchema.parse(args);
            const result = await this.fusionAuth.createApplication(validatedArgs);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'get_applications': {
            const result = await this.fusionAuth.getApplications();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing tool: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}