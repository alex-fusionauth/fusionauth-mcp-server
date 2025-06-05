import type { Genkit } from 'genkit';
import { userInput, userOutput } from './types.js';
import { FusionAuthClient } from '@fusionauth/typescript-client';

export interface UserTools {
    userCreateTool: ReturnType<typeof Genkit.prototype.defineTool<
        typeof userInput,
        typeof userOutput
    >>;
}

export function registerUserTools(ai: Genkit): UserTools {
    // Configure FusionAuth Client using the official library
    const fusionAuthClient = new FusionAuthClient(
        process.env.FUSIONAUTH_API_KEY!, // API Key (use ! for non-null assertion as dotenv might not guarantee it)
        process.env.FUSIONAUTH_URL!,      // FusionAuth instance URL
        process.env.FUSIONAUTH_TENANT_ID // Optional: Tenant ID if using multi-tenancy
    );

    /**
     * Genkit tool to create a new user in FusionAuth.
     * This tool wraps the `createUser` method of our mock FusionAuth client.
     */
    const userCreateTool = ai.defineTool(
        {
            name: 'fusionauth/createUser',
            description: 'Creates a new user in FusionAuth with the provided email, password, and optional full name.',
            inputSchema: userInput,
            outputSchema: userOutput,
        },
        async (input) => {
            try {
                const result = await fusionAuthClient.createUser('', {
                    applicationId: process.env.FUSIONAUTH_APPLICATION_ID, // Ensure you set this in your .env file,
                    user: {
                        email: input.email,
                        password: input.password,
                        fullName: input.fullName,
                    }
                });
                if (result.statusCode !== 200) {
                    throw new Error(`Failed to create user: ${result.exception}`);
                }
                const user = result.response.user;
                if (!user || !user.id || !user.email) {
                    throw new Error('User creation response did not contain correct user data.');
                }
                return {
                    id: user.id,
                    email: user.email,
                }
            } catch (error: any) {
                console.error('Error creating user:', error);
                throw new Error(`Failed to create user: ${JSON.stringify(error) || 'Unknown error'}`);
            }
        }
    );
    return { userCreateTool }
}