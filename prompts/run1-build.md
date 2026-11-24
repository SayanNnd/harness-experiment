# Run 1: the build

The first prompt, sent to both harnesses in an empty directory. It is a long, very specific spec, with strict "harness rules" at the end (batch the writes, build once, no work summary).

Both runs used this wording. The opencode copy has markdown backticks around commands (for example around `npm create vite@latest`), and the Claude CLI copy was plain text. Nothing else differs.

````text
Build a "Developer Pomodoro & Ambient Soundscape Dashboard" in the current directory.

STACK
Vite + React + TypeScript + Tailwind CSS v4 + lucide-react. No other runtime dependencies.
Scaffold non-interactively: `npm create vite@latest . -- --template react-ts`, then `npm i && npm i lucide-react && npm i -D tailwindcss @tailwindcss/vite`. Use the @tailwindcss/vite plugin and a single `@import "tailwindcss";` in the CSS (v4, no tailwind.config or postcss config).

DESIGN
Dark, glassy, Linear/Raycast feel: near-black background with a subtle radial gradient and faint grid or noise, translucent panels (bg-white/[0.03], backdrop-blur), crisp 1px borders (border-white/10), one restrained accent color, Inter or system font, `tabular-nums` on every number. Responsive bento grid: timer is the hero tile, mixer and tasks sit beside or below it, single column on mobile. Micro-interactions on hover, press and focus (visible focus rings). Respect prefers-reduced-motion.

FEATURES
1. Pomodoro timer
   - Large SVG ring with smooth radial progress (stroke-dashoffset + CSS transition) and MM:SS in the center.
   - Modes: Focus / Short Break / Long Break, durations editable and persisted in localStorage (defaults 25/5/15).
   - Start/Pause, Reset, Skip. Auto-advance with a long break after every 4 focus sessions, plus a session counter.
   - Compute remaining time from an end timestamp, not by decrementing every tick, so it stays accurate in background tabs. Show the time in document.title.
   - Subtle pulsing glow around the ring while running, with a different tint per mode.
   - Play a short synthesized chime (Web Audio) when a session ends.
   - Keyboard shortcuts: Space = start/pause, R = reset (ignore when typing in an input).

2. Procedural ambient mixer (Web Audio API only, zero audio files)
   - Three layers: Rain (pink noise through filters with slow modulation), Deep Drone (a few detuned oscillators through a lowpass filter with a slow LFO), Vinyl Crackle (sparse random impulses plus a faint hiss, high-passed).
   - Each layer has a vertical volume fader (accessible, keyboard-operable) and an on/off toggle. Add a master volume.
   - Live visualizer: one AnalyserNode per layer driving animated bars, updated through requestAnimationFrame with refs and direct DOM/SVG updates (NOT React state per frame).
   - Create the AudioContext lazily on the first user gesture and resume it. Ramp gains with setTargetAtTime to avoid clicks. Clean up nodes and the animation frame on unmount.
   - Keep the audio engine in plain TS modules (src/audio/), separate from the React components.

3. Task queue
   - Add, toggle done, delete, and set priority (High/Med/Low, cycle on click). Sort by priority, with done tasks sinking to the bottom.
   - Persist to localStorage (wrap reads and writes in try/catch, validate parsed data).
   - Empty state with a friendly message, Enter to add.

STRUCTURE
src/components, src/hooks (useTimer, useLocalStorage, etc.), src/audio. Keep components small and typed, no `any`, no placeholder or TODO code.

HARNESS RULES (STRICT)
- Minimize turns: write multiple files per step instead of one tool call per tiny edit.
- NEVER read package-lock.json, node_modules/, or dist/.
- When everything is written, run `npm run build` once. If it fails, fix the errors and rebuild until it passes. Then stop.
- Final message: only the command to start the dev server and a one-line note on anything that doesn't work. No work summary.
````

## Notes on how it was used

| | Claude CLI | opencode |
|---|---|---|
| Sent as | One message | One message |
| Mode | Auto mode | Plan mode |
| Result | `claude-cli/run1/` | `opencode/run1/` |
