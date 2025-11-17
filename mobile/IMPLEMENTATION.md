# Mobile App Implementation

This document describes the implementation of the Memos mobile app with login and CRUD functionality for notes.

## Overview

A React Native mobile application built with Expo that provides full authentication and CRUD operations for the Memos note-taking platform. The app connects to the existing Memos backend API and provides a native mobile experience.

## Tech Stack

- **Framework:** Expo 54 + React Native 0.81
- **Language:** TypeScript
- **Routing:** Expo Router (file-based routing)
- **State Management:**
  - Zustand for session/auth state
  - React Query for server state & caching
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **HTTP Client:** Axios
- **Form Handling:** React Hook Form + Zod validation
- **Secure Storage:** expo-secure-store for session persistence
- **Icons:** Ionicons (@expo/vector-icons)

## Architecture

### File Structure

```
mobile/
├── app/                          # File-based routing
│   ├── (auth)/                   # Authentication routes
│   │   ├── _layout.tsx           # Auth layout with redirect logic
│   │   └── login.tsx             # Login screen
│   ├── (app)/                    # Authenticated routes
│   │   ├── (tabs)/               # Tab navigation
│   │   │   ├── _layout.tsx       # Tabs layout
│   │   │   ├── index.tsx         # Memos CRUD screen
│   │   │   └── explore.tsx       # User profile screen
│   │   └── _layout.tsx           # App layout with auth guard
│   ├── _layout.tsx               # Root layout
│   └── tabs-layout.tsx           # Shared tabs configuration
├── services/                     # API services
│   ├── auth-service.ts           # Authentication endpoints
│   └── memo-service.ts           # Memo CRUD endpoints
├── stores/                       # Zustand stores
│   └── session-store.ts          # Auth session management
├── lib/                          # Utilities
│   ├── http-client.ts            # Axios instance with interceptors
│   ├── env.ts                    # Environment configuration
│   ├── secure-storage.ts         # Encrypted storage wrapper
│   └── session-cookie.ts         # Cookie parsing utilities
├── types/                        # TypeScript definitions
│   └── api.ts                    # API response types
└── providers/                    # React providers
    └── app-provider.tsx          # Root provider (Query, Gestures)
```

## Key Features Implemented

### 1. Authentication

**Login Screen** (`app/(auth)/login.tsx`)
- Username/password form with validation
- React Hook Form + Zod schema validation
- Secure session storage with expo-secure-store
- Error handling and loading states
- Automatic redirect on successful login

**Session Management** (`stores/session-store.ts`)
- Zustand store for auth state
- Session cookie persistence
- Automatic session restoration on app launch
- Login/logout with API integration
- Session status tracking (idle, checking, loading, authenticated, unauthenticated)

**Auth Guard** (`app/(app)/_layout.tsx`)
- Protects authenticated routes
- Redirects to login if not authenticated
- Shows loading state during session check

### 2. Memos CRUD

**List Memos** (`app/(app)/(tabs)/index.tsx`)
- Fetches all memos using React Query
- Pull-to-refresh functionality
- Empty state when no memos exist
- Loading and error states
- Automatic cache invalidation on mutations

**Create Memo**
- Inline creation form
- Text input with multiline support
- Create button with loading state
- Cancel functionality
- Optimistic UI updates via React Query

**Update Memo**
- Inline editing mode per memo
- Pre-populated with existing content
- Save/Cancel buttons
- Loading state during update
- Automatic list refresh on success

**Delete Memo**
- Delete button per memo
- Confirmation dialog before deletion
- Loading state during deletion
- Error handling with alerts
- Automatic list refresh on success

### 3. User Profile

**Profile Screen** (`app/(app)/(tabs)/explore.tsx`)
- Display user avatar (first letter of username)
- Show username, nickname, and email
- Account information section
- Settings placeholders
- Help & About sections
- Sign out button with confirmation

### 4. Navigation

**Tab Navigation** (`app/tabs-layout.tsx`)
- Bottom tab bar with 2 tabs:
  - **Memos:** Home screen with note list
  - **Profile:** User profile and settings
- Ionicons for tab icons
- Active/inactive states
- Themed styling (light/dark mode support)

**Route Protection**
- Auth routes redirect to app if already logged in
- App routes redirect to login if not authenticated
- Bootstrap gate for initial session check

## API Integration

### Endpoints Used

```typescript
// Authentication
POST   /api/v1/auth/sessions              # Login
GET    /api/v1/auth/sessions/current      # Get current session
DELETE /api/v1/auth/sessions/current      # Logout

// Memos
GET    /api/v1/memos                      # List memos
POST   /api/v1/memos                      # Create memo
PATCH  /api/v1/{memo.name}                # Update memo
DELETE /api/v1/{memo.name}                # Delete memo
```

### HTTP Client Configuration

**Features:**
- Base URL from environment variable
- Cookie header injection for authentication
- Automatic session cookie management
- JSON content-type headers
- Error response handling

**Session Cookie Flow:**
1. Login request returns `Set-Cookie` header
2. Cookie extracted and stored in secure storage
3. Cookie injected into all subsequent requests
4. Cookie cleared on logout

### React Query Setup

**Configuration:**
- Query key: `['memos']` for memo list
- Automatic refetch on window focus
- Cache invalidation on mutations
- 5-minute stale time for queries
- Retry logic for failed requests

**Mutations:**
- `createMutation`: Create new memo
- `updateMutation`: Update existing memo
- `deleteMutation`: Delete memo
- All invalidate `['memos']` cache on success

## State Management

### Session Store (Zustand)

```typescript
interface SessionState {
  status: SessionStatus;           // Current auth status
  user: User | null;                // User object
  sessionCookie: string | null;     // Session cookie
  error: string | null;             // Error message
  hasBootstrapped: boolean;         // Bootstrap complete flag
  bootstrap: () => Promise<void>;   // Initialize session
  login: (credentials) => Promise<void>;
  logout: () => Promise<void>;
  setSessionFromResponse: (payload) => Promise<void>;
}
```

**Key Functions:**
- `bootstrap()`: Load session from storage on app start
- `login()`: Authenticate and store session
- `logout()`: Clear session and redirect
- `setSessionFromResponse()`: Update state from API response

### Server State (React Query)

All server data (memos) managed by React Query:
- Automatic caching
- Background refetching
- Optimistic updates
- Error handling
- Loading states

## Styling

### NativeWind (Tailwind CSS)

All components styled with Tailwind utility classes:
- Consistent spacing and sizing
- Responsive design patterns
- Dark mode support via Tailwind colors
- Custom color palette in `tailwind.config.ts`

**Color Palette:**
```typescript
{
  background: '#f7f7fb',
  foreground: '#0f172a',
  card: '#ffffff',
  primary: '#3f37c9',
  destructive: '#dc2626',
  muted: '#f5f5f7',
  border: '#e4e4ef',
}
```

## Error Handling

### Network Errors
- Try-catch blocks around all API calls
- User-friendly error messages
- Alert dialogs for critical errors
- Retry buttons on error screens

### Validation Errors
- Zod schema validation on forms
- Field-level error messages
- Prevent submission with invalid data

### Session Errors
- Automatic logout on auth failure
- Redirect to login screen
- Clear error messages
- Session restoration on network recovery

## Security

### Secure Storage
- Session cookies stored in encrypted storage
- Automatic cleanup on logout
- No sensitive data in AsyncStorage
- Platform-specific secure storage (Keychain/Keystore)

### API Security
- All requests include session cookie
- No hardcoded credentials
- Environment-based API URLs
- HTTPS support for production

## Performance Optimizations

1. **React Query Caching:** Reduces redundant API calls
2. **Optimistic Updates:** UI updates before server confirmation
3. **Pull-to-Refresh:** Manual cache invalidation
4. **Lazy Loading:** Screens loaded on demand via routing
5. **Memo Component:** List items memoized to prevent re-renders

## Development Workflow

### Environment Setup

```bash
# Install dependencies
npm install

# Configure API endpoint
echo "EXPO_PUBLIC_MEMOS_API_URL=http://192.168.1.100:8081" > .env

# Start dev server
npm start
```

### Hot Reload
- Automatic reload on code changes
- Fast Refresh for component updates
- Preserve state during reload

### Debugging
- Console logs in terminal
- React Native Debugger support
- Expo Dev Tools in browser
- Network request inspection

## Testing Strategy

### Manual Testing Checklist

**Authentication:**
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Session persistence after app restart
- [ ] Logout functionality
- [ ] Automatic redirect after login/logout

**Memos:**
- [ ] Load memos list
- [ ] Create new memo
- [ ] Edit existing memo
- [ ] Delete memo with confirmation
- [ ] Cancel create/edit operations
- [ ] Pull-to-refresh
- [ ] Empty state display

**Profile:**
- [ ] Display user information
- [ ] Settings navigation (placeholders)
- [ ] Sign out with confirmation

**Edge Cases:**
- [ ] No network connection
- [ ] Backend server down
- [ ] Invalid API responses
- [ ] Long memo content
- [ ] Special characters in content
- [ ] Multiple rapid taps (debouncing)

## Known Limitations

1. **No Offline Support:** Requires active connection to backend
2. **Basic Editor:** Plain text only, no rich formatting
3. **No Attachments:** Can't upload images/files
4. **No Search:** No memo search functionality
5. **No Tags:** Tag management not implemented
6. **No Pagination:** Loads all memos at once (limited to 100)
7. **No Push Notifications:** No real-time updates

## Future Enhancements

### Phase 1 - Core Features
- [ ] Search and filter memos
- [ ] Sort by date/title
- [ ] Tag management
- [ ] Memo visibility settings
- [ ] Archive/unarchive memos
- [ ] Pagination for large memo lists

### Phase 2 - Rich Features
- [ ] Markdown editor with preview
- [ ] Image attachments
- [ ] Voice memos
- [ ] Share memos
- [ ] Export memos

### Phase 3 - Advanced
- [ ] Offline support with sync
- [ ] Push notifications
- [ ] Widgets
- [ ] Biometric authentication
- [ ] Dark mode toggle
- [ ] Multiple accounts

## Configuration

### Environment Variables

```bash
# Required
EXPO_PUBLIC_MEMOS_API_URL=http://your-server:8081

# Optional (defaults shown)
NODE_ENV=development
```

### Build Configuration

**app.json:**
- App name, slug, version
- Platform-specific settings
- Asset and splash screen config
- Permissions (if needed)

**babel.config.js:**
- NativeWind preset
- Module resolver for @ imports

**metro.config.js:**
- CSS transformer for NativeWind
- File extensions

## Deployment

### iOS

1. Build with EAS: `eas build --platform ios`
2. Submit to App Store: `eas submit --platform ios`

### Android

1. Build with EAS: `eas build --platform android`
2. Submit to Play Store: `eas submit --platform android`

### Over-the-Air Updates

```bash
eas update --branch production --message "Bug fixes"
```

## Troubleshooting

### Common Issues

**"Cannot connect to server"**
- Check backend is running
- Verify API URL in .env
- Use IP address, not localhost for devices

**"Network request failed"**
- Device and server on same network
- Firewall not blocking port
- Backend CORS configured correctly

**"White screen on launch"**
- Clear cache: `npx expo start -c`
- Reinstall: `rm -rf node_modules && npm install`

## Conclusion

The mobile app provides a complete implementation of authentication and CRUD operations for Memos, matching the web app's core functionality. The architecture is extensible, performant, and follows React Native best practices.

**Key Achievements:**
✅ Full authentication flow with session persistence
✅ Complete CRUD operations for memos
✅ User profile and settings screen
✅ Error handling and loading states
✅ Clean, maintainable code structure
✅ Type-safe with TypeScript
✅ Responsive UI with NativeWind
✅ Production-ready foundation

The app is ready for testing and can be extended with additional features as needed.
