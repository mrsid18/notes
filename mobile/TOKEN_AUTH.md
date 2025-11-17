# JWT Token-Based Authentication

The Memos mobile app uses JWT (JSON Web Token) access tokens for authentication instead of traditional username/password login. This provides a more secure and flexible approach for mobile API access.

## Overview

**Authentication Method:** Bearer Token (JWT)
**Storage:** Encrypted device storage (Keychain/Keystore)
**Expiration:** Configurable (7/30/90/365 days or never)
**Validation:** On app start and token changes

## How It Works

### 1. Token Creation (Web Interface)

Users create access tokens through the Memos web interface:

1. Log in to Memos web app
2. Navigate to **Settings → Access Tokens**
3. Click **Create** to generate a new token
4. Select expiration period:
   - 7 days
   - 30 days
   - 90 days
   - 365 days
   - Never (no expiration)
5. Copy the generated JWT token

### 2. Token Input (Mobile App)

In the mobile app:

1. Open the **Profile** tab
2. Tap **Add Access Token**
3. Paste the JWT token
4. App validates token with backend
5. User info is loaded and stored
6. Token is saved to encrypted storage

### 3. Token Usage (API Requests)

Every API request includes the token in the Authorization header:

```http
GET /api/v1/memos HTTP/1.1
Host: memos.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

The HTTP client (`lib/http-client.ts`) automatically adds the token to all requests:

```typescript
httpClient.interceptors.request.use((config) => {
  if (accessTokenRef) {
    config.headers.Authorization = `Bearer ${accessTokenRef}`;
  }
  return config;
});
```

### 4. Token Validation

The app validates the token:

- **On app startup** - Checks stored token and loads user info
- **When setting a new token** - Validates before saving
- **On API errors** - Detects 401 Unauthorized responses

```typescript
// Validation endpoint
GET /api/v1/user/me
Authorization: Bearer YOUR_TOKEN

// Response (if endpoint existed - currently not available via REST API)
{
  "name": "users/1",
  "username": "demo",
  "nickname": "Demo User",
  "email": "demo@example.com"
}

// Note: The REST API doesn't expose a user/me endpoint, so we validate
// tokens by making authenticated API calls (like GET /api/v1/memos).
// If the call succeeds, the token is valid.
```

## State Management

### Session Store (`stores/session-store.ts`)

```typescript
interface SessionState {
  status: SessionStatus;              // 'idle' | 'checking' | 'loading' | 'authenticated' | 'unauthenticated'
  user: User | null;                  // Current user object
  accessToken: string | null;         // JWT token
  error: string | null;               // Error message
  hasBootstrapped: boolean;           // Init complete flag

  bootstrap: () => Promise<void>;     // Load token from storage
  setAccessToken: (token: string) => Promise<void>;  // Save and validate token
  clearAccessToken: () => Promise<void>;             // Remove token
  validateToken: () => Promise<boolean>;             // Revalidate current token
}
```

### Key Functions

**Bootstrap (App Startup):**
```typescript
// Loads token from encrypted storage and validates it
const bootstrap = async () => {
  const storedToken = await secureStorage.getItem('memos.access.token');
  if (storedToken) {
    setHttpClientAccessToken(storedToken);
    const user = await authService.getCurrentUser();
    // Update state with user info
  }
};
```

**Set Access Token:**
```typescript
// Validates and stores new token
const setAccessToken = async (token: string) => {
  setHttpClientAccessToken(token);
  const user = await authService.getCurrentUser(); // Validates token
  if (user) {
    await secureStorage.setItem('memos.access.token', token);
    // Update state
  } else {
    throw new Error('Invalid token');
  }
};
```

**Clear Access Token:**
```typescript
// Removes token and resets state
const clearAccessToken = async () => {
  await secureStorage.deleteItem('memos.access.token');
  setHttpClientAccessToken(null);
  // Reset state to unauthenticated
};
```

## Security

### Token Storage

- **iOS:** Stored in Keychain with `kSecAttrAccessibleAfterFirstUnlock` protection
- **Android:** Stored in Keystore with hardware-backed encryption (if available)
- **Web:** Falls back to browser's secure storage (for Expo web builds)

### Best Practices

1. **Never log tokens** - Don't console.log or display full tokens
2. **Use HTTPS** - Always use HTTPS in production
3. **Short expiration** - Use 30-90 day expiration for better security
4. **Revoke compromised tokens** - Delete from web interface if leaked
5. **Don't commit tokens** - Never add tokens to version control

### Token Display

In the Profile screen, tokens are masked for security:

```typescript
const maskedToken = accessToken
  ? `${accessToken.substring(0, 8)}...${accessToken.substring(accessToken.length - 8)}`
  : null;

// Displays as: eyJhbGci...dGVzdCJ9
```

## Error Handling

### Invalid Token Scenarios

**401 Unauthorized:**
```typescript
// Detected in memos screen
if (error.message.includes('401') || error.message.includes('unauthorized')) {
  // Show "Invalid Access Token" message
  // Redirect to Profile to update token
}
```

**Expired Token:**
- Backend returns 401 Unauthorized
- App shows error message
- User must create new token in web interface
- Update token in Profile tab

**Network Errors:**
- Handled separately from auth errors
- Shows "Failed to Load Memos" message
- Provides "Try Again" button

## User Experience

### First-Time Setup

1. User opens app (no token stored)
2. Memos tab shows "Access Token Required" message
3. User taps "Add Access Token" button
4. Navigates to Profile tab
5. Taps token input area
6. Pastes JWT token from web interface
7. Taps "Save Token"
8. App validates and loads user info
9. Returns to Memos tab to view notes

### Token Management

**Update Token:**
- Profile tab → "Update Token" button
- Enter new token
- Old token replaced

**Validate Token:**
- Profile tab → "Validate Token" button
- Tests current token with backend
- Shows success/failure message

**Clear Token:**
- Profile tab → "Clear Token" button
- Confirmation dialog
- Token removed from storage
- Returns to unauthenticated state

## Implementation Details

### File Structure

```
stores/
  └── session-store.ts          # Token state management
services/
  └── auth-service.ts           # Token validation API
lib/
  ├── http-client.ts            # Bearer token injection
  └── secure-storage.ts         # Encrypted storage wrapper
app/(app)/(tabs)/
  ├── index.tsx                 # Shows token required if missing
  └── explore.tsx               # Token input and management
```

### API Endpoints

**Validate Token:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://memos.example.com/api/v1/user/me
```

**List Memos:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://memos.example.com/api/v1/memos
```

**Create Memo:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"memo": {"content": "Hello", "visibility": "PRIVATE", "state": "NORMAL"}}' \
  https://memos.example.com/api/v1/memos
```

## Limitations

**User Details Not Available:**
The Memos REST API doesn't expose a dedicated "get current user" endpoint that works with JWT tokens. Therefore:

- The mobile app can't display your username, email, or avatar
- User profile information is managed in the Memos web interface
- Token validation works by making authenticated API calls (like listing memos)
- If the API call succeeds with your token, you're authenticated

This doesn't affect the app's core functionality - you can still create, read, update, and delete memos normally.

## Advantages Over Session-Based Auth

1. **No login screen needed** - Simpler user flow
2. **Token persistence** - Doesn't expire from inactivity
3. **Programmatic access** - Easy for API automation
4. **Multiple tokens** - Can create tokens for different devices
5. **Easy revocation** - Delete tokens individually from web interface
6. **No cookies** - Simpler mobile implementation
7. **Explicit expiration** - User controls token lifetime

## Troubleshooting

### Token Not Working

1. **Check token format** - Must be complete JWT string
2. **Verify expiration** - May have expired
3. **Check backend URL** - Must match token's origin
4. **Review permissions** - Token must have memo access

### Token Won't Save

1. **Network connection** - Validation requires backend access
2. **Backend availability** - Server must be running
3. **Invalid token** - Check for copy/paste errors
4. **Expired token** - Create new one

### User Info Not Loading

This is expected behavior. The mobile app validates tokens by making authenticated API calls, but doesn't fetch user profile details since the REST API doesn't expose a user/me endpoint for JWT tokens. The app will show "Authenticated" status instead of your username.

## Future Enhancements

- [ ] Biometric authentication to access stored token
- [ ] Multiple account support with different tokens
- [ ] Token expiration warnings
- [ ] Automatic token refresh (if backend supports)
- [ ] QR code scanner for token input
- [ ] Deep linking to add token from web interface

## References

- [JWT.io](https://jwt.io/) - JWT specification and debugging
- [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/) - Encrypted storage docs
- [Memos API Documentation](https://github.com/usememos/memos) - Backend API reference
