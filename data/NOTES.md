# Notes

Context for the numbers in the CSVs: what was run, in which setup, and what happened. Both harnesses are in this one file so the differences sit side by side. All requests happened on **2026-11-14**, and the CSV timestamps are the provider's local time.

## Shared by both runs

| | |
|---|---|
| Main model | Claude Opus 5.5 (`claude-opus-5-5`) |
| API provider | The same provider for both |
| Prompts | Identical. Run 1 is the full dashboard spec, Run 2 is the "more creative, more sounds" follow-up (see `prompts/`) |
| Both built | A Vite + React + TypeScript + Tailwind v4 + lucide-react app: Pomodoro timer, procedural Web Audio mixer, task queue |
| Both hit | An "insufficient available balance" error partway through Run 2, then continued |
| Both ended | With a note saying audio quality still needs a manual listening check |

## Side by side

| | Claude CLI | opencode |
|---|---|---|
| Run by | Me | My friend |
| Permission / mode | Auto mode | Plan mode, then build |
| Skills loaded | A dataviz skill | Superpowers: using-superpowers, brainstorming, writing-plans, executing-plans, test-driven-development, requesting-code-review, verification-before-completion |
| Docs lookup | context7 (called twice in Run 1) | context7 |
| Helper model | Sonnet 5 side calls: 9 in Run 1, 13 in Run 2 | One tiny Sonnet 5.5 call at session start |
| Asked before building (Run 2)? | No | Yes: it proposed a direction, he replied "sure i give you full creative control however dont be too ambitious and do whatever the best you can possibly do" |
| Subagents | None seen | Several code-review subagents (not visible as separate rows in the log) |
| How it verified | Drove a real headless browser | Unit tests, lint, build, review subagents; no browser run |
| Starting context in Run 2 | ~63k tokens carried over from Run 1 | ~53k tokens carried over from Run 1 |
| Reasoning effort | Medium, as I reported it | Not recorded |

## Claude CLI

**Setup.** Claude CLI on my own API key, running Opus 5.5 at medium effort, with Sonnet 5 making helper calls. The Sonnet calls show up next to shell commands and not during file writing. I believe they come from the permission classifier and the end-of-run recap, but I haven't confirmed that.

**Run 1** (about 15 minutes, 38 requests)
- Loaded the dataviz skill and called context7 before writing anything.
- Auto mode blocked the scaffold command (`npm create vite`), so the model wrote the project files by hand instead. Because of that it chose the dependency versions itself (for example `lucide-react ^0.468.0`).
- Wrote everything in batches, wrote the stylesheet as one minified block, ran the build, and stopped.
- Build passed. Nothing was opened in a browser.

**Run 2** (about 16 minutes of work, 57 requests, one balance error)
- No approval step. It read five files, then rewrote the audio engine and added a new audio module (new rain, a soft pad in place of the drone, ocean, fireplace, night-garden crickets, vinyl), three presets, illustrated sound tiles, botanical timer art and a restyled interface.
- It then wrote a script that drove a headless Chrome over the remote-debugging port. The checks covered mobile overflow, all six layers, presets and the timer.
- The run stopped with a 402 "insufficient available balance" error after the verification phase. I topped up and typed "continue the last prompt". It resumed about 10 minutes later.
- After resuming, the check caught a pause/reset timing problem in the timer. It fixed it and re-ran the checks, which passed, and then ran the build.
- Final note: build and browser interaction checks passed, audio quality still needs listening feedback.

**What it left behind.** Hand-written CSS in one minified block, text sizes down to about 5.5px, leaf art that overlaps the reset and skip buttons, and dead space inside the sound tiles.

## opencode

**Setup.** opencode on the same provider, running Opus 5.5 in its "Plan (Cheaper)" mode, with the Superpowers skill set and context7. The harness reported Node v26.13.1. By the end the model selector showed "Build · Claude Sonnet 5.5", but that was not used for any of the requests in these CSVs.

**Run 1** (about 10 minutes, 30 requests)
- Loaded two skills up front (using-superpowers, brainstorming), looked up Tailwind with context7, and ran the real scaffold command, which worked. It installed the latest `lucide-react` (`^1.73.0`).
- Wrote the files in batches, with the stylesheet as one minified block, same as mine. It loaded verification-before-completion before the build.
- The first build failed: that `lucide-react` version has no `Github` icon export. It removed the icon and the second build passed.
- Final note matched the harness rule: the dev command plus one line about manual verification. Nothing was opened in a browser.

**Run 2** (about 10 minutes before the balance error and about 16 after resuming, 55 requests)
- It stopped and proposed a direction first (a "midnight listening studio": orbital timer, six-channel sound rack, three presets). He approved with the scope-limiting message quoted above.
- It wrote a plan doc (`docs/superpowers/plans/2026-11-14-midnight-studio.md`), then wrote tests first. The 4 tests check that the noise generator is finite, bounded, DC-free and smoother than white noise, that loops are seam-safe, and that the six sounds and three presets are complete. They failed first, then passed after the audio modules existed.
- New sounds: rain, pad, vinyl, ocean, wind, brown noise. It added real pink and brown noise plus loop smoothing.
- It hit the 402 balance error after the mixer component, then he typed "continue". It wrote the timer, app and a long, multi-line stylesheet.
- Several review subagents then looked at the changes. Lint warnings in the timer hook were fixed. `npm test && npm run lint && npm run build` passed.
- Final note: build, lint and 4 tests pass, visuals and audio quality still need manual browser verification.

**What it left behind.** In Run 2, readable multi-line CSS (Run 1's was minified), text sizes down to 4px, a caption clipped at the edge of the last card, and no browser run at any point.

## Rows excluded from the CSVs

`opencode-run1.csv` and `opencode-run2.csv` cover only the two runs. His request log also had **5 small Sonnet calls from earlier sessions** (1:30pm to 2:35pm, 23,830 charged in total), before the first run started. They are left out.

`opencode-run1.csv` does include the single Sonnet 5.5 call at 15:59:09, because it happened at the very start of the session.

## Confounders

- **One run each.** This is an observation, not a benchmark.
- **The harness is bundled with other things.** I can't separate opencode from its skills, or plan mode from auto mode.
- **Run 2 wasn't identical.** opencode had an approval step and a "don't be too ambitious" instruction.
- **Different scaffolding.** My scaffold was blocked, so my dependency versions were hand-picked. His ran the real scaffold and got the latest versions, which is why his first build failed.
- **opencode's total is probably a floor.** His review subagents run in fresh contexts, but every row in his log sits on one growing conversation, so those calls are likely logged elsewhere.
- **No audio listening.** Neither result has been compared by ear.
