import express from 'express';
import type { Request, Response } from 'express';

import { genkit, z } from 'genkit';
import { mcpServer } from 'genkitx-mcp';
import { config } from 'dotenv';
import { DEV } from 'esm-env';
import { FusionAuthClient } from '@fusionauth/typescript-client'; // Import the official client
import googleAI from '@genkit-ai/googleai';

const MODEL = 'googleai/gemini-2.5-flash-preview-05-20'; // Define the model to use

// Load environment variables from .env file
config();

// Configure FusionAuth Client using the official library
const fusionAuthClient = new FusionAuthClient(
    process.env.FUSIONAUTH_API_KEY!, // API Key (use ! for non-null assertion as dotenv might not guarantee it)
    process.env.FUSIONAUTH_URL!,      // FusionAuth instance URL
    process.env.FUSIONAUTH_TENANT_ID // Optional: Tenant ID if using multi-tenancy
);

const ai = genkit({
    plugins: [googleAI()],
    model: googleAI.model(MODEL),
});

/** User Input Model */

const userInput = z.object({
    email: z.string().email('Invalid email format.').describe('The email address of the new user.'),
    password: z.string().min(8, 'Password must be at least 8 characters long.').describe('The password for the new user.'),
    fullName: z.string().optional().describe('The optional full name of the user.'),
});


/**
 * Genkit tool to create a new user in FusionAuth.
 * This tool wraps the `createUser` method of our mock FusionAuth client.
 */
ai.defineTool(
    {
        name: 'fusionauth/createUser',
        description: 'Creates a new user in FusionAuth with the provided email, password, and optional full name.',
        inputSchema: userInput,
        outputSchema: z.object({
            userId: z.string().describe('The unique ID of the newly created user.'),
            email: z.string().email().describe('The email of the newly created user.'),
        }),
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
                userId: user.id,
                email: user.email,
            }
        } catch (error: any) {
            console.error('Error creating user:', error);
            throw new Error(`Failed to create user: ${JSON.stringify(error) || 'Unknown error'}`);
        }
    }
);

ai.definePrompt({
    name: 'createSingleUser',
    description: 'Creates a new user in FusionAuth with the provided email, password, and optional full name.',
    model: MODEL,
    input: {
        schema: userInput
    },
    prompt: 'Create a new user with the following details: Email: {{email}}, Password: {{password}}, Name: {{fullName}}',
    tools: ['fusionauth/createUser'],
    toolChoice: 'required',
});

export const multipleUserCreationFlow = ai.defineFlow(
    {
        name: 'multipleUserCreationFlow',
        inputSchema: z.object({
            numberOfUsers: z.number().min(1, 'You must create at least one user.').describe('The number of users to create.'),
        }),
        outputSchema: z.array(userInput).describe('An array of example user objects.'),
    },
    async ({ numberOfUsers }) => {
        const response = await ai.generate({
            model: MODEL,
            prompt: `Create ${numberOfUsers} new users with random universally unique emails, passwords, and names.`,
            output: {
                schema: z.array(z.object({
                    email: z.string(),
                    password: z.string(),
                    name: z.string(),
                })),
            },
        });

        if (!response || !response.output || !Array.isArray(response.output)) {
            throw new Error('Invalid response from AI model. Expected an array of user objects.');
        }

        // Access prompt for creating users
        const createUser = ai.prompt('createSingleUser');

        // Create each user using the FusionAuth tool.
        const users = [];
        for (const user of response.output) {
            const response = await createUser(user);
            users.push(response.output)
        }
        return users;
    },
);

/**
 * Genkit tool to create a new user in FusionAuth.
 * This tool wraps the `createUser` method of our mock FusionAuth client.
 */
ai.defineTool(
    {
        name: 'fusionauth/createUser',
        description: 'Creates a new user in FusionAuth with the provided email, password, and optional full name.',
        inputSchema: userInput,
        outputSchema: z.object({
            userId: z.string().describe('The unique ID of the newly created user.'),
            email: z.string().email().describe('The email of the newly created user.'),
        }),
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
                userId: user.id,
                email: user.email,
            }
        } catch (error: any) {
            console.error('Error creating user:', error);
            throw new Error(`Failed to create user: ${JSON.stringify(error) || 'Unknown error'}`);
        }
    }
);

// --- Start the MCP Server ---
// This exposes the defined Genkit tools as an MCP server.
mcpServer(ai, {
    name: 'fusionauth-genkit-mcp-server',
    version: '1.0.0',
}).start();


// console.log('Genkit MCP Server for FusionAuth tools is running...');
// console.log('You can test it using the MCP Inspector: npx @modelcontextprotocol/inspector dist/index.js');
