# Memos Mobile App

A lightweight React Native mobile app for [Memos](https://github.com/usememos/memos) - a privacy-first, self-hosted knowledge management and note-taking platform.

Built with:
- **Expo** - React Native framework
- **React Query** - Data fetching and caching
- **Zustand** - State management
- **NativeWind** - Tailwind CSS for React Native
- **Expo Router** - File-based routing

## Features

- ✅ **JWT Token Authentication** - Secure access token-based authentication
- ✅ **Create Memos** - Quick note creation with rich text
- ✅ **Read Memos** - View all your memos in a clean list
- ✅ **Update Memos** - Edit memo content inline
- ✅ **Delete Memos** - Remove memos with confirmation
- ✅ **User Profile** - View account info and manage access token
- ✅ **Secure Storage** - Token persistence with encrypted storage
- ✅ **Pull to Refresh** - Refresh memos with a swipe down

## Prerequisites

- Node.js 18+ and npm/pnpm
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS Simulator (Mac only) or Android Emulator
- A running Memos backend server

## Setup
## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Endpoint

The app connects to your Memos backend API. By default, it uses `http://localhost:8081`.

To change the API endpoint, set the `EXPO_PUBLIC_MEMOS_API_URL` environment variable:

```bash
# Create a .env file (optional)
echo "EXPO_PUBLIC_MEMOS_API_URL=http://192.168.1.100:8081" > .env
```

Or set it when starting the app:

```bash
EXPO_PUBLIC_MEMOS_API_URL=http://your-memos-server:8081 npm start
```

**Important for iOS Simulator/Android Emulator:**
- `localhost` won't work - use your computer's IP address
- Example: `http://192.168.1.100:8081` (find your IP with `ipconfig` on Windows or `ifconfig` on Mac/Linux)

### 3. Start the Backend Server

Make sure your Memos backend is running:

```bash
# From the project root
cd ..
go run ./cmd/memos --mode dev --port 8081
```

### 4. Create an Access Token

Before using the mobile app, you need to create a JWT access token:

1. Open your Memos web interface (e.g., `http://localhost:8081`)
2. Log in to your account
3. Go to **Settings** → **Access Tokens**
4. Click **Create** to generate a new token
5. Choose an expiration period:
   - 7 days
   - 30 days
   - 90 days
   - 365 days
   - Never (no expiration)
6. Copy the generated token (you'll need it in the mobile app)

**Note:** Access tokens don't expire from inactivity and remain valid until the expiration date or until manually revoked.

### 5. Start the Mobile App

```bash
npm start
```

This will open the Expo DevTools in your browser. From there, you can:

- Press `i` to open in iOS Simulator
- Press `a` to open in Android Emulator
- Scan the QR code with Expo Go app on your physical device

### 6. Add Your Access Token

When you first open the app:

1. Navigate to the **Profile** tab
2. Tap **Add Access Token**
3. Paste your JWT token from step 4
4. Tap **Save Token**
5. The app will validate the token and load your user info
6. Go back to the **Memos** tab to start managing your notes

## Development

### Project Structure

```
mobile/
├── app/                    # File-based routing
│   ├── (app)/             # App routes
│   │   ├── (tabs)/        # Tab navigation
│   │   │   ├── index.tsx  # Memos list (Home)
│   │   │   └── explore.tsx # User profile & token management
│   │   └── _layout.tsx    # App layout
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
├── stores/                # Zustand state management
│   └── session-store.ts   # Token & user state
├── services/              # API service layer
│   ├── auth-service.ts    # Token validation
│   └── memo-service.ts    # Memo CRUD endpoints
├── lib/                   # Utilities and config
│   ├── http-client.ts     # Axios instance with Bearer token
│   ├── env.ts             # Environment config
│   └── secure-storage.ts  # Encrypted storage
├── types/                 # TypeScript types
│   └── api.ts             # API response types
└── providers/             # React context providers
    └── app-provider.tsx   # Root provider
```

### Available Scripts

```bash
npm start              # Start Expo dev server
npm run android        # Open on Android
npm run ios            # Open on iOS
npm run web            # Open in web browser (limited support)
npm run lint           # Run ESLint
```

### Authentication Flow

1. App starts → Bootstrap token from secure storage
2. If token exists → Validate with backend → Load user info → Show memos
3. If no token → Show "Access Token Required" message on Memos tab
4. User navigates to Profile → Adds JWT token → Token validated → User info loaded
5. Clear token → Remove from secure storage → Show token required message

JWT access tokens are stored in encrypted storage and automatically attached to all API requests as Bearer tokens.

## API Integration

The app uses the Memos REST API (`/api/v1/*`) endpoints:

- `GET /api/v1/user/me` - Get current user (validates token)
- `GET /api/v1/memos` - List memos
- `POST /api/v1/memos` - Create memo
- `PATCH /api/v1/{memo.name}` - Update memo
- `DELETE /api/v1/{memo.name}` - Delete memo

All requests include the JWT token in the `Authorization` header:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Example API Usage

```typescript
import { useSessionStore } from '@/stores/session-store';
import { memoService } from '@/services/memo-service';

// Set access token (done in Profile screen)
const setAccessToken = useSessionStore((state) => state.setAccessToken);
await setAccessToken('your-jwt-token-here');

// Create a memo (token automatically included in request)
const memo = await memoService.create({
  memo: {
    content: 'My first memo!',
    visibility: 'PRIVATE',
    state: 'NORMAL',
  },
});

// List memos
const { memos } = await memoService.list({
  pageSize: 50,
});
```

## Troubleshooting

### Can't connect to backend

- Make sure the backend server is running
- Use your computer's IP address, not `localhost`
- Check firewall settings - the backend port must be accessible
- Verify the API URL in environment variables

### Token not persisting

- Check that Expo SecureStore is available on your device
- Clear app data and add token again
- Check for errors in the console

### Invalid or expired token

- Create a new access token in Memos web settings
- Update the token in the Profile tab
- Make sure the token hasn't expired

### UI not updating after data changes

- React Query automatically refetches on focus
- Use pull-to-refresh to manually reload
- Check the Network tab in React Native Debugger

## Building for Production

### iOS

```bash
eas build --platform ios
```

### Android

```bash
eas build --platform android
```

Refer to [Expo EAS Build documentation](https://docs.expo.dev/build/introduction/) for detailed instructions.

## Security

- Access tokens are stored in encrypted device storage (Keychain on iOS, Keystore on Android)
- Tokens are transmitted via HTTPS in production (configure your backend accordingly)
- Never share your access token or commit it to version control
- Revoke tokens from the Memos web interface if compromised

## Contributing

This mobile app is part of the Memos project. Follow the project's contribution guidelines when submitting changes.

## License

Same as the main Memos project.
