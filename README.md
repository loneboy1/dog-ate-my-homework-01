# The Dog Ate My Homework — "The Dog Ate My Homework: Funniest Excuse" (make.fun)

A deterministic excuse-writing program. It scores a pool of original
one-line excuses, written in a dog's own voice after being caught eating
the homework, against a rubric mirroring the judge's brief — a real dog's
excuse, the bigger laugh, a twist of dog logic, a dog's priorities with
none of a person's embarrassment, self-contained in one line, and
freshness — and writes the winner to `$MAKEFUN_OUTPUT_DIR/entry.txt`.

## What it does

`main.ts` (Node 22, zero dependencies, no network) scores a pool of 25
hand-written original lines — all pass validation — and picks the winner
by score, then shortest, then lexicographic. Every candidate is validated
first: one line, 1–200 characters, on subject (a dog explaining why the
homework got eaten), no flooded angles (blaming the cat, the taste of
paper, being a good boy, "it looked delicious", plain hunger). The scorer
rewards dog-law turns ("in dog law", "I followed the system"), a late
sting in the final clause, and short economical lines; it penalises
explanations and stock moves.

The winning line (56 characters):

> You left it on the floor, which in dog law is the table.

## Run it locally

```sh
MAKEFUN_OUTPUT_DIR=/tmp/dog-out node main.ts
cat /tmp/dog-out/entry.txt
```

## Files

- `main.ts` — the program (candidates, rubric scorer, deterministic pick)
- `package.json` — metadata, no dependencies
- `README.md` — this file
- `LICENSE` — MIT
