import type { JWT } from "@fusionauth/typescript-client";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";

/**
 * Generates protected resource metadata for the given auth server url and
 * resource server url.
 *
 * @param authServerUrl - URL of the auth server
 * @param resourceServerUrl - URL of the resource server
 * @param properties - Additional properties to include in the metadata
 * @returns Protected resource metadata, serializable to JSON
 */
export function generateProtectedResourceMetadata({
  authServerUrl,
  resourceUrl,
  properties,
}: {
  authServerUrl: string;
  resourceUrl: string;
  properties?: Record<string, unknown>;
}) {
  return Object.assign(
    {
      resource: resourceUrl,
      authorization_servers: [authServerUrl],
      token_types_supported: ["urn:ietf:params:oauth:token-type:access_token"],
      token_introspection_endpoint: `${authServerUrl}/oauth/token`,
      token_introspection_endpoint_auth_methods_supported: [
        "client_secret_post",
        "client_secret_basic",
      ],
      jwks_uri: `${authServerUrl}/.well-known/jwks.json`,
      authorization_data_types_supported: ["oauth_scope"],
      authorization_data_locations_supported: ["header", "body"],
      key_challenges_supported: [
        {
          challenge_type: "urn:ietf:params:oauth:pkce:code_challenge",
          challenge_algs: ["S256"],
        },
      ],
    },
    properties
  );
}

/**
 * Generates protected resource metadata for the given a FusionAuth instance
 * and resource origin.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc9728
 * @param apiKey - FusionAuth API key
 * @param origin - Origin of the resource to which the metadata applies
 * @returns Protected resource metadata, serializable to JSON
 */
export function generateFusionAuthProtectedResourceMetadata({
  authServerUrl,
  resourceUrl,
  properties,
}: {
  authServerUrl: string;
  resourceUrl: string;
  properties?: Record<string, unknown>;
}) {
  return generateProtectedResourceMetadata({
    authServerUrl,
    resourceUrl,
    properties: {
      service_documentation: "https://fusionauth.io/docs",
      ...properties,
    },
  });
}

export function fetchFusionAuthAuthorizationServerMetadata({
  authServerUrl,
}: {
  authServerUrl: string;
}) {

  /*
  * FusionAuth currently does not provide a dedicated .well-known/oauth-authorization-server endpoint as defined by RFC 8414. 
  https://github.com/FusionAuth/fusionauth-issues/issues/1029
  
  However, there is an open feature request to support this endpoint, and the recommended approach is to use the existing .well-known/openid-configuration endpoint for OAuth 2.0 metadata discovery. According to the OAuth 2.0 Authorization Server Metadata specification, it is acceptable for OAuth applications to use the /.well-known/openid-configuration URI suffix for general OAuth 2.0 features, even if it appears OpenID-specific Support OAuth2 metadata RFC (RFC 8414).
  Therefore, if you need OAuth 2.0 metadata from FusionAuth, you should use the /.well-known/openid-configuration endpoint, which provides the necessary information for both OpenID Connect and OAuth 2.0 clients OpenID Configuration.
  If you require the .well-known/oauth-authorization-server endpoint specifically, you may need to monitor the progress of the related feature request or consider a workaround, such as serving the same content at both endpoints if you control a proxy in front of FusionAuth. Currently, FusionAuth does not natively support this endpoint.
  */
  return fetch(`${authServerUrl}/.well-known/openid-configuration`)
    .then((res) => res.json())
    .then((metadata) => {
      return metadata;
    });
}

//TODO: Don't love this check, should we use a library?
/**
 * Verifies a FusionAuth token and returns data in the format expected to be passed
 * as `authData to the MCP SDK. In TypeScript, this is the validateJWT function return type.
 * @param jwt - The JWT token returned from FusionAuth
 * @param token - The accessToken from FusionAuth, typically app.at cookie
 * @returns AuthInfo type, see `import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";`
 */
export function verifyFusionAuthToken(
  jwt: JWT,
  token: string | undefined
): AuthInfo | undefined {
  if (!token) return undefined;

  if (!jwt.exp) {
    console.error("Invalid OAuth access token");
    return undefined;
  }

  if (jwt.typ !== "JWT") {
    throw new Error(
      "must be a JWT token with typ=JWT in the header"
    );
  }

  // None of these _should_ ever happen
  if (!jwt.aud) {
    console.error("FusionAuth error: No aud (clientId)");
    return undefined;
  }

  if (!jwt.scopes) {
    console.error("FusionAuth error: No scopes returned");
    return undefined;
  }

  if (!jwt.sub) {
    console.error("FusionAuth error: No sub (userId) returned");
    return undefined;
  }

  return {
    token,
    scopes: jwt.scopes,
    clientId: jwt.clientId || jwt.aud,
    extra: { userId: jwt.sub },
  };
}

/**
 * CORS headers for OAuth metadata endpoints
 */
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Max-Age": "86400",
};