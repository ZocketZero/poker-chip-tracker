# 🎰 P2P Poker Chips & Side Pot Calculator

A real-time, **serverless Peer-to-Peer (P2P)** Poker Chip Counter and Pot Management application for live/home games. It eliminates the need for physical chips or central backend servers by synchronizing all players directly using **WebRTC DataChannels** and the browser **BroadcastChannel API**.

---

## ✨ Key Features

- **🌐 Serverless Peer-to-Peer (P2P) Architecture**:
  - Connects players across devices via **WebRTC DataChannels** (PeerJS).
  - Built-in **BroadcastChannel** support for 0ms instant sync when testing across multiple browser tabs on the same machine.
  - Zero centralized databases or backend game servers required.

- **🧮 Live Pot & Side-Pot Calculator**:
  - Automatically calculates complex **side pots** when players have unequal stacks or go all-in at different amounts.
  - Interactive **Pot Math breakdown modal** explaining who is eligible for which side pot and total chips invested per player.
  - Handles **split pots** and awards odd chip remainders to the player closest to the dealer button (standard poker rules).

- **🎯 Interactive Poker Felt Table**:
  - Visual 8–9 player oval felt table with positions (Dealer `D`, Small Blind `SB`, Big Blind `BB`).
  - Real-time active bet placement in front of each seated player.
  - Visual **3D Casino Chip Stacks** rendered with authentic denominations ($1, $5, $25, $100, $500, $1,000).

- **⚡ Turn-Based Action Controls**:
  - Smart buttons for **Fold**, **Check**, **Call**, **Raise**, and **All-In**.
  - Quick bet presets: `2.5 BB`, `3 BB`, `1/2 Pot`, `3/4 Pot`, `Pot`, and an adjustable raise slider.
  - Active turn highlighting and audio/visual cues.

- **👑 Host / Dealer Controls**:
  - **Deal New Hand**: Rotates dealer button, collects blinds & optional antes, and triggers preflop action.
  - **Next Street**: Advance betting rounds (`Preflop` → `Flop` → `Turn` → `River` → `Showdown`).
  - **Award Pot**: Select one or multiple winners to split the pot, with celebratory confetti animations.
  - **Rebuys & Chip Top-ups**: Inject chips into any player's stack mid-game.
  - **Customizable Blinds**: Adjust Small Blind, Big Blind, and Ante amounts on the fly.

- **📜 Live Audit Log**:
  - Real-time activity feed recording every fold, call, raise, street advancement, and winner payout.

- **🕹️ Practice / Offline Mode**:
  - Single-device practice table with pre-seated bots to test poker calculations and chip management without networking.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn** / **pnpm**

### 2. Installation
```bash
git clone <repo-url>
cd poker-chip
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
Production assets are generated in the `dist/` folder and can be deployed to any static hosting provider (Vercel, Netlify, GitHub Pages, Cloudflare Pages).

---

## 🎮 How to Play

### Hosting a Table
1. Open the app and enter your **Nickname**.
2. Set your starting **Buy-In** chips (e.g. 1000).
3. Optionally provide a custom **Room Code** (e.g. `vegas-table`).
4. Click **"Create P2P Table & Invite Players"**.
5. Copy the Room Code from the top navbar and share it with your friends.

### Joining a Table
1. Open the app on another tab, phone, or laptop.
2. Enter your **Nickname**.
3. Paste the **Room Code** into **"Join Existing Table"** and click **Join**.
4. Click any empty seat at the table to sit down!

### Running a Hand
1. The **Host** clicks **"DEAL NEW HAND"**.
2. Blinds are posted automatically, and the action highlights the player whose turn it is.
3. Players take turns choosing **Fold**, **Check/Call**, or **Raise**.
4. When betting completes, the Host progresses to the next street or awards the pot to the winner(s).

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + Lucide Icons
- **P2P Networking**: WebRTC (PeerJS) + BroadcastChannel API
- **Build Tool**: Vite 8
- **Special Effects**: canvas-confetti

---

## 📂 Project Structure

```
poker-chip/
├── src/
│   ├── components/
│   │   ├── ActionControls.tsx     # Player betting controls (Fold, Call, Raise, All-In)
│   │   ├── ChipStack.tsx          # 3D Casino chip stack visualizer & breakdown
│   │   ├── GameLog.tsx            # Activity history feed
│   │   ├── HostPanel.tsx          # Dealer & table administration controls
│   │   ├── PotCalculatorModal.tsx # Side-pot and chip math inspection modal
│   │   └── TableView.tsx          # Felt oval table layout & seated players
│   ├── hooks/
│   │   └── useP2PPoker.ts         # Hybrid P2P network state manager & rules dispatch
│   ├── types/
│   │   └── poker.ts               # Data models & WebRTC message protocols
│   ├── utils/
│   │   └── pokerRules.ts          # Pure pot, side pot, and betting calculations
│   ├── App.tsx                    # Main layout & lobby coordinator
│   └── main.tsx                   # Application entry point
├── package.json
└── vite.config.ts
```

---

## 📄 License
MIT License. Free to use, modify, and distribute for personal and commercial poker games.
