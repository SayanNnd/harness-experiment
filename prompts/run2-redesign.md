# Run 2: the redesign

The second prompt, sent to each harness in the same session as Run 1, so the model already had the first app and its conversation as context. It is deliberately short and vague. It asks for a better look and better sounds, without saying what better means.

````text
go a bit more creative and non generic with the ui, make it more expressive, unique and animative while having the vibe that we are trying to go for, and add more sound options while improving/changing the current ones because the rain and deep drone does not sound very good
````

Both runs used this exact text (lowercase and all).

## Follow-up messages

The runs weren't identical after the first message, which matters when you compare them.

**Claude CLI.** The model started building straight away, with no question asked. The only follow-up was after a balance error stopped the run mid-way, when I typed a (typo'd) nudge to resume:

````text
continue the last prompt fro
````

**opencode.** The model stopped first and proposed a direction (a "midnight listening studio" with six sound layers and three one-click mixes), then asked whether to build it. My friend replied:

````text
sure i give you full creative control however dont be too ambitious and do whatever the best you can possibly do
````

The same balance error hit his run later, and he resumed with:

````text
continue
````

## Why this matters

The opencode run had an extra approval round and a message that told it to limit its scope. The Claude CLI run had neither. So the two Run 2 results differ in scope instructions as well as in harness. See the confounders in [`results/SUMMARY.md`](../results/SUMMARY.md).
