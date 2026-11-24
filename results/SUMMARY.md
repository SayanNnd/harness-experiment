# Summary

**Question:** does the harness matter, or is it all the model?

**Answer from this one experiment:** it matters for overhead, process and verification. It did not matter for taste. Both results look like the same model made them.

Every number below comes from the CSVs in [`data/`](../data). Run `python3 data/analyze.py` to reproduce them. Context for each setup is in [`data/NOTES.md`](../data/NOTES.md), and the weights are in [`data/weights.md`](../data/weights.md).

## 1. What was held constant

| | |
|---|---|
| Model | Claude Opus 5.5 |
| Provider | The same API provider |
| Prompts | Identical (see [`prompts/`](../prompts)) |
| Date | 2026-11-14 |

## 2. Cost (provider "Charged" units)

| | Claude CLI | opencode |
|---|---|---|
| Run 1: requests | 38 | 30 |
| Run 1: charged | 943,292 | **445,912** |
| Run 2: requests | 57 | 55 |
| Run 2: charged | 1,449,718 | 1,515,627 |
| **Total** | 2,393,010 | **1,961,539** (-18%) |
| Ratio, opencode vs Claude CLI | - | Run 1: 0.47x, Run 2: 1.05x |

### Run 1 in detail

| | Claude CLI | opencode |
|---|---|---|
| Charged per request | 24,823 | 14,864 |
| Raw output tokens | 40,759 | 18,032 |
| Average context per request | 40.7k | 34.7k |
| Split (input / output / cache write / cache read) | 12 / 42 / 32 / 14% | 17 / 40 / 21 / 22% |
| Sonnet helper calls | 9 requests, 202,769 (21%) | 1 request, 2,354 (1%) |
| Requests with a cold cache | 5, 214,754 | 3, 34,368 |

The 497,380 gap between the two splits roughly as:

| Source | Charged | Share of gap |
|---|---|---|
| Sonnet helper calls | 200,415 | 40% |
| Opus output tokens (39.2k vs 18.0k) | 211,380 | 42% |
| Everything else (cache writes, input) | 85,585 | 17% |

### Run 2 in detail

| | Claude CLI | opencode |
|---|---|---|
| Charged per request | 25,434 | 27,557 |
| Raw output tokens | 35,979 | 46,201 |
| Average context per request | 104k | 110k |
| Split (input / output / cache write / cache read) | 23 / 24 / 14 / 39% | 25 / 30 / 7 / 38% |
| Sonnet helper calls | 13 requests, 308,371 (21%) | 0 |
| Requests with a cold cache | 1, 125,014 | 0 |
| Tiny turns (300 output tokens or fewer) | 42 requests, 61% of the charge | 40 requests, 55% of the charge |

### Run 2 by phase

| Phase | Claude CLI | opencode |
|---|---|---|
| Plan / proposal | - | 50,093 (3%) |
| Writing files | 571,563 (39%) | 784,291 (52%) |
| Checking the work | 878,155 (61%) | 681,243 (45%) |

Both harnesses spent about half or more of Run 2 after the code was already written. Every turn at that point re-reads 100k+ tokens of context, so even a short "run this check" costs about 22-25k charged.

## 3. What each harness produced

### Run 1

| | Claude CLI | opencode |
|---|---|---|
| Result | "stillroom": sage-green dark dashboard | "still": violet dark dashboard |
| Build | Passed | Failed once (a missing icon export in the latest `lucide-react`), then passed |
| Styling | One hand-written minified stylesheet, not Tailwind utilities | Same |
| Copy | Wellness-style filler ("Make room for focus") | Same style ("Find your flow") |
| Opened in a browser? | No | No |

### Run 2

| | Claude CLI | opencode |
|---|---|---|
| Sounds | Rain, ocean, fireplace, night garden (crickets), soft pad, vinyl | Rain, pad, vinyl, ocean, wind, brown noise |
| Presets | Window seat, After hours, Coastline | Rainy window, Night shift, Coastal quiet |
| Direction | Botanical "quiet room": leaf art, illustrated animated sound tiles | "Midnight studio": orbital dial, six-fader rack, zen-stones card |
| Palette | Sage green | Violet |
| Checked with | Headless browser run (mobile overflow, all six layers, presets, timer) | 4 unit tests, lint, build, review subagents |
| Bugs caught | A real pause/reset timing bug in the timer | Lint warnings in the timer hook |
| Browser run? | Yes | No |
| Stylesheet | One minified block | Readable, multi-line |
| Smallest text | About 5.5px | About 4px |
| Visible flaws | Leaf art overlaps the reset and skip buttons, dead space in sound tiles | A caption clipped at the edge of the last card |
| Extra files | None | A plan doc and a tests file |

Visual notes come from screenshots. **Sound quality is unverified for both**, because nobody has compared the two by ear.

## 4. Where the harness showed up

1. **Overhead.** Claude CLI spent about 21% of its bill on Sonnet side calls in both runs. opencode spent almost nothing on them. The main model was the same.
2. **Process.** opencode's skills pushed a loop of brainstorm, plan, tests, build, review. Claude CLI went straight to building.
3. **Verification.** Claude CLI drove a real browser and found a real bug. opencode ran tests, lint and review but never opened the page.
4. **Asking first.** opencode stopped for approval before building, which let the scope be cut before money was spent. Claude CLI didn't ask.
5. **Readable output.** opencode's Run 2 stylesheet was readable, and Claude CLI's was minified. I can't tell whether the harness or its skills caused that.

## 5. Where it didn't show up

- Both went dark and editorial, with a serif italic accent word in the headline and wellness-style copy nobody asked for.
- Both ignored the Tailwind utilities idea and wrote one big hand-written stylesheet.
- Both ended up with six sounds and three presets.
- Both ended with a note that audio needs a listening check.
- Both hit the same balance error partway through Run 2.
- Both ended up with tiny text.

Taste, structure and the habit of over-designing came from the model, not the harness.

## 6. Confounders

- **One run per harness.** This is an observation, not a benchmark.
- **The harness is bundled with other settings.** opencode ran with plan mode and the Superpowers skills, and Claude CLI ran in auto mode with a dataviz skill. I can't separate these.
- **Run 2 wasn't identical.** opencode had an approval step and a "don't be too ambitious" instruction.
- **Different scaffolding.** Claude CLI's scaffold command was blocked, so its dependency versions were hand-picked. opencode ran the real scaffold and got the latest versions, which caused its Run 1 build error.
- **opencode's total is probably a floor.** Its review subagents probably aren't in the request log.
- **The Sonnet explanation is a guess.** I think the helper calls are a permission classifier, but I haven't confirmed that.
- **No audio comparison and no controlled UI judgment.**

## 7. What I'd test next

- Run each harness at least 3 times per prompt, so there's a spread and not a single point.
- Match the settings: the same permission mode, the same skills, and the same approval step.
- Use a fresh session for Run 2, so both start from the same context.
- Add a browser check to both, so verification isn't a variable.
- Compare the audio by ear with a blind A/B.
