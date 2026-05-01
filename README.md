# Walrun - Walk Run Interval Tracker

Walrun is a lightweight, privacy-focused Progressive Web App (PWA) designed to help you track your walk-run intervals. Whether you're following the Galloway method or your own custom routine, Walrun provides a clean, intuitive interface to keep you on track.


## 🚀 Features

- **Multiple Modes**:
  - **Normal**: Simple 1:1 run/walk intervals.
  - **Galloway**: Optimized intervals based on your target pace.
  - **Custom**: Set your own specific run and walk times.
  - **Record**: Manually switch phases to find your natural rhythm and save it as a custom mode.
- **PWA Ready**: Install it on your home screen for an app-like experience and offline support.
- **Audio Cues**: Overlapping audio notifications so you know exactly when to switch phases without looking at your screen.
- **Dark Mode**: Automatic and manual toggle for high-contrast viewing.
- **Training Log**: Keep track of your session history locally on your device.
- **Clean UI**: Built with a focus on usability and modern aesthetics.

## 🛠️ Tech Stack

- **Framework**: [Alpine.js](https://alpinejs.dev/) (Lightweight JavaScript framework)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Runtime/Package Manager**: [Bun](https://bun.sh/)
- **PWA**: Service Workers & Web App Manifest

## 📂 Project Structure

```text
.
├── assets/             # Static assets
│   ├── css/            # Compiled CSS (output.css)
│   ├── faaah.mp3       # Notification sound
│   └── walkrunicon.png # App icon
├── src/                # Source files
│   ├── css/            # Tailwind source (input.css)
│   └── js/             # Application logic (app.js)
├── index.html          # Main entry point
├── sw.js               # Service Worker for offline support
├── manifest.json       # PWA configuration
└── tailwind.config.js  # Tailwind configuration
```

## 🏁 Getting Started

### Prerequisites

You will need [Bun](https://bun.sh/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/farizvect/walrun
   cd walrun
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

### Development

To start the Tailwind CSS compiler in watch mode:
```bash
bun run watch
```

### Build

To generate the minified production CSS:
```bash
bun run build
```

## 📱 Installation (PWA)

- **Android/Chrome**: Open the site and tap "Install App" or find "Install" in the browser menu.
- **iOS/Safari**: Tap the "Share" button and select "Add to Home Screen".

---
*Created with focus on simplicity and performance.*
