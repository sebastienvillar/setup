# Transcript folding

Ported from [luan/agents](https://github.com/luan/agents) at
`ad0bff62bc57908c833e3120085595211dbbe1ca`, package
`pi-collapse-transcript` (MIT; see LICENSE).

Fullscreen-only display projection: consecutive tool and thinking rows fold into
clickable timed summaries as soon as they appear, including in the active run.
Running sections show `Working for …` and expand to their live output. Assistant prose and native
error notices stay visible; failed tools retain a failure count and expand to
their original output. Regular terminal mode remains unchanged.

Messages, session branches, compaction, and tool results are never modified.
Timing is reconstructed from saved branch timestamps, including parallel tools.
The guarded LibTUI private-host bridge fails open on unsupported Pi layouts.
Its narrow dependency backport adds timestamps and semantic activity labels;
the local type boundary avoids pulling legacy Pi mouse types into this repo.
