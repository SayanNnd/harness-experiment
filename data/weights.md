# Weights

The provider reports one **Charged** number per API request. It is a weighted token count, not raw tokens and not dollars.

## Formula

```
charged = multiplier * (input + 5 * output + 1.25 * cache_write) + 0.1 * cache_read
```

`cache_read` is flat at 0.1 per token for every model. It does not get the model multiplier.

## Per-model weights

| Model | Multiplier | Input | Output | Cache write | Cache read |
|---|---|---|---|---|---|
| `claude-sonnet-5` | x1 | 1 | 5 | 1.25 | 0.1 |
| `claude-sonnet-5-5` | x1 (fitted, see below) | 1 | 5 | 1.25 | 0.1 |
| `claude-opus-5-5` | x2 | 2 | 10 | 2.5 | 0.1 |

## The provider's multiplier table

Copied from the provider's "What a request costs" screen (input multiplier at standard context):

| Model | Multiplier |
|---|---|
| Claude Sonnet 5 | x1 |
| Claude Sonnet 4.6 | x1.5 |
| Claude Opus 5.5 | x2 |
| Claude Opus 5 | x2.5 |
| Claude Opus 4.6 / 4.7 / 4.8 | x2.5 |
| Claude Fable 5 / 5.1 (and the 1M variants) | x5 |

`claude-sonnet-5-5` is not on that screen. Two of its rows fit x1 exactly, so I used x1.

## Worked examples

Opus 5.5 row (input 3,844, output 66, cache read 122,348, cache write 247):

```
3,844*2 + 66*10 + 247*2.5 + 122,348*0.1 = 7,688 + 660 + 617.5 + 12,234.8 = 21,200.3  ->  charged 21,200
```

Sonnet 5 row (input 16,294, output 69, cache read 0, cache write 86,700):

```
16,294 + 69*5 + 86,700*1.25 = 16,294 + 345 + 108,375 = 125,014  ->  charged 125,014
```

`claude-sonnet-5-5` row (input 303, output 13, cache write 1,589):

```
303 + 13*5 + 1,589*1.25 = 303 + 65 + 1,986.25 = 2,354.25  ->  charged 2,354
```

## How it was fitted

I solved for the weights on a few rows, then checked them against every row in all four CSVs. The largest difference between the formula and the reported number is **0.5 units** (rounding), so the formula reproduces every row. `analyze.py` repeats that check each time it runs.

## What this does not tell you

- **Dollars.** One charged unit looks like one Sonnet input token, but I don't know the provider's price per unit. Use the provider's console for real money.
- **Thinking vs code.** Output tokens include reasoning. The log doesn't split them.
