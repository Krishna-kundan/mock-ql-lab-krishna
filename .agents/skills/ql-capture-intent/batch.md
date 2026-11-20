# A batch of sources — read in parallel, write in serial

Reached from `/ql-capture-intent` Step 1 when the input is more than a few sources (a folder of transcripts, a week of meeting notes). Read them all in one context and it fills before the merge; lose the session halfway and the reading is gone. So the reading fans out, every result is checkpointed to disk, and the writes run one at a time from that checkpoint, so a `/clear` or a crash costs nothing.

## 1. List the sources and open a run folder

Resolve the input to a concrete source list (paths, a glob, a folder) and order it **by date**: on a conflict, a later source supersedes an earlier one (a date re-baselined twice keeps the latest; a question answered in a later meeting is answered).

Make a run folder `.launchpad/capture/<earliest>-<latest>/` (one date for a single day). First make sure `.gitignore` lists `.launchpad/capture/`, appending the line if it's missing. The folder holds working notes derived from dirty source, so it's never staged.

## 2. Fan out the reading

One read-only subagent per source, launched together, where your harness has subagents; otherwise work through the sources one at a time in this session. Each one gets its single source plus the scope digest (Step 3's command, run once and shared), and does Steps 2 and 3 for that source only: extract every candidate, then classify it. It writes `<run>/<source-key>.md` with one row per candidate (the candidate, its bucket, the target intent if any, and a provenance pointer to the source and its date, never a quote) and writes nothing else. No intent, decision, ledger or backlog edits happen here.

**Done when** every source on the list has its file in the run folder. Name any source that couldn't be read (an unsupported format, an access error) instead of skipping it.

## 3. Merge, then confirm

Read the per-source files and merge them into one candidate table: dedupe a candidate that recurs across sources into one row that cites each source, and resolve a conflict in favor of the later source. Write it to `<run>/merged.md`, then show it for Step 3's confirmation exactly as a single-source capture does. Every per-source row lands in exactly one merged row; state both counts.

## 4. Write, resumably

Run Steps 4–6 from `merged.md`, one row at a time, marking each row done in that file as its write lands. After a `/clear`, re-read `merged.md` and carry on from the first row not marked done. Step 5's "one decision file per meeting" still applies, with each record's Context naming its own source.

When every row is marked done, Step 7 reports as usual. The run folder can stay on disk for reference; it's gitignored.
