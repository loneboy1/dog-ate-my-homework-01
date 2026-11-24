// Dog-ate-my-homework excuse writer for "The Dog Ate My Homework:
// Funniest Excuse" (make.fun). Writes a single excuse line to
// $MAKEFUN_OUTPUT_DIR/entry.txt.
// Deterministic: no clock, no randomness, no network, no unordered
// iteration. Node 22, zero dependencies, erasable TypeScript only.
//
// The judge (a stand-up comic who has heard every dog excuse) weighs,
// most important first:
//   1. really an excuse a dog gives after being caught eating the
//      homework, in the dog's own voice;
//   2. the bigger laugh, with a twist or a piece of dog logic;
//   3. sounds like a real dog, with a dog's priorities and none of a
//      person's embarrassment;
//   4. works on its own, no setup, nothing needing a second line;
//   5. feels fresh, not a stock line about the cat, the taste of paper,
//      or being a good boy.
// The scorer below mirrors that brief in the same order. Each candidate
// carries its rubric sub-scores (fit /20, funny /20, dog logic /20,
// dog voice /15, tight /15), scored by hand against the brief; the
// program adds the length bonus (+3 at 110 chars or fewer, +1 at 140 or
// fewer) and picks the winner by deterministic argmax: highest score,
// then shortest, then lexicographic.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------- candidates
// Every line is one sentence of at most 160 characters, written for this
// entry. The strongest lines share one shape: the dog states a piece of
// dog law or dog logic as if it were obvious, then the final clause
// makes the eating of the homework the only reasonable outcome. Flooded
// angles the field is already drowning in are left out entirely: blaming
// the cat, the taste of paper, being a good boy, "it looked delicious",
// plain hunger, and the teacher never believing it.

interface Rubric {
  fit: number; // /20 — a dog's excuse after being caught eating homework
  funny: number; // /20 — a real joke on first read
  dogLogic: number; // /20 — a twist or piece of dog logic
  dogVoice: number; // /15 — a dog's priorities, no human embarrassment
  tight: number; // /15 — lands fast, every word earning its place
}

interface Scored {
  text: string;
  rubric: Rubric;
}

const CANDIDATES: Scored[] = [
  // Dog law: the floor is the table. The dog did nothing wrong; the
  // homework was simply served in the wrong place.
  {
    text: "You left it on the floor, which in dog law is the table.",
    rubric: { fit: 20, funny: 19, dogLogic: 20, dogVoice: 15, tight: 15 },
  },
  // The dog as grader: it checked the answers, and they were not worth
  // saving. The insult lands in the final clause.
  {
    text: "I was only checking if your answers were right, and frankly, they were not worth saving.",
    rubric: { fit: 19, funny: 19, dogLogic: 18, dogVoice: 14, tight: 13 },
  },
  // The rules as taught: sit was taught, "do not eat the homework" was
  // not. The dog obeyed everything it was actually told.
  {
    text: "You taught me to sit, not to leave homework alone, so I sat on it and then I ate it.",
    rubric: { fit: 19, funny: 18, dogLogic: 18, dogVoice: 15, tight: 13 },
  },
  // The homework next to the bowl: the dog followed the system, and the
  // system is where food goes.
  {
    text: "You left the homework next to my bowl, which is where food goes, so I followed the system.",
    rubric: { fit: 19, funny: 17, dogLogic: 18, dogVoice: 14, tight: 13 },
  },
  // Question six: the dog ate the homework as a rescue mission, and
  // expects thanks.
  {
    text: "I ate it to protect you from question six. You are welcome.",
    rubric: { fit: 18, funny: 18, dogLogic: 17, dogVoice: 14, tight: 15 },
  },
  // Show your working: the homework asked, and the dog showed its work
  // in the only medium it has.
  {
    text: "The homework said show your working, so I showed mine.",
    rubric: { fit: 18, funny: 17, dogLogic: 17, dogVoice: 13, tight: 15 },
  },
  // The homework was due today, and the dog has never seen its human do
  // anything due today, so it helped.
  {
    text: "It was due today, and I have never once seen you do anything due today, so I helped.",
    rubric: { fit: 18, funny: 17, dogLogic: 17, dogVoice: 13, tight: 13 },
  },
  // The quietest thing in the house: the dog assumed a toy, because
  // toys are quiet things bought for dogs.
  {
    text: "It was the quietest thing in the house, so I assumed it was a toy you bought me.",
    rubric: { fit: 18, funny: 16, dogLogic: 17, dogVoice: 14, tight: 13 },
  },
  // The pencil did it: the dog was merely the teeth. Blame displaced
  // onto the nearest inanimate object.
  {
    text: "The pencil did it. I was merely the teeth.",
    rubric: { fit: 17, funny: 18, dogLogic: 16, dogVoice: 13, tight: 15 },
  },
  // Homework is a stick you are not allowed to fetch: the dog has
  // questions about that rule.
  {
    text: "Homework is just a stick you are not allowed to fetch, and I have questions about that rule.",
    rubric: { fit: 18, funny: 16, dogLogic: 17, dogVoice: 15, tight: 12 },
  },
  // The margin joke: the human wrote the excuse as a joke, so the dog
  // made it true for accuracy.
  {
    text: "You wrote the dog ate my homework as a joke in the margin, so I made it true for accuracy.",
    rubric: { fit: 18, funny: 17, dogLogic: 16, dogVoice: 12, tight: 12 },
  },
  // Settling debts: the human stares at the homework like it owes money,
  // and the dog settles debts.
  {
    text: "You stare at it every night like it owes you money, and I settle debts.",
    rubric: { fit: 17, funny: 17, dogLogic: 16, dogVoice: 13, tight: 14 },
  },
  // The teacher asked for it by name, and the dog thought she meant it.
  {
    text: "Your teacher asked for it by name, and I thought she meant me.",
    rubric: { fit: 17, funny: 16, dogLogic: 16, dogVoice: 13, tight: 14 },
  },
  // The smell of trying: the first thing the human brought home that
  // smelled like effort, so the dog kept it. Inside.
  {
    text: "It was the first thing you ever brought home that smelled like you trying, so I kept it. Inside me.",
    rubric: { fit: 17, funny: 16, dogLogic: 15, dogVoice: 14, tight: 12 },
  },
  // Self-defence: the homework ate the dog's attention first.
  {
    text: "The homework ate my attention first. I was defending myself.",
    rubric: { fit: 17, funny: 16, dogLogic: 16, dogVoice: 12, tight: 14 },
  },
  // The disagreement: whose homework it was, settled the dog way.
  {
    text: "The homework and I had a disagreement about whose it was. I won, obviously. I am the one still here.",
    rubric: { fit: 17, funny: 15, dogLogic: 15, dogVoice: 13, tight: 11 },
  },
  // Reading practice: the homework volunteered for the day the human
  // finally teaches the dog to read.
  {
    text: "I was practising for the day you finally teach me to read, and the homework volunteered.",
    rubric: { fit: 17, funny: 15, dogLogic: 15, dogVoice: 13, tight: 12 },
  },
  // The dog next door: the neighbour's dog said the maths was wrong,
  // and the dog could not let that stand.
  {
    text: "The dog next door said your maths was wrong, and I could not let that stand.",
    rubric: { fit: 16, funny: 16, dogLogic: 15, dogVoice: 13, tight: 13 },
  },
  // The park smell: the homework smelled like the park, so the dog
  // brought the park home the only way it knows how.
  {
    text: "It smelled like the park, so I brought the park home the only way I know how.",
    rubric: { fit: 16, funny: 14, dogLogic: 15, dogVoice: 14, tight: 12 },
  },
  // The shoes or the homework: the homework had been asking for it all
  // week, and the dog chose mercy for the shoes.
  {
    text: "It was either the homework or your shoes, and the homework had been asking for it all week.",
    rubric: { fit: 16, funny: 15, dogLogic: 15, dogVoice: 13, tight: 12 },
  },
  // A love letter to the bin: the handwriting gave it away.
  {
    text: "It had your handwriting on it, which is how I knew it was a love letter to the bin.",
    rubric: { fit: 15, funny: 15, dogLogic: 15, dogVoice: 12, tight: 12 },
  },
  // The sit that obeyed the wrong thing: the homework was the only thing
  // sitting still, so the dog obeyed it instead.
  {
    text: "You told me to sit, and the homework was the only thing sitting still, so I obeyed it instead.",
    rubric: { fit: 17, funny: 15, dogLogic: 16, dogVoice: 13, tight: 11 },
  },
  // Translation: the dog translated the homework into a language the
  // floor understands.
  {
    text: "I did not eat it. I translated it into a language the floor understands.",
    rubric: { fit: 16, funny: 15, dogLogic: 15, dogVoice: 12, tight: 12 },
  },
  // The name on the pages: the dog only ate the pages with its own name
  // on them. The rest was the human's.
  {
    text: "I only ate the pages with my name on them. The rest was yours.",
    rubric: { fit: 16, funny: 15, dogLogic: 14, dogVoice: 12, tight: 13 },
  },
  // The stick that is not a stick, revisited as a filing system: the dog
  // filed it under things that smelled like effort.
  {
    text: "I did not eat your homework. I filed it under things that smelled like effort.",
    rubric: { fit: 16, funny: 14, dogLogic: 14, dogVoice: 12, tight: 12 },
  },
];

// ---------------------------------------------------------------- scoring
function score(c: Scored): number {
  const r = c.rubric;
  const base = r.fit + r.funny + r.dogLogic + r.dogVoice + r.tight;
  const len = c.text.length;
  const bonus = len <= 110 ? 3 : len <= 140 ? 1 : 0;
  return base + bonus;
}

function valid(text: string): boolean {
  // Gate: UTF-8 text of 1 to 200 characters, not only white space, one line.
  return (
    text.length >= 1 &&
    text.length <= 200 &&
    text.trim().length > 0 &&
    !text.includes("\n")
  );
}

function pick(): Scored {
  const pool = CANDIDATES.filter((c) => valid(c.text));
  if (pool.length === 0) throw new Error("no valid candidate");
  let best = pool[0];
  for (const c of pool.slice(1)) {
    const a = score(c);
    const b = score(best);
    if (
      a > b ||
      (a === b && c.text.length < best.text.length) ||
      (a === b && c.text.length === best.text.length && c.text < best.text)
    ) {
      best = c;
    }
  }
  return best;
}

// ---------------------------------------------------------------- entrypoint
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "output";
mkdirSync(outDir, { recursive: true });
const winner = pick();
writeFileSync(join(outDir, "entry.txt"), winner.text, "utf8");
console.log(`winner (${winner.text.length} chars, score ${score(winner)}): ${winner.text}`);
