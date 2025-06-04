import express from 'express';
import type { Request, Response } from 'express';
import { config } from 'dotenv';
import { DEV } from 'esm-env';
import { FusionAuthClient } from '@fusionauth/typescript-client'; // Import the official client

// Load environment variables from .env file
config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // Enable JSON body parsing

// Configure FusionAuth Client using the official library
const fusionAuthClient = new FusionAuthClient(
    process.env.FUSIONAUTH_API_KEY!, // API Key (use ! for non-null assertion as dotenv might not guarantee it)
    process.env.FUSIONAUTH_URL!      // FusionAuth instance URL
);

// Example MCP endpoint that calls FusionAuth for user registration
app.post('/mcp/register-user', async (req: Request, res: Response) => {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required for registration.' });
    }

    try {
        const registrationRequest = {
            user: {
                email: email,
                password: password,
                firstName: firstName,
                lastName: lastName,
            },
            registrations: [ // FusionAuth often expects an array of registrations
                {
                    applicationId: process.env.FUSIONAUTH_APPLICATION_ID!, // Your FusionAuth Application ID
                    // other registration details if needed, e.g., verified: true
                }
            ]
        };

        // Make the call to FusionAuth using the official client
        // Note: The method name and payload structure might differ slightly from the generated one.
        // The official client typically has methods like .register, .login, etc.
        const clientResponse = await fusionAuthClient.register('', registrationRequest);

        if (clientResponse.statusCode === 200) {
            console.log('User registered successfully:', clientResponse.response.user?.id);
            return res.status(200).json({
                mcpStatus: 'SUCCESS',
                userId: clientResponse.response.user?.id,
                message: 'User registered via MCP',
            });
        } else {
            console.error('Failed to register user:', clientResponse.statusCode, clientResponse.errorResponse);
            return res.status(clientResponse.statusCode || 500).json({
                mcpStatus: 'ERROR',
                message: 'Failed to register user (FusionAuth returned error)',
                fusionAuthErrors: clientResponse.errorResponse,
            });
        }

    } catch (error: any) {
        console.error('Unexpected error registering user with FusionAuth:', error.message);
        return res.status(500).json({
            mcpStatus: 'ERROR',
            message: 'Failed to process user registration via MCP',
            details: error.message,
        });
    }
});

// Example MCP endpoint for user authentication (login)
app.post('/mcp/authenticate-user', async (req: Request, res: Response) => {
    const { loginId, password, applicationId } = req.body;

    if (!loginId || !password || !applicationId) {
        return res.status(400).json({ message: 'loginId, password, and applicationId are required for authentication.' });
    }

    try {
        const loginRequest = {
            loginId: loginId,
            password: password,
            applicationId: applicationId,
        };

        const clientResponse = await fusionAuthClient.login(loginRequest);

        if (clientResponse.statusCode === 200) {
            console.log('User authenticated successfully. JWT issued.');
            return res.status(200).json({
                mcpStatus: 'SUCCESS',
                accessToken: clientResponse.response.token,
                refreshToken: clientResponse.response.refreshToken,
                user: clientResponse.response.user,
                message: 'User authenticated via MCP'
            });
        } else {
            console.error('Authentication failed:', clientResponse.statusCode, clientResponse.errorResponse);
            return res.status(clientResponse.statusCode || 401).json({
                mcpStatus: 'ERROR',
                message: 'Authentication failed via MCP',
                fusionAuthErrors: clientResponse.errorResponse,
            });
        }

    } catch (error: any) {
        console.error('Unexpected error authenticating user with FusionAuth:', error.message);
        return res.status(500).json({
            mcpStatus: 'ERROR',
            message: 'Failed to process user authentication via MCP',
            details: error.message,
        });
    }
});


// Add more MCP endpoints here, mapping to various FusionAuth calls.
// The official client provides methods corresponding to the FusionAuth API endpoints,
// for example:
// - fusionAuthClient.retrieveUser(userId)
// - fusionAuthClient.updateUser(userId, { user: { ... } })
// - fusionAuthClient.changePassword(changePasswordRequest)
// - fusionAuthClient.validateJWT(token)

// Basic health check endpoint
app.get('/', (req: Request, res: Response) => {
    res.send('FusionAuth MCP Server is running!');
});

app.listen(port, () => {
    console.log(`FusionAuth MCP server listening on port ${port} ${DEV ? '(Development Mode)' : ''}`);
});