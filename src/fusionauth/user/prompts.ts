import type { Genkit } from 'genkit';
import { userInput, } from './types.js';

export interface UserPrompts {
    createSingleUser: ReturnType<typeof Genkit.prototype.definePrompt<
        typeof userInput>
    >;
}

export function registerUserPrompts(ai: Genkit, MODEL: string): UserPrompts {

    /**
     * Genkit prompt to create a new user in FusionAuth.
     */
    const createSingleUser =
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
    return { createSingleUser }
}