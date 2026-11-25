# Production stage and sandbox credentials (ptsf-lab/INT-009)

Engagement-owned. These three workflows aren't part of the `deploy-multistage` add-on, so `/ql-resync` never touches this file. The CI and TEST stages are in `README.md`.

| Workflow | Trigger | GitHub Environment | What it does |
|---|---|---|---|
| `main_pr-validation.yml` | A PR into `main` | `Production-Validate` | Check-only validation against production. Deploys nothing. |
| `prod_deploy.yml` | Manual run only (`workflow_dispatch`) | `Production` | Deploys everything in `main` to production after the required reviewer approves. |
| `credentials_reestablish.yml` | Manual run only | `CI` or `TEST` | Writes External Credential secrets into a refreshed sandbox. |

## Production environments

Production has two GitHub Environments, both holding production's login:

- **`Production`** has the Trusted Guide as **required reviewer**. Only `prod_deploy.yml` uses it, so every production deploy waits for approval.
- **`Production-Validate`** has **no reviewer**. Only `main_pr-validation.yml` uses it. A required reviewer gates every job in its environment, so validating in `Production` would need an approval on every PR. ⚠ That GitHub behaviour is unverified: the GitHub docs weren't read.

### Setup

1. **Settings → Environments → New environment**, name it **Production**.
2. Under **Deployment protection rules**, tick **Required reviewers** and add the Trusted Guide.
3. **Add environment secret** `SFDX_URL`: log in to production with the sf CLI, run `sf org auth show-sfdx-auth-url --target-org <production alias>` and paste the `force://` URL.
4. Optionally add the variable **TEST_LEVEL** (same values as on CI; unset means RunLocalTests).
5. Create a second environment, **Production-Validate**, with the same `SFDX_URL` secret and `TEST_LEVEL`, and **no** reviewer.

When the production login is re-issued, update the secret in **both** environments.

**Test coverage against production:** with RunLocalTests, production validation enforces 75% coverage across every unmanaged Apex class in the org, including Apex that isn't in this repo. See "Simple pipeline" in `README.md` for the TEST_LEVEL trade-offs; they apply here too.

## main_pr-validation

Runs on every PR into `main`, using the shared `.github/actions/multistage/action.yml` in `validate` mode, the same steps as the CI and TEST PR validations:

- Skips the Salesforce steps when the PR changes no deployable metadata. The job still reports green.
- Builds the delta from the PR branch's merge-base with `main`.
- Runs Code Analyzer and fails the check on a severity 2 (High) or worse violation.
- Runs a dry-run deploy (`--dry-run`) against production. Nothing is deployed.

## prod_deploy

The only workflow that deploys to production, and the only one that uses the `Production` environment.

- **Manual only.** Start it from **Actions → prod_deploy → Run workflow**. No push or merge starts it.
- **`main` only.** A run started from any other branch skips the job.
- **One at a time.** `concurrency: prod-deploy` queues a second run behind the first instead of cancelling it.
- **Waits for approval.** The run sits at "Waiting for review" until the `Production` reviewer approves it.
- **Full build.** It deploys every package directory in `main`, not a delta. A manual run has no push range, so a delta would cover only the last commit.

Release order: the customer signs off on the release, the Trusted Guide merges the `release/*` → `main` PR, then the Trusted Guide runs `prod_deploy.yml` and approves it.

## Code Analyzer report

Every PR validation run (into `develop`, `release/*` and `main`) uploads the scan report as an HTML artifact named `code-analyzer-<environment>`, for example `code-analyzer-Production-Validate`. Download it from the run's **Summary** page. It's uploaded when the scan fails the check too. ⚠ Whether the report file is still written when the severity threshold fails is unverified until the first failing run.

This upload step is a local edit to the add-on's `action.yml`, so `/ql-resync` shows that file as a local diff.

## credentials_reestablish

A sandbox refresh copies production's External Credential definitions but not the secrets in their principals. This workflow writes them back from GitHub, so nobody types a secret into the org.

- **Manual only**, for one environment at a time: `CI` or `TEST`.
- **Sandboxes only.** It refuses to write unless `Organization.IsSandbox` is true in the target org.
- Does nothing (and reports a notice) when `config/credentials.json` is an empty list.

Run it straight after the sandbox is activated and its `SFDX_URL` re-issued. The full order is in `launchpad/deploy-runbook.md` → "After every sandbox refresh".

### config/credentials.json (in the repo, no secrets)

A JSON array, one entry per External Credential principal. Names only:

```json
[
  { "credential": "<ExternalCredentialDeveloperName>", "principal": "<PrincipalName>", "principalType": "NamedPrincipal" }
]
```

`principalType` is the principal's type as the Connect REST API names it (`NamedPrincipal`, `PerUserPrincipal`, `AwsStsPrincipal`).

### EXTERNAL_CREDENTIAL_SECRETS (a secret on each sandbox's environment)

One secret per environment holding a JSON object. Each key is `<credential>/<principal>`, matching an entry in `config/credentials.json`. Each value is the `credentials` object the workflow sends as-is to `POST /services/data/v<api>/named-credentials/credential/`: parameter names mapped to `{ "value", "encrypted" }`.

```json
{
  "<ExternalCredentialDeveloperName>/<PrincipalName>": {
    "<parameterName>": { "value": "<value>", "encrypted": false },
    "<secretParameterName>": { "value": "<secret value>", "encrypted": true }
  }
}
```

The parameter names depend on the credential's authentication protocol, for example `clientId` and `clientSecret` for OAuth client credentials, `username` and `password` for Basic, or your own header names for Custom. The full list per protocol: [docs:https://developer.salesforce.com/docs/platform/named-credentials/guide/nc-populate-external-credentials.html]. Set `encrypted: true` on every secret value.

Editing the secret means pasting the whole object again. One malformed secret fails every credential in that run.

⚠ Unverified until the first run: whether this POST succeeds on a principal that already has values, and the `sf org display --json` field names the workflow reads.
