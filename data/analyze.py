#!/usr/bin/env python3
"""Rebuild the numbers from the post out of the four CSVs.

Usage:  python3 data/analyze.py
Needs only the Python standard library.
"""
import csv
from pathlib import Path

HERE = Path(__file__).parent
FILES = {
    ("Claude CLI", "Run 1"): "claude-cli-run1.csv",
    ("Claude CLI", "Run 2"): "claude-cli-run2.csv",
    ("opencode", "Run 1"): "opencode-run1.csv",
    ("opencode", "Run 2"): "opencode-run2.csv",
}
# multiplier per model (see weights.md). Cache reads are flat 0.1 for every model.
MULT = {"claude-opus-5-5": 2, "claude-sonnet-5": 1, "claude-sonnet-5-5": 1}
CACHE_READ_WEIGHT = 0.1

# Time windows (HH:MM:SS) used to split Run 2 into phases. Edit if you re-cut them.
PHASES = {
    ("Claude CLI", "Run 2"): [
        ("Build (write files)", "16:30:10", "16:35:32"),
        ("Verification", "16:39:08", "16:43:20"),
        ("Resume + re-check", "16:53:51", "16:59:43"),
    ],
    ("opencode", "Run 2"): [
        ("Plan / proposal", "16:13:54", "16:14:08"),
        ("Writing files (before the balance error)", "16:16:43", "16:26:21"),
        ("Writing files (after resume)", "16:31:22", "16:32:50"),
        ("Review / test / lint / build", "16:38:14", "16:47:24"),
    ],
}


def load(name):
    rows = []
    with open(HERE / name, newline="") as f:
        for r in csv.DictReader(f):
            rows.append({
                "time": r["time"].split()[1],
                "model": r["model"],
                "input": int(r["input"]),
                "output": int(r["output"]),
                "read": int(r["cache_read"]),
                "write": int(r["cache_write"]),
                "charged": int(r["charged"]),
            })
    return rows


def parts(r):
    """Charged units split by token type, using the fitted weights."""
    m = MULT[r["model"]]
    return {
        "input": r["input"] * m,
        "output": r["output"] * 5 * m,
        "cache write": r["write"] * 1.25 * m,
        "cache read": r["read"] * CACHE_READ_WEIGHT,
    }


def is_sonnet(r):
    return "sonnet" in r["model"]


def pct(a, b):
    return f"{100 * a / b:.0f}%" if b else "0%"


def report(harness, run, rows):
    total = sum(r["charged"] for r in rows)
    split = {k: 0.0 for k in ("input", "output", "cache write", "cache read")}
    worst = 0.0
    for r in rows:
        p = parts(r)
        worst = max(worst, abs(sum(p.values()) - r["charged"]))
        for k, v in p.items():
            split[k] += v
    sonnet = [r for r in rows if is_sonnet(r)]
    sonnet_cost = sum(r["charged"] for r in sonnet)
    cold = [r for r in rows if r["read"] == 0]
    ctx = sum(r["input"] + r["read"] + r["write"] for r in rows) / len(rows)

    print(f"\n{harness} - {run}")
    print(f"  requests            {len(rows)}")
    print(f"  charged             {total:,}   ({total / len(rows):,.0f} per request)")
    print("  split               " + ", ".join(f"{k} {pct(v, total)}" for k, v in split.items()))
    print(f"  raw output tokens   {sum(r['output'] for r in rows):,}")
    print(f"  Sonnet helper       {len(sonnet)} requests, {sonnet_cost:,} ({pct(sonnet_cost, total)})")
    print(f"  cold-cache requests {len(cold)} (zero cache reads), {sum(r['charged'] for r in cold):,}")
    print(f"  avg context/request {ctx:,.0f} tokens")
    print(f"  formula check       largest difference {worst:.2f} units (rounding)")

    phases = PHASES.get((harness, run))
    if phases:
        print("  phases:")
        for label, a, b in phases:
            sel = [r for r in rows if a <= r["time"] <= b]
            c = sum(r["charged"] for r in sel)
            print(f"    {label:<42} {len(sel):>3} requests  {c:>9,}  ({pct(c, total)})")
    return total


def main():
    totals = {}
    for (harness, run), name in FILES.items():
        totals[(harness, run)] = report(harness, run, load(name))

    print("\nTotals")
    cli = totals[("Claude CLI", "Run 1")] + totals[("Claude CLI", "Run 2")]
    oc = totals[("opencode", "Run 1")] + totals[("opencode", "Run 2")]
    print(f"  Claude CLI  {cli:,}")
    print(f"  opencode    {oc:,}   ({100 * (oc - cli) / cli:+.0f}% vs Claude CLI)")
    for run in ("Run 1", "Run 2"):
        a, b = totals[("Claude CLI", run)], totals[("opencode", run)]
        print(f"  {run}: opencode is {b / a:.2f}x the Claude CLI cost")


if __name__ == "__main__":
    main()
