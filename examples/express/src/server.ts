import "dotenv/config";
import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  FusionAuthClient
} from "@fusionauth/typescript-client";
import {
  mcpAuthFusionAuth,
  protectedResourceHandlerFusionAuth,
  authServerMetadataHandlerFusionAuth,
  streamableHttpHandler,
  protectedResourceHandler
} from "../../../src/express";

const app = express();

// TODO: Could we just make this a middleware?
// app.use(fusionauthMiddleware());
app.use(express.json());

const server = new McpServer({
  name: "fusionauth-mcp-server",
  version: "1.0.0",
});

const client = new FusionAuthClient(process.env.FUSIONAUTH_API_KEY || 'bf69486b-4733-4470-a592-f1bfce7admin', process.env.FUSIONAUTH_AUTH_URL || 'http://localhost:9011');

/* 
* Gets the app.at cookie which has the access token for the user
* This is used to authenticate the user for the FusionAuth protected resources
* and to get the user data from FusionAuth.
*/
server.tool(
  "get_fusionauth_user_data",
  "Gets data about the FusionAuth user that authorized this request",
  {},
  async (_, { requestInfo }) => {
    // Get the access token from the request cookies
    const cookies = requestInfo?.headers["cookie"];
    const cookieString = Array.isArray(cookies) ? cookies.join("; ") : cookies;
    const accessToken = cookieString?.split("; ").find(c => c.startsWith("app.at="))?.split("=")[1];

    if (!accessToken) {
      throw new Error("No access token found in cookies");
    }

    const user = await client.retrieveUserUsingJWT(accessToken);
    return {
      content: [{ type: "text", text: JSON.stringify(user) }],
    };
  }
);

app.get("/.well-known/oauth-protected-resource", protectedResourceHandler);
app.get("/.well-known/oauth-protected-resource-fusionauth", protectedResourceHandlerFusionAuth);
app.get(
  "/.well-known/oauth-authorization-server",
  authServerMetadataHandlerFusionAuth
);
app.post("/mcp", mcpAuthFusionAuth, streamableHttpHandler(server));

app.listen(3000);