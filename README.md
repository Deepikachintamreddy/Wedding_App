# VND Wedding Concierge — Monorepo Workspace

This repository houses the entire VND Wedding Concierge platform, featuring both the **Next.js Web Portal** and the **Expo (React Native) Mobile Application**.

## Project Structure

```
Wedding_App/
├── README.md         # Monorepo documentation
├── .gitignore        # Global git ignore configuration
├── web/              # Next.js 15 Web Application
└── mobile/           # Expo / React Native Mobile Application
```

---

## 🏗️ 1. Web Application (`web/`)

The Next.js 15 Web App provides an elegant, responsive web interface with premium dark navy and gold aesthetics, incorporating immersive wedding image backgrounds.

### Getting Started (Web)

1. Navigate to the web folder:
   ```bash
   cd web
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the local development server:
   ```bash
   npm run dev
   ```
4. Build the production application bundle:
   ```bash
   npm run build
   ```

---

## 📱 2. Mobile Application (`mobile/`)

The mobile application is a fully cross-platform React Native app powered by **Expo SDK 56**, configured to run on iOS, Android, and Web layouts.

### Features
- **Android Native Background Slideshow**: Fixes opaque screen navigation containers on Android by rendering the slideshow directly on local screen layout canvases.
- **Ticking Wedding Countdown Widget**: Live real-time ticker displaying days, hours, minutes, and seconds remaining.
- **Digital Invitation Mockup Simulator**: Interactive customizer with collapsible editing panels (general, dress, registry, timeline, entourage) and mobile viewport tab switching simulation.
- **Multi-Business Onboarding & Auth**: Support for multiple business category registration.

### Getting Started (Mobile)

1. Navigate to the mobile folder:
   ```bash
   cd mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npx expo start
   ```
4. Run compiler checks (TypeScript):
   ```bash
   npx tsc --noEmit
   ```
