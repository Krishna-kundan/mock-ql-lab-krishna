# Jobs

The canonical list of jobs the Launchpad does work in, in deal-to-delivery order, then the ones that come up any time. A job is one outcome someone needs at a moment in an engagement, whatever their title. **ADF phase or swimlane** names where the job's output is evidence: a phase's gate, or the Orchestrate swimlane, which has no gate. It never meets one; `—` for none. **Usually** names the delivery roles (ADF's names) that most often pick it up, so someone asking by title ("I'm the QA, what's mine?") gets an answer; anyone can do any job. `/ql-guide` answers from this list.

Stages: Hand off · Week zero · Build & prove · UAT · Go live · Close · Any time. Scope & sell is Scopezilla's.

| id | Job | Stage | ADF phase or swimlane | Skills | You end up with | Usually |
|---|---|---|---|---|---|---|
| take-over | Take over a scoped deal | Hand off | Internal Onboarding | ql-init-engagement, ql-setup, ql-ingest-scopezilla | An engagement repo with intents drafted from the Scopezilla project you were added to | Delivery Lead, Build Engineer lead, Engagement Architect |
| get-set-up | Join an engagement | Week zero | — | ql-setup, ql-slack-notifications-setup | The toolchain on your machine, signed in to the build org, on any harness | Everyone who builds or tests |
| customer-ready | Get the customer ready | Week zero | Align, Build, Release, Orchestrate | ql-capability-map, ql-refine-intent, ql-sync-jira | The Product Owner walked through the intents, their answers recorded, and the environments wired (the plugin adds the RAIDD log of what the customer owes) | Delivery Lead, Engagement Architect, Build Engineer lead |
| first-week | Your first week | Week zero | Internal Onboarding, Align, Build, Release | ql-init-engagement, ql-setup, ql-ingest-scopezilla, ql-start-intent, ql-verify-build, ql-capability-map | The team set up, one intent built and proven, and the customer walked through it | The whole pod |
| build | Build and prove one intent | Build & prove | Design and Model, Build | ql-start-intent, ql-check-scope, ql-vet-intent, ql-design-intent, ql-test-script, ql-drive-meshmesh, ql-diagnose, ql-verify-build | One intent built by your chosen build agent, with evidence for every proof criterion | Build Engineer, Engagement Architect (ratifies the design); Experience Strategist on UI work |
| uat | Run UAT and manual tests | UAT | Validate, Build, Orchestrate | ql-test-script, ql-record-test-execution, ql-capture-intent, ql-refine-intent | Manual proof criteria walked and recorded; UAT findings captured as intents or bundled fixes | Quality Assurance, Delivery Lead, Build Engineer lead (triages defects), Engagement Architect, the customer's testers |
| go-live | Plan the deploy | Go live | Release | ql-generate-deployment-plan | What rides the deploy and what's a manual step | Build Engineer lead, Delivery Lead |
| close | Close the engagement | Close | Adopt | ql-close-engagement | The engagement frozen as its audit record | Delivery Lead, Engagement Architect; Adoption Strategist when staffed |
| capture | Turn notes or feedback into intents | Any time | Orchestrate | ql-capture-intent, ql-refine-intent, ql-check-scope | Each item routed: a new intent, a change, a bundled fix, parked, or already covered | Engagement Architect |
| status | Report status | Any time | — | ql-delivery-metrics, ql-sync-jira | Delivery numbers and a tracker view, read from the ledger (the plugin adds status and RAIDD views) | Delivery Lead, Program Manager |
| show-the-customer | Walk the customer through scope and progress | Any time | Align, Build, Release | ql-capability-map | An offline map of the scope, release notes, and a validation pack | Engagement Architect, Delivery Lead |
| keep-current | Keep the repo current | Any time | — | ql-resync | The latest skills and engine scripts, reviewed and committed by you | Build Engineer lead |
| move-off-ps-engagement | Move off ps-engagement | Any time | — | ql-init-engagement | An engagement repo carrying over what the old one had | Build Engineer lead |

`ql-init-engagement` and `ql-resync` run from the Launchpad plugin (Claude Code or Cursor). A teammate joining an existing repo runs `ql-setup` on any harness. Two skills are conditional, so name them only when they apply: `ql-slack-notifications-setup` when the repo has the Slack notifications add-on, and `ql-drive-meshmesh` when MeshMesh is the build agent.
