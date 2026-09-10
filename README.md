# 🎰 P2P Poker Chips & Side Pot Calculator

A real-time, **serverless Peer-to-Peer (P2P)** Poker Chip Counter and Pot Management application for live/home games. It eliminates the need for physical chips or central backend servers by synchronizing all players directly using **WebRTC DataChannels** and the browser **BroadcastChannel API**.

---

## ✨ Key Features

- **🌐 Serverless Peer-to-Peer (P2P) Architecture**:
  - Connects players across devices via **WebRTC DataChannels** (PeerJS).
  - Built-in **BroadcastChannel** support for 0ms instant sync when testing across multiple browser tabs on the same machine.
  - Zero centralized databases or backend game servers required.

- **👑 Flexible Host / Dealer Roles**:
  - **Playing Host**: Host takes a seat at the table, plays hands, and bets chips while managing table operations.
  - **Dealer-Only Mode (Non-Playing Host)**: Host acts solely as a dealer, managing card dealing, street progress, pot payouts, and chip rebuys without taking up a seat or placing bets.
  - **Role Switching**: Host can toggle Dealer-Only mode at table creation, in practice mode, or inside the Settings menu (with explicit Save confirmation). Sitting down at empty seats is automatically disabled when in Dealer-Only mode.

- **🌍 Multi-Language Support (i18n)**:
  - Instant localization toggle between **English (EN)**, **Thai (TH)**, and **Japanese (JA)** via the unified Tools dropdown.
  - Persistent language preference using a lightweight custom React context without heavy dependencies.

- **🧮 Live Pot & Side-Pot Calculator**:
  - Automatically calculates complex **side pots** when players have unequal stacks or go all-in at different amounts.
  - Interactive **Pot Math breakdown modal** explaining who is eligible for which side pot and total chips invested per player.
  - Handles **split pots** and awards odd chip remainders to the player closest to the dealer button (standard poker rules).

- **🏆 Winner Selection Modal**:
  - Dedicated full-featured modal for awarding the pot with four flexible payout modes:
    - **Solo** – Award the entire pot to a single winner.
    - **Split** – Divide the pot equally among multiple winners.
    - **Side Pots** – Assign individual side pots to separate winners when players are all-in.
    - **Custom** – Enter exact payout amounts per player for complete manual control.
  - Displays active contenders vs. folded players, with chip stack context for each.

- **📖 Hand Rankings Reference**:
  - Built-in **Hand Rankings Modal** with all 10 Texas Hold'em hand ranks, illustrated example card combinations, tier badges (High / Mid / Low), alternate names, tie-breaker rules, and a searchable/filterable interface.
  - Fully localized (EN / TH / JA).

- **⚙️ Unified Tools Dropdown**:
  - Single consolidated toolbar button combining language selection, Hand Rankings reference, and Pot Calculator access — keeping the header uncluttered on mobile and desktop.

- **🎯 Interactive Poker Felt Table**:
  - Visual oval felt table with customizable seat capacities (2 to 10 players) and position badges (Dealer `D`, Small Blind `SB`, Big Blind `BB`, Winner `🏆`).
  - Real-time active bet placement in front of each seated player.
  - Visual **3D Casino Chip Stacks** rendered with authentic denominations ($1, $5, $25, $100, $500, $1,000).
  - **Grid / List view toggle** — switch between the oval table layout and a compact list view, with preference persisted to `localStorage`.

- **⚡ Turn-Based Action Controls**:
  - Smart buttons for **Fold**, **Check**, **Call**, **Raise**, and **All-In**.
  - Quick bet presets: `2.5 BB`, `3 BB`, `1/2 Pot`, `3/4 Pot`, `Pot`, and an adjustable raise slider.
  - Active turn highlighting with animated pulse and visual cues.

- **📢 Stage & Announcement Banners**:
  - Animated popup announcements to all players when advancing streets (`Preflop` → `Flop` → `Turn` → `River` → `Showdown`).

- **👑 Comprehensive Host Administration**:
  - **Deal New Hand**: Rotates dealer button, collects blinds & optional antes, and triggers preflop action.
  - **Next Street**: Advance betting rounds with optional host confirmation or auto-advance toggle.
  - **Award Pot**: Opens the Winner Selection Modal to choose solo, split, side-pot, or custom payout — triggering celebratory confetti and win banner overlays.
  - **Rebuys & Chip Top-ups**: Inject chips into any player's stack mid-game.
  - **Player Management**: Kick disconnected or non-responsive players from the table.
  - **Customizable Blinds & Seats**: Adjust Small Blind, Big Blind, Ante, and Table Capacity (2–10 seats) on the fly.

- **🛡️ Player UX & Session Protection**:
  - Auto-generated poker aliases (e.g. *Maverick*, *Ace*, *Shark*) if nickname is left blank.
  - Accidental reload / tab-close confirmation (`beforeunload`) to safeguard ongoing game state.

- **📜 Live Audit Log & Winner Celebrations**:
  - Real-time activity feed recording every fold, call, raise, street advancement, and winner payout.
  - Animated victory announcements and particle bursts for winning hands.

- **🕹️ Practice / Offline Mode**:
  - Single-device practice table with customizable bot counts (2–10 players) and optional Dealer-Only host mode.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm**, **yarn**, or **pnpm**

### 2. Installation
```bash
git clone <repo-url>
cd poker-chip-tracker
npm install
```

### 3. Running the Development Server
```bash
npm run dev -- --host
```
The application will be accessible at:
- **Local machine**: `http://localhost:5173`
- **Other devices on your Wi-Fi**: `http://<your-local-ip>:5173`

### 4. Building for Production
```bash
npm run build
```
Production assets are generated in the `dist/` folder and can be deployed to any static hosting provider (Vercel, Netlify, Cloudflare Pages, GitHub Pages).

---

## 🎮 How to Play

### Hosting a Table
1. Open the app and enter your **Nickname** (or keep the randomized alias).
2. Set your starting **Buy-In** chips (e.g. 1,000) and choose **Table Size** (2–10 seats).
3. Check **"Host as Dealer Only (non-playing)"** if you want to manage the table without playing chips.
4. Optionally provide a custom **Room Code** (e.g. `vegas-night`).
5. Click **"Create Table & Share Code"**.
6. Share the Room Code with your friends.

### Joining a Table
1. Open the app on another tab, phone, or laptop.
2. Enter your **Nickname**.
3. Paste the **Room Code** into **"Join Existing Table"** and click **Join**.
4. Click any empty seat at the table to sit down!

### Running a Hand
1. The **Host** clicks **"DEAL NEW HAND"**.
2. Blinds are posted automatically, and the action highlights the player whose turn it is.
3. Seated players take turns choosing **Fold**, **Check/Call**, or **Raise**.
4. When betting completes for the street, the Host progresses to the next street or awards the pot via the **Winner Selection Modal**.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript 7
- **Styling**: Tailwind CSS v4 + Lucide Icons
- **P2P Networking**: WebRTC (PeerJS) + BroadcastChannel API
- **Build Tool**: Vite 8
- **Localization**: Lightweight React Context (English, Thai, Japanese)
- **Special Effects**: canvas-confetti

---

## 📂 Project Structure

```
poker-chip-tracker/
├── public/
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── ActionControls.tsx       # Player betting controls (Fold, Call, Raise, All-In)
│   │   ├── ChipStack.tsx            # 3D Casino chip stack visualizer & breakdown
│   │   ├── GameLog.tsx              # Activity history feed
│   │   ├── HandRankingsModal.tsx    # Interactive hand rankings reference (EN/TH/JA)
│   │   ├── HostPanel.tsx            # Dealer & table administration controls
│   │   ├── LanguageToggle.tsx       # Standalone language selector (legacy/fallback)
│   │   ├── PotCalculatorModal.tsx   # Side-pot and chip math inspection modal
│   │   ├── StreetAnnouncement.tsx   # Stage / street transition popup banners
│   │   ├── TableView.tsx            # Felt oval table layout, grid/list toggle & seated players
│   │   ├── ToolsDropdown.tsx        # Unified toolbar: language switcher + tools menu
│   │   ├── WinnerCelebration.tsx    # Winner celebration banner & animation overlay
│   │   └── WinnerSelectionModal.tsx # Award pot modal (solo / split / side-pots / custom)
│   ├── hooks/
│   │   └── useP2PPoker.ts           # Hybrid P2P network state manager & rules dispatch
│   ├── i18n/
│   │   ├── LanguageContext.tsx      # Multi-language provider & hook
│   │   └── translations.ts          # English, Thai, and Japanese translation dictionary
│   ├── types/
│   │   └── poker.ts                 # Data models & WebRTC message protocols
│   ├── utils/
│   │   └── pokerRules.ts            # Pure pot, side pot, and betting calculations
│   ├── App.tsx                      # Main layout, lobby coordinator & reload protector
│   ├── App.css                      # Component-scoped styles
│   ├── index.css                    # Tailwind styles & custom casino animations
│   └── main.tsx                     # Application entry point wrapped in LanguageProvider
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 📄 License
MIT License. Free to use, modify, and distribute for personal and commercial poker games.
