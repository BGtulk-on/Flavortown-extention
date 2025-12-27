# Fasty Flavortown Extension (v1.3)

A comprehensive browser extension for `flavortown.hackclub.com` that enhances the user experience by fixing bugs, improving performance, and creating a smoother interface.

## 🚀 Features

### 1. Performance Optimizations
*   **Extreme Performance Mode**: (Settings Toggle) Blocks heavy analytics scripts (Plausible, Sentry, Zaraz) and hides large hero backgrounds/assets to maximize speed.
*   **Shop Grid Optimization**: (Always Active) Uses CSS `content-visibility: auto` to defer rendering of off-screen shop items, making scrolling butter-smooth.
*   **Devlog Feed Optimization**: (Settings Toggle) Applies lazy-rendering to posts on the explore page.

### 2. Visual Enhancements
*   **Snow Effect Toggle**: (Settings Toggle) Disables the recursive snow particle effects and removes festive decorations (Santa hats, etc.) to save CPU/GPU cycles.
*   **Navigation Cleanup**: Renames the generic "Gallery" tab to "Projects" and provides a cleaner icon for better orientation.

### 3. Bug Fixes
*   **Devlog Attachment Deduplication**: (Settings Toggle) Detects and removes duplicate images/videos in post carousels. It also cleans up the navigation dots and hide chevrons for single-item posts.

## 🛠 Installation

### Chrome / Edge / Brave
1. Open `chrome://extensions/`
2. Enable **"Developer mode"** in the top right.
3. Click **"Load unpacked"**.
4. Select this directory.

### Firefox
1. Open `about:debugging#/runtime/this-firefox`
2. Click **"Load Temporary Add-on"**.
3. Select the `manifest.json` file from this directory.

> [!NOTE]
> Temporary add-ons in Firefox are removed when the browser restarts.

## ⚙️ How to use
Once installed, navigate to the **Settings** page on Flavortown. You will find several new checkboxes at the bottom of the settings form to toggle the extension's features.
                                                                   
