# Quick Start Guide - Memos Mobile App

Get up and running with the Memos mobile app in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Memos backend server running
- iOS Simulator (Mac) or Android Emulator, or physical device with Expo Go

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Configure Backend Connection

Find your computer's IP address:

**Mac/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
```

Create a `.env` file:

```bash
# Replace with your computer's IP address
echo "EXPO_PUBLIC_MEMOS_API_URL=http://192.168.1.100:8081" > .env
```

> **Note:** Use `localhost` only for iOS Simulator. For Android Emulator, use `10.0.2.2`. For physical devices, use your computer's IP address.

### 3. Start Backend Server

In a separate terminal, from the project root:

```bash
go run ./cmd/memos --mode dev --port 8081
```

Verify it's running by visiting: `http://localhost:8081`

### 4. Start Mobile App

```bash
npm start
```

### 5. Open on Device

**iOS Simulator:**
- Press `i` in the terminal

**Android Emulator:**
- Press `a` in the terminal

**Physical Device:**
- Install [Expo Go](https://expo.dev/client) from App Store / Play Store
- Scan the QR code shown in terminal

## First Use

### Login Credentials

Use your existing Memos account or create one via the web interface first:

```
Username: demo
Password: demo123
```

### Create Your First Memo

1. Tap the **"New Memo"** button
2. Type your note content
3. Tap **"Create Memo"**
4. Done! 🎉

## Features Overview

### Home Tab (Memos)
- ✅ View all your memos
- ✅ Create new memos with **"New Memo"** button
- ✅ Edit any memo by tapping **"Edit"**
- ✅ Delete memos by tapping **"Delete"** (with confirmation)
- ✅ Pull down to refresh

### Profile Tab
- ✅ View account information
- ✅ Access settings (coming soon)
- ✅ Sign out

## Common Issues

### "Network request failed" Error

**Problem:** App can't reach the backend server.

**Solutions:**
1. Verify backend is running on port 8081
2. Check your IP address is correct in `.env`
3. Ensure device and computer are on same WiFi network
4. For Android Emulator, use `10.0.2.2` instead of localhost
5. Check firewall isn't blocking port 8081

### "Cannot connect to localhost"

**Problem:** Using `localhost` on physical device or Android emulator.

**Solution:** Replace with your computer's actual IP address:
```bash
EXPO_PUBLIC_MEMOS_API_URL=http://192.168.1.100:8081
```

### App shows white screen

**Problem:** JavaScript bundle hasn't loaded.

**Solutions:**
1. Restart the Metro bundler: Press `r` in terminal
2. Clear cache: `npx expo start -c`
3. Reinstall dependencies: `rm -rf node_modules && npm install`

### Login fails with 401 error

**Problem:** Invalid credentials or session expired.

**Solutions:**
1. Verify username/password are correct
2. Check backend logs for authentication errors
3. Try creating a new user via web interface first

## Development Tips

### Hot Reload

Changes to code automatically reload in the app. Shake device or press `Cmd+D` (iOS) / `Cmd+M` (Android) for dev menu.

### Debug Menu

- **iOS Simulator:** Press `Cmd+D`
- **Android Emulator:** Press `Cmd+M` or `Ctrl+M`
- **Physical Device:** Shake device

Options include:
- Reload
- Debug Remote JS
- Show Element Inspector
- Show Performance Monitor

### Viewing Logs

All console logs appear in the terminal where you ran `npm start`.

### Clear App Data

**iOS Simulator:**
```bash
xcrun simctl privacy booted reset all
```

**Android Emulator:**
Settings → Apps → Expo Go → Storage → Clear Data

## Next Steps

### Customize Backend URL

Edit `mobile/lib/env.ts` to change default URL or add more configuration.

### Add Features

The app is built with:
- **Expo Router** - File-based routing in `app/` directory
- **React Query** - Data fetching in `services/`
- **Zustand** - State management in `stores/`
- **NativeWind** - Tailwind CSS styling

### Build for Production

1. Install EAS CLI: `npm install -g eas-cli`
2. Create Expo account: `eas login`
3. Build: `eas build --platform ios` or `eas build --platform android`

See [Expo EAS Build docs](https://docs.expo.dev/build/introduction/) for details.

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Memos API Documentation](https://github.com/usememos/memos)
- [React Query Docs](https://tanstack.com/query/latest)

## Need Help?

- Check the main [README.md](./README.md) for detailed documentation
- Review backend logs for API errors
- Enable React Native debugger for detailed error messages
- Check Expo forums for platform-specific issues

---

**Happy note-taking! 📝**
