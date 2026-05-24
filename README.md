<p align="center">
  <img src="https://raw.githubusercontent.com/iqbal-rashed/youtube-ad-blocker/main/images/icon128.png" width="128" height="128" alt="YouTube Ad Blocker Logo">
</p>

<h1 align="center"> YouTube Ad Blocker Extension </h1>

<p align="center">
  <b>A lightweight, high-performance browser extension designed to block and instantly skip YouTube ads.</b>
</p>

<p align="center">
  <a href="https://addons.mozilla.org/en-US/firefox/addon/block-youtube-ads/">
    <img src="https://img.shields.io/badge/Firefox-Official%20Add--on-FF7139?style=for-the-badge&logo=firefox-browser&logoColor=white" alt="Firefox Official Add-on">
  </a>
  <img src="https://img.shields.io/badge/Manifest-V3-brightgreen?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Manifest V3 Support">
  <img src="https://img.shields.io/badge/Licence-MIT-blue?style=for-the-badge" alt="License MIT">
</p>

<br>

## Description

This **YouTube Ad Blocker** is an advanced browser extension engineered to work seamlessly on **both Google Chrome and Mozilla Firefox** using a unified, clean codebase. It employs a modern dual-world execution architecture to solve the challenges of ad prevention on dynamic modern web players.

### Technical Concept Showcase

This codebase serves as a demonstration of high-performance DOM orchestration and event trust management:

- **`MutationObserver`:** Intercepts dynamic Single-Page Application (SPA) DOM swaps to catch ad elements before rendering.
- **Debounced Processing:** Limits computation overhead to a low-latency 50ms settling window during fast page transitions.
- **Event-Trust Proxy (`isTrusted` Spoofing):** Injects an ES6 `Proxy` to wrap event listeners in the page's main execution context, enabling simulated trusted user click chains.
- **CSS-Injection Painting:** Strips banner elements and display frames via pure stylesheet injection prior to visual browser paints to avoid layout flickering.

---

## Core Features

- **Instant Video Ad Skipping:** Multi-layered engine that accelerates video ads to 16x playback rate, mutes audio, seeks to completion, and triggers skipping mechanisms.
- **Banners & Companion Blocker:** Automatically collapses feed recommendations, sidebar banners, product tags, and top mastheads.
- **Overlay Ad Removal:** Instantly sweeps overlay popups and video card displays from the player canvas.
- **Glassmorphic Popup Panel:** Interactive control interface displaying real-time live blocking counters with toggle sync across all tabs.

---

## Installation

### For Mozilla Firefox (Recommended & Signed)

Get the officially signed version directly from the Firefox Add-ons directory:

👉 **[Download on Firefox Add-ons (Official)](https://addons.mozilla.org/en-US/firefox/addon/block-youtube-ads/)**

#### Developer / Manual Installation:

1. Clone this repository.
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on...**.
4. Select the `manifest.json` file inside the root folder.

---

### For Google Chrome

1. Clone or download this repository.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Toggle the **Developer mode** switch in the top-right corner.
4. Click **Load unpacked** in the top-left corner.
5. Select the root folder of the cloned repository.

---

## Project Structure

```
youtube-ad-blocker/
├── manifest.json       # Dynamic extension configuration (Chrome & Firefox MV3)
├── content-main.js     # MAIN world script (Event trust spoofing & native player overrides)
├── content.js          # Isolated content script (MutationObserver, logic, & storage listeners)
├── content.css         # Early-injected styles (Hides static banners and promo feeds)
├── popup.html          # Extension dashboard UI (Dark-themed glassmorphism panel)
├── popup.js            # Toggle logic, live counter animations, & storage syncing
└── images/             # Extension iconography
    ├── icon32.png
    ├── icon48.png
    ├── icon128.png
    └── logo.png
```

---

## Performance Auditing & Optimizations

- **Throttled Storage Writes:** Storage counter persistence is debounced to 2-second windows to reduce background CPU cycles.
- **Lightweight Package:** Compiled with zero runtime dependencies and fully cleaned of developer annotations to maintain a minimal extension footprint.
- **Safe Interceptors:** Core DOM-queries and proxy handlers execute defensively with silent catches to prevent player interference.
