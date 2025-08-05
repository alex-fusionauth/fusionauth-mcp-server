# FusionAuth MCP Tools

Model Context Protocol (MCP) tools for FusionAuth integration, providing seamless user management and authentication capabilities for AI applications.

## Features

- **User Management**: Create, read, update, delete, and search users
- **Application Management**: Create and manage FusionAuth applications
- **MCP Integration**: Full Model Context Protocol server implementation
- **Type Safety**: Built with TypeScript and Zod validation
- **Examples**: Includes Next.js and Express.js example applications

## Installation

```bash
npm install @fusionauth/mcp-tools
```

## Quick Start

### Using the MCP Server

```javascript
import { FusionAuthMCPServer } from '@fusionauth/mcp-tools';

const server = new FusionAuthMCPServer({
  apiKey: 'your-fusionauth-api-key',
  baseUrl: 'http://localhost:9011',
  tenantId: 'your-tenant-id' // optional
});

await server.run();
```

### Using the Tools Directly

```javascript
import { FusionAuthTools } from '@fusionauth/mcp-tools';

const fusionAuth = new FusionAuthTools({
  apiKey: 'your-fusionauth-api-key',
  baseUrl: 'http://localhost:9011'
});

// Create a user
const result = await fusionAuth.createUser({
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  password: 'securePassword123'
});

// Search users
const users = await fusionAuth.searchUsers({
  queryString: 'john',
  numberOfResults: 10
});
```

## Available Tools

### User Management
- `create_user` - Create a new user
- `get_user` - Retrieve a user by ID or email
- `search_users` - Search users with query string
- `update_user` - Update an existing user
- `delete_user` - Delete a user (soft or hard delete)

### Application Management
- `create_application` - Create a new application
- `get_applications` - Retrieve all applications

## Development Setup

This repository includes a complete development environment with Docker and example applications.

### Prerequisites

- Node.js 18+ and pnpm
- Docker and Docker Compose

### Setup

1. Clone the repository:
```bash
git clone https://github.com/FusionAuth/mcp-tools
cd mcp-tools
```

2. Install dependencies:
```bash
pnpm install
```

3. Start FusionAuth with Docker:
```bash
pnpm run docker:up
```

4. Build the MCP tools:
```bash
pnpm run build
```

5. Run the examples:
```bash
# Next.js example (runs on port 3001)
pnpm run example:nextjs

# Express example (runs on port 3002)
pnpm run example:express
```

### Docker Environment

The Docker setup includes:
- **FusionAuth**: Running on `http://localhost:9011`
- **PostgreSQL**: Database backend
- **Kickstart Configuration**: Pre-configured with sample users and applications

#### Default Credentials
- **Admin**: admin@example.com / password
- **Test Users**: 
  - user@example.com / password
  - jane.doe@example.com / password
  - john.smith@example.com / password

#### API Configuration
- **API Key**: `bf69486b-4733-4470-a592-f1bfce7af580`
- **Base URL**: `http://localhost:9011`

## Examples

### Next.js Example
Located in `examples/nextjs/`, this demonstrates:
- Server-side API integration
- User search functionality
- Modern React patterns

### Express Example
Located in `examples/express/`, this provides:
- RESTful API endpoints
- Complete CRUD operations
- Middleware integration

## API Reference

### FusionAuthTools

#### Constructor
```typescript
constructor(config: FusionAuthConfig)
```

#### Methods

##### createUser(params: CreateUserParams)
Creates a new user in FusionAuth.

##### getUser(userId?: string, email?: string)
Retrieves a user by ID or email address.

##### searchUsers(params: SearchUsersParams)
Searches for users using a query string with pagination.

##### updateUser(params: UpdateUserParams)
Updates an existing user's information.

##### deleteUser(params: DeleteUserParams)
Deletes a user (supports both soft and hard delete).

##### createApplication(params: CreateApplicationParams)
Creates a new application with optional roles.

##### getApplications()
Retrieves all applications in the tenant.

## Configuration

### Environment Variables

```bash
FUSIONAUTH_API_KEY=your-api-key
FUSIONAUTH_BASE_URL=http://localhost:9011
FUSIONAUTH_TENANT_ID=your-tenant-id # optional
```

### FusionAuthConfig

```typescript
interface FusionAuthConfig {
  apiKey: string;        // Required: FusionAuth API key
  baseUrl: string;       // Required: FusionAuth base URL
  tenantId?: string;     // Optional: Specific tenant ID
}
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Run the test suite: `pnpm test`
5. Submit a pull request

## License

Apache 2.0 - see the [LICENSE](LICENSE) file for details.

## Support

- [FusionAuth Documentation](https://fusionauth.io/docs/)
- [GitHub Issues](https://github.com/FusionAuth/mcp-tools/issues)
- [Community Forum](https://fusionauth.io/community/)