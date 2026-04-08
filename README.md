# 🎰 Mashup Roulette

A BPM-matched song mashup app with a crossfader and slot machine UX. Spin the reels to discover unexpected song combinations, match their tempos, and blend them together.

**[Live Demo →](https://szabadkai.github.io/mashup-roulette/)**

## Features

- **Slot Machine Reels** — Spin to randomly pick songs for Deck A & Deck B
- **BPM Matching** — Automatic tempo display with adjustable playback rate per deck
- **Beat Offset Sync** — Nudge timing by ±50ms / ±100ms / ±500ms to align beats
- **Crossfader** — Smooth volume blending between the two decks
- **Category Filters** — Filter songs by genre: 80s, 90s, Rock, Funk, Rap, Pop, Reggae, Dancehall
- **Save & Share Mixes** — Save your favorite combos locally or share via URL
- **Dual YouTube Players** — Powered by the YouTube IFrame API

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- YouTube IFrame API

## Getting Started

```bash
npm install
npm run dev
```

## Deployment

Deployed automatically to GitHub Pages via Actions on push to `main`.
