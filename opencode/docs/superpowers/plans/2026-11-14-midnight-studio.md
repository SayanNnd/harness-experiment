# Midnight Listening Studio — approved design and implementation plan

**Goal:** Give Still a distinct, calm instrument-like identity and improve its procedural soundscape without adding dependencies or changing timer/task behavior.

**Approved direction:** Midnight listening studio, violet-on-ink glass, orbital timer, tactile six-channel sound rack, restrained motion. The user approved this direction and delegated creative implementation choices.

**Architecture:** Keep the existing React/TypeScript components and timestamp timer. Separate reusable procedural signal generation from Web Audio graph ownership. A typed sound catalog supplies six layers and three presets; visualizers update DOM refs, not React state per frame.

**Constraints:** Vite + React + TypeScript + Tailwind v4 + lucide-react only. No audio files. Lazy user-gesture audio, ramped gains, cleanup, accessible controls, reduced motion, mobile layout. Preserve localStorage keys and task data. No commits or branch changes. Run `npm run build` after all changes; fix compiler errors and stop once it passes.

## Task 1 — Procedural sound engine
- Create `src/audio/noise.ts` for real pink/brown noise and smoothly looped stereo textures.
- Create `src/audio/sounds.ts` for LayerId, six-layer catalog and Rainy Window / Night Shift / Coastal Quiet preset levels.
- Rebuild `src/audio/SoundEngine.ts`: stereo rain wash and droplets, low-level harmonically voiced warm pad with diffuse reverb, restrained vinyl, layered ocean swells, wind, brown noise. Build layers only on activation; create context lazily. Use a conservative master, output compressor, and click-free ramps. Track all sources/nodes for disposal.
- Verify generated samples are finite, bounded, nonconstant, and loop-safe with Node's built-in test runner. Verify preset IDs/levels and full-layer coverage.

## Task 2 — Sound rack
- Update `src/components/Mixer.tsx`; extract `SoundVisualizer.tsx`.
- Six compact vertical faders, distinct sound glyphs, live bars, powered channel lamps, explicit master mute, three presets. Changed controls clear selected preset; mute restores the prior mix. Show errors without claiming sound started.
- Verify keyboard/fader labels, rapid preset changes, zero/master mute and silent startup by source review; listening requires manual browser check.

## Task 3 — Expressive interface
- Update `src/App.tsx`, `src/components/Timer.tsx`, `src/index.css`, and page metadata.
- Editorial header, technical labels, asymmetrical bento, dial ticks, orbital accents, active halo, illustrated quiet-space card. Keep all timer settings/shortcuts and task interactions.
- Restrained staggered entrance, running-only orbit, completion transitions, reduced-motion fallbacks. Single column at narrow widths; sound rack remains usable.
- Verify production build after all files are written. Manually check layout at 390px and desktop, reduced motion, timer modes, task completion, and listen to every layer and preset. Do not claim browser/listening checks were run if unavailable.

## Review focus
- Audio remains silent on page load and after disposal.
- Fast control changes cannot apply a stale preset after async context resume.
- Muting preserves fader values; every gain is finite and clamped.
- Low-frequency synthesis avoids DC, harsh resonance, or overly loud multi-layer output.
- Mobile/focus/reduced-motion states retain all functionality.
