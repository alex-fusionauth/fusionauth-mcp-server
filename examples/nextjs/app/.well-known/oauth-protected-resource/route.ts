// app/.well-known/oauth-protected-resource/route.ts
import { protectedResourceHandlerFusionAuth } from "@fusionauth/mcp-tools/next";

const handler = protectedResourceHandlerFusionAuth();

export { handler as GET };