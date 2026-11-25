# Does the harness matter?

The same model, the same API provider and the same two prompts, run through two different harnesses: **Claude CLI** and **opencode**. This repo holds both sets of output, the raw request data, and the scripts to check the numbers.

Write-up: [Blog Page](https://sayannnd.github.io/About-Me/blog/post.html?slug=harness)

## The question

Everyone compares models. Few people compare the program wrapped around them, which decides what tools the model gets, what runs before and after each step, when it asks permission and how much it checks its own work.

Both runs used **Claude Opus 5.5**. If the output differs, the harness is the likeliest reason (with the caveats below).

## Headline result

Cost is measured in the provider's "Charged" units (a weighted token count, see [`data/weights.md`](data/weights.md)).

| | Claude CLI | opencode |
|---|---|---|
| Run 1: requests / charged | 38 / 943,292 | 30 / **445,912** |
| Run 2: requests / charged | 57 / 1,449,718 | 55 / 1,515,627 |
| **Total charged** | 2,393,010 | **1,961,539** (-18%) |
| Sonnet helper calls | ~21% of the bill in both runs | almost none |
| How it checked its work | Headless browser run (found a real timer bug) | Unit tests, lint, review subagents (no browser run) |

The short version: the harness mattered for overhead, process and verification, and did not matter for taste. Both results look like the same model made them. The full discussion is in the blog post.

## What's in this repo

```
harness-experiment/
├── README.md
├── LICENSE
├── .gitignore
├── prompts/
│   ├── run1-build.md          # the exact prompts, verbatim
│   └── run2-redesign.md
├── claude-cli/
│   ├── run1/                  # app after prompt 1
│   └── run2/                  # app after prompt 2
├── opencode/
│   ├── run1/
│   └── run2/                  # includes the plan doc and tests it wrote
├── data/
│   ├── claude-cli-run1.csv    # one row per API request
│   ├── claude-cli-run2.csv
│   ├── opencode-run1.csv
│   ├── opencode-run2.csv
│   ├── weights.md             # provider multipliers and the fitted formula
│   ├── analyze.py             # rebuilds the tables above from the CSVs
│   └── NOTES.md
└── results/
    └── SUMMARY.md             # comparison tables and the list of confounders
```

<!-- If a run's source wasn't preserved (Run 2 edited Run 1 in place), delete that folder from the tree above and say so here. -->

## Running an app

Each run is a standalone Vite + React + TypeScript app:

```bash
cd claude-cli      # or any other run folder
npm install
npm run dev
```

Node 20 or newer is recommended. Audio starts only after you click something, because browsers block autoplay. Neither result has been fully tested by ear, so treat sound quality as unverified.

## Reproducing the numbers

```bash
python3 data/analyze.py
```

It reads the four CSVs and prints per-run totals, the split by token type, and the helper-model share. The CSV columns are:

| Column | Meaning |
|---|---|
| `time` | Request timestamp |
| `model` | Model that served the request |
| `input` | Uncached input tokens |
| `output` | Output tokens |
| `cache_read` | Tokens read from the prompt cache |
| `cache_write` | Tokens written to the prompt cache |
| `charged` | The provider's weighted total |

## Method

The provider reports one "Charged" number per request. The weights below were fitted against the provider's published multipliers and reproduce every row to within 0.5 units:

| | Input | Output | Cache write | Cache read |
|---|---|---|---|---|
| Sonnet 5 (x1) | 1 | 5 | 1.25 | 0.1 |
| Opus 5.5 (x2) | 2 | 10 | 2.5 | 0.1 |

## Caveats

- **The harness is bundled with other things.** opencode ran with plan mode and a set of Superpowers skills, and Claude CLI ran in auto mode. I can't separate the harness from those settings.
- **Run 2 wasn't perfectly identical.** The opencode run had an approval step and was told "don't be too ambitious". The Claude CLI run had no such step.
- **opencode's total is probably a floor.** Its review subagents likely aren't in the request log.
