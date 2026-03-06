---
doc_type: guide
---

# AuthConnection

AuthConnection enables OAuth2 authentication connections with external providers, featuring server-side secret management and seamless Function runtime integration. Unlike traditional auth integrations focused on user authentication, AuthConnection is designed for application-to-application OAuth2 flows where your functions need to access external APIs on behalf of your application.

## Overview

AuthConnection provides a secure way to:

- Manage OAuth2 connections with external providers (Google, Microsoft 365, QuickBooks)
- Store client secrets server-side eliminating client-side secret exposure
- Access tokens from Functions
- Handle token refresh automatically for long-running integrations

## Prerequisites

- A Tailor Platform workspace with Auth service enabled
- OAuth2 application configured with your chosen provider
- Basic understanding of OAuth2 flows
- Function service enabled (for runtime integration)

## CLI Commands

The `tailorctl workspace authconnection` command manages OAuth2 connections in your workspace.

### Create an Auth Connection

```bash
tailorctl workspace authconnection create \
  --name <connection-name> \
  --type TYPE_OAUTH2 \
  --provider-url <provider-url> \
  --issuer-url <issuer-url> \
  --client-id <client-id> \
  --client-secret <client-secret>
```

**Parameters:**

- `--name` (required): Unique connection name (lowercase, alphanumeric and hyphens only)
- `--type` (required): Authentication type (currently only `TYPE_OAUTH2` supported)
- `--provider-url` (required): OAuth2 provider URL
- `--issuer-url` (optional): Token issuer URL for JWT validation
- `--client-id` (required): OAuth2 client ID from the provider
- `--client-secret` (required): OAuth2 client secret from the provider

### List Auth Connections

```bash
tailorctl workspace authconnection list
```

### Authorize an Auth Connection

```bash
tailorctl workspace authconnection authorize <connection-name> \
  --scopes <scopes> \
  --port <callback-port>
```

**Parameters:**

- `connection-name` (required): Name of the existing auth connection
- `--scopes` (optional): OAuth2 scopes to request (default: openid,profile,email)
- `--port` (optional): Local callback server port (default: 8080)
- `--no-browser` (optional): Don't open browser automatically

This command:

1. Starts a local HTTP server for OAuth2 callback
2. Opens your browser to the provider's authorization page
3. Handles the callback after authorization
4. Exchanges the authorization code for tokens using stored client secret
5. Stores tokens securely on the server

### Revoke an Auth Connection

```bash
tailorctl workspace authconnection revoke <connection-name>
```

## Provider Configuration Examples

### Google OAuth2

First, create OAuth2 credentials in [Google Cloud Console](https://console.cloud.google.com/):

1. Go to "APIs & Services" > "Credentials"
2. Create OAuth 2.0 Client ID
3. Configure authorized redirect URIs

```bash
# 1. Create the connection
tailorctl workspace authconnection create \
  --name google-oauth \
  --type TYPE_OAUTH2 \
  --provider-url "https://accounts.google.com" \
  --issuer-url "https://accounts.google.com" \
  --client-id "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com" \
  --client-secret "YOUR_GOOGLE_CLIENT_SECRET"

# 2. Authorize and get tokens
tailorctl workspace authconnection authorize google-oauth \
  --scopes "https://www.googleapis.com/auth/admin.directory.user.readonly"
```

**Common Google OAuth2 URLs:**

- Authorization endpoint: `https://accounts.google.com/o/oauth2/v2/auth`
- Token endpoint: `https://oauth2.googleapis.com/token`
- User info endpoint: `https://www.googleapis.com/oauth2/v2/userinfo`

### Microsoft 365 / Azure AD

First, register an application in [Azure Portal](https://portal.azure.com/):

1. Go to "Azure Active Directory" > "App registrations"
2. Create new registration
3. Configure redirect URIs under "Authentication"
4. Create client secret under "Certificates & secrets"

```bash
tailorctl workspace authconnection create \
  --name ms365-oauth \
  --type TYPE_OAUTH2 \
  --provider-url "https://login.microsoftonline.com/YOUR_TENANT_ID" \
  --issuer-url "https://login.microsoftonline.com/YOUR_TENANT_ID/v2.0" \
  --client-id "YOUR_AZURE_APP_CLIENT_ID" \
  --client-secret "YOUR_AZURE_APP_CLIENT_SECRET"

# 2. Authorize and get tokens
tailorctl workspace authconnection authorize ms365-oauth \
  --scopes "https://graph.microsoft.com/.default"
```

Replace `YOUR_TENANT_ID` with your Azure AD tenant ID or use `common` for multi-tenant applications.

**Common Microsoft OAuth2 URLs:**

- Authorization endpoint: `https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize`
- Token endpoint: `https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token`
- User info endpoint: `https://graph.microsoft.com/v1.0/me`

### QuickBooks OAuth2

First, create an app in [Intuit Developer Portal](https://developer.intuit.com/):

1. Create a new app
2. Select OAuth 2.0 for authorization
3. Configure redirect URIs
4. Get your client ID and secret from "Keys & OAuth"

```bash
tailorctl workspace authconnection create \
  --name quickbooks-oauth \
  --type TYPE_OAUTH2 \
  --provider-url "https://appcenter.intuit.com/connect/oauth2" \
  --issuer-url "https://oauth.platform.intuit.com/op/v1" \
  --client-id "YOUR_QUICKBOOKS_CLIENT_ID" \
  --client-secret "YOUR_QUICKBOOKS_CLIENT_SECRET"
```

**Common QuickBooks OAuth2 URLs:**

- Authorization endpoint: `https://appcenter.intuit.com/connect/oauth2`
- Token endpoint: `https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer`
- User info endpoint: `https://accounts.platform.intuit.com/v1/openid_connect/userinfo`

**QuickBooks Scopes:**

- `com.intuit.quickbooks.accounting` - QuickBooks Online API
- `com.intuit.quickbooks.payment` - Payments API
- `openid` - OpenID Connect
- `profile` - User profile information
- `email` - User email address

## Function Runtime Integration

AuthConnection integrates seamlessly with the Function service, allowing your functions to access OAuth2 tokens and call external APIs.

### Basic Usage

```javascript
export default async () => {
  // Get access token for a connection
  const tokens = await tailor.authconnection.getConnectionToken("google-oauth");

  // Use the access token to call external APIs
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user info: ${response.statusText}`);
  }

  const userInfo = await response.json();
  return userInfo;
};
```

### Advanced Usage with Error Handling

```javascript
export default async () => {
  try {
    // Get tokens for multiple connections
    const googleTokens = await tailor.authconnection.getConnectionToken("google-oauth");
    const msTokens = await tailor.authconnection.getConnectionToken("ms365-oauth");

    // Call Google API
    const googleResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${googleTokens.access_token}`,
      },
    });

    // Call Microsoft Graph API
    const msResponse = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: {
        Authorization: `Bearer ${msTokens.access_token}`,
      },
    });

    const [googleData, msData] = await Promise.all([googleResponse.json(), msResponse.json()]);

    return {
      google: googleData,
      microsoft: msData,
    };
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    throw error;
  }
};
```

### Token Properties

The `getConnectionToken()` method returns an object with the following properties:

<Property name="access_token" type="string">
  The OAuth2 access token for API calls
</Property>

<Property name="refresh_token" type="string">
  The refresh token (if available from provider)
</Property>

<Property name="expires_at" type="string">
  Token expiration timestamp in ISO format
</Property>

<Property name="token_type" type="string">
  Token type (typically "Bearer")
</Property>

## Best Practices

### Security Considerations

1. **Client Secrets**: Treat OAuth2 client secrets as passwords. Rotate them regularly.
2. **HTTPS Only**: Always use HTTPS for redirect URIs in production.
3. **Scope Management**: Configure minimal required scopes for your application needs.
4. **Token Handling**: Never log or expose access tokens in your Function code.

### Naming Conventions

Use descriptive names that indicate the provider and environment:

- `google-oauth-prod`
- `ms365-oauth-dev`
- `quickbooks-oauth-staging`

### Environment-Specific Configurations

For development vs production environments, create separate connections:

```bash
# Development
tailorctl workspace authconnection create \
  --name google-oauth-dev \
  --type TYPE_OAUTH2 \
  --provider-url "https://accounts.google.com" \
  --client-id "DEV_CLIENT_ID.apps.googleusercontent.com" \
  --client-secret "DEV_CLIENT_SECRET"

# Production
tailorctl workspace authconnection create \
  --name google-oauth-prod \
  --type TYPE_OAUTH2 \
  --provider-url "https://accounts.google.com" \
  --client-id "PROD_CLIENT_ID.apps.googleusercontent.com" \
  --client-secret "PROD_CLIENT_SECRET"
```

## Troubleshooting

### Common Issues

**Invalid Client Error**

- Verify client ID and secret are correct
- Check if the OAuth2 app is enabled/active in the provider's console

**Redirect URI Mismatch**

- Ensure the redirect URI configured in your provider matches exactly with your application

**Scope Errors**

- Verify requested scopes are enabled in your OAuth2 application
- Some providers require admin consent for certain scopes

**Token Expiration**

- Implement refresh token flow in your application
- Monitor token expiration times

**Function Runtime Errors**

- Ensure the connection name exists and is authorized
- Check that the connection has valid, non-expired tokens
- Verify network connectivity to external APIs

## Next Steps

- [Learn about Function service](/guides/function/overview) - Understand Function runtime capabilities
- [Secret Manager documentation](/guides/secretmanager) - Secure secret storage patterns
- [Auth service overview](/guides/auth/overview) - Complete authentication system
- [Function examples](/guides/function/examples) - More Function integration patterns

## Additional Resources

- [OAuth 2.0 RFC](https://tools.ietf.org/html/rfc6749)
- [OpenID Connect Specification](https://openid.net/specs/openid-connect-core-1_0.html)
- [Google Identity Platform](https://developers.google.com/identity)
- [Microsoft Identity Platform](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [Intuit OAuth 2.0](https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/oauth-2.0)
