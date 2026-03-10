# 🚗 Rush Hour — Neon Puzzle

A neon-cyberpunk browser adaptation of the classic **Rush Hour** sliding-block puzzle built with **Next.js 15**, **TypeScript**, and **Tailwind CSS**.

Slide cars and trucks out of the way to free the **red car** and escape through the exit!

---

## ✨ Features

| Feature | Details |
|---|---|
| 🎮 **15 hand-crafted puzzles** | 5 Easy · 5 Medium · 5 Hard |
| 💡 **BFS Hint system** | Highlights the optimal next vehicle to move |
| ↩ **Unlimited undo** | Revert any move without a move penalty |
| ⏸ **Pause / Resume** | Freezes the timer and hides the board |
| ⭐ **Star ratings** | 1–3 stars based on move efficiency |
| 🏆 **Personal bests** | Best move count & time saved to localStorage |
| 🔊 **Web Audio SFX** | Procedurally generated sounds — no external files |
| 🎵 **Ambient music** | Toggleable synth pad background music |
| 📱 **Mobile-first** | Touch drag + on-screen controls; responsive scaling |
| ⌨️ **Keyboard support** | Arrow keys + Ctrl+Z undo |
| 🌐 **Zero-config Vercel deploy** | Works out of the box |

---

## 🎮 How to Play

1. **Goal**: slide the 🚗 red car to the **EXIT ▶** on the right side of the middle row.
2. **Rules**: vehicles can only move along their own axis — horizontal cars slide left/right, vertical cars slide up/down.
3. **Win**: clear the path and slide the red car all the way to the exit.

---

## 🕹️ Controls

### Desktop
| Action | Input |
|---|---|
| Move a vehicle | **Click + drag** |
| Arrow keys | Focus a vehicle (Tab) then press arrow keys |
| Undo | `Ctrl + Z` or ↩ Undo button |
| Pause | `Escape` or ⏸ Pause button |

### Mobile / Touch
| Action | Input |
|---|---|
| Move a vehicle | **Swipe** in the vehicle's valid direction |
| Undo | Tap ↩ Undo |
| Hint | Tap 💡 Hint |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript strict mode
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Sound**: Web Audio API (no external files)
- **State**: React `useReducer` + custom hooks
- **Storage**: `localStorage` for personal bests
- **Solver**: BFS for optimal hints

---

## 🗂️ Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout + metadata
│   ├── page.tsx            # Game shell
│   └── globals.css         # Global styles
├── components/
│   ├── GameBoard.tsx       # 6×6 grid + exit marker
│   ├── VehicleComponent.tsx# Vehicle rendering + drag
│   ├── GameHeader.tsx      # Moves, timer, bests
│   ├── GameControls.tsx    # Undo, Hint, Pause, Sound
│   ├── WinScreen.tsx       # Victory overlay + confetti
│   ├── MenuScreen.tsx      # Main menu + level picker
│   └── PauseScreen.tsx     # Pause overlay
├── hooks/
│   ├── useGameState.ts     # Central reducer
│   ├── useSound.ts         # Web Audio SFX & music
│   └── useTimer.ts         # Count-up timer
├── utils/
│   ├── gameLogic.ts        # Move validation, win detection
│   ├── solver.ts           # BFS solver
│   └── storage.ts          # localStorage helpers
├── data/
│   └── levels.ts           # 15 puzzle definitions
└── types/
    └── game.ts             # TypeScript interfaces
```

---

## 🚀 Run Locally

```bash
# Clone & install
git clone <repo-url>
cd rush_hour
npm install

# Development server
npm run dev
# → http://localhost:3000
```

---

## ☁️ Deploy to Vercel

**Option A — CLI**
```bash
npm i -g vercel
vercel
```

**Option B — GitHub**
1. Push to GitHub
2. Go to vercel.com/new → Import repository
3. Click **Deploy** — Vercel auto-detects Next.js

---

## 📝 License

MIT
