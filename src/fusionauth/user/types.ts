import { z } from 'genkit';

export const userInput = z.object({
    email: z.string().email('Invalid email format.').describe('The email address of the new user.'),
    password: z.string().min(8, 'Password must be at least 8 characters long.').describe('The password for the new user.'),
    fullName: z.string().optional().describe('The optional full name of the user.'),
});

export type UserInput = z.infer<typeof userInput>;

export const userOutput = z.object({
    email: z.string().email('Invalid email format.').describe('The email address of the new user.'),
    id: z.string().describe('The ID of the user in FusionAuth.'),
});
export type UserOutput = z.infer<typeof userOutput>;