# GreenSnap AI — Frontend (Expo React Native)

> Mobile frontend for **GreenSnap AI** — a cross-platform Expo app that lets citizens capture geo-tagged waste reports and submit them to the GreenSnap backend (which uses **MobileNetV3 Large** for inference).  
> This single `README.md` contains everything needed to run, connect, build, and contribute to the frontend.

---

## Table of Contents

- [About](#about)  
- [Key Features](#key-features)  
- [Tech Stack](#tech-stack)  
- [Prerequisites](#prerequisites)  
- [Quick Start](#quick-start)  
- [Environment (`.env`) — Template](#environment-env---template)  
- [Permissions & Device Notes](#permissions--device-notes)  
- [Build & Release](#build--release)  
- [Troubleshooting](#troubleshooting)  
- [Contributing](#contributing)  
- [License](#license)

---

## About

This Expo-managed React Native app is the citizen-facing client for GreenSnap AI. Users capture or upload images of litter/waste, the app attaches GPS, then submits reports to the backend for **MobileNetV3 Large**-based validation and lifecycle management. The frontend focuses on a lightweight, secure UX and delegates inference & secret management to the backend.

---

## Key Features

- 📷 Camera capture and image upload  
- 📍 Automatic GPS attachment to each report  
- 🔔 Report status & lifecycle UI (pending, in-progress, resolved)  
- 🏆 Leaderboard & basic user profile  
- 📱 Cross-platform: Android, iOS, Web (via Expo)

---

## Tech Stack

- **Expo (managed)** + React Native  
- Expo Router (file-based navigation)  
- Expo ImagePicker / Camera & Location APIs  
- Axios / Fetch for network calls  
- React Context / Zustand (or Redux) for state  
- Expo SecureStore for JWT / token storage  
- **Backend inference model:** MobileNetV3 Large (mobile-optimized CNN used server-side for waste detection/validation)

---

## Prerequisites

- Node.js (16+ recommended)  
- npm or yarn  
- Expo CLI (optional): `npm install -g expo-cli` or use `npx expo`  
- Android Studio / Xcode for emulators if testing locally

---

## Quick Start

```bash
# 1. clone
git clone https://github.com/MohammadAli-14/GreenSnap-Yolo-frontend.git
cd GreenSnap-Yolo-frontend

# 2. install dependencies
npm install

# 3. create .env (see template below)

# 4. run in development
npx expo start

## Build & Release

### Android (local / debug)

npx expo prebuild
npx expo run:android
# or use EAS Build for managed app store builds


## Quick Start

```bash
# 1. clone
git clone https://github.com/MohammadAli-14/GreenSnap-Yolo-frontend.git
cd GreenSnap-Yolo-frontend

# 2. install dependencies
npm install

# 3. create .env (see template below)

# 4. run in development
npx expo start

## Build & Release

### Android (local / debug)

npx expo prebuild
npx expo run:android
# or use EAS Build for managed app store builds
````

### iOS (macOS required)

```bash
npx expo prebuild
npx expo run:ios
# or use EAS Build for App Store builds
```

### Web

```bash
npm run web
```

For production builds and store submissions use **EAS Build** (Expo Application Services) and follow platform signing guidelines.

---

## Troubleshooting

* **Network errors:** confirm `EXPO_PUBLIC_API_URL` is correct and the backend allows requests from your device (CORS for web or network reachability for device).
* **Image upload fails:** ensure `uri`, `name`, and `type` are correctly set in `FormData`. On Android ensure the URI is accessible (content:// or file://).
* **Location returns null:** verify runtime permissions and device location services are enabled; test with both coarse & fine accuracy.
* **Authentication issues:** confirm token is stored and attached as `Authorization: Bearer <token>`. Use Expo SecureStore to persist tokens.
* **Debugging:** use Expo DevTools, remote JS debugging, and check backend logs for incoming requests and errors.
* **Model-related anomalies:** if inference results seem off, verify the backend inference service using the MobileNetV3 Large model is running, check model input preprocessing (resize, normalization), and confirm the backend is returning expected confidence scores and labels.

---

## Contributing

Contributions are welcome!

* Fork → feature branch → open PR with clear description.
* Open issues before large architectural changes.
* Keep UI components modular and small; add unit tests where practical.
* **Never commit** `.env` or private keys. Use `EXPO_PUBLIC_` variables for any client-side config only.

Consider adding a `CONTRIBUTING.md` and a safe `.env.example` with only public placeholders.

---

## License

This project is licensed under the **MIT License** — see the `LICENSE` file in the repository root for details.

---

*Last updated: 2025-09-10*


