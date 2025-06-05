import { genkit, z } from 'genkit';
import { mcpServer } from 'genkitx-mcp';
import { config } from 'dotenv';
import googleAI from '@genkit-ai/googleai';

import { registerUserTools } from './fusionauth/user/tools.js';
import { registerUserPrompts } from './fusionauth/user/prompts.js';
import { registerUserFlows } from './fusionauth/user/flows.js';

// Define the model to use
const MODEL = 'googleai/gemini-2.5-flash-preview-05-20';

/* 
* Load environment variables from .env file
* This is where you would typically store your FusionAuth API keys and other sensitive information. That is used in tools.
*/

config();

const ai = genkit({
    plugins: [googleAI()],
    model: googleAI.model(MODEL),
});

/*
* Register the FusionAuth user tools, prompts, and flows.
* These will be used to create users in FusionAuth.
*/
const { userCreateTool } = registerUserTools(ai);
registerUserPrompts(ai, MODEL);
registerUserFlows(ai, MODEL, userCreateTool);

/* --- Start the MCP Server ---
* This exposes the defined Genkit tools as an MCP server.
* The MCP server allows other applications to interact with the Genkit tools.
* You can access the MCP server at http://localhost:4000
*/
mcpServer(ai, {
    name: 'fusionauth-genkit-mcp-server',
    version: '1.0.0',
}).start();