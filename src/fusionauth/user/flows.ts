import { z, type Genkit } from 'genkit';
import { userOutput } from './types.js';
import type { UserTools } from './tools.js';

export interface UserFlows {
    multipleUserCreationFlow: ReturnType<typeof Genkit.prototype.defineFlow<
        z.ZodObject<{
            numberOfUsers: z.ZodNumber;
        }>,
        z.ZodArray<typeof userOutput>
    >>;
}

export function registerUserFlows(ai: Genkit, MODEL: string, userCreateTool: UserTools["userCreateTool"]): UserFlows {

    const multipleUserCreationFlow = ai.defineFlow(
        {
            name: 'multipleUserCreationFlow',
            inputSchema: z.object({
                numberOfUsers: z.number().min(1, 'You must create at least one user.').describe('The number of users to create.'),
            }),
            outputSchema: z.array(userOutput).describe('An array of user objects.'),
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

            /* Prompts seem to duplicate */
            // // Access prompt for creating users
            // const createUser = ai.prompt('createSingleUser');

            // // Create each user using the FusionAuth tool.
            // const users = [];
            // for (const user of response.output) {
            //     const response = await createUser(user);
            //     users.push(response.output)
            // }
            // return users;


            // Create each user using the FusionAuth tool.
            const users = [];
            for (const user of response.output) {
                const faUser = await userCreateTool(user);
                users.push(faUser)
            }
            return users;
        },
    );
    return { multipleUserCreationFlow }
}