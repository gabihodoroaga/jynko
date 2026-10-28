---
name: jynko-ui-validator
description: Automates end-to-end UI validation, interactive DOM assertions, and full-page screenshot capture for the Jynko Angular frontend using Go-Rod (github.com/go-rod/rod). Use whenever verifying UI changes, running or updating E2E tests in backend/internal/e2e/, taking screenshots of routes or interactive states, or validating Jynko's architectural and design invariants.
---

# Jynko UI E2E Validator Skill (`github.com/go-rod/rod`)

This workspace skill enables any agent, developer session, or CI/CD pipeline to validate the **Jynko** application by running the Angular frontend, driving a headless Chrome browser via **`github.com/go-rod/rod`** (`backend/internal/e2e/`), asserting DOM invariants, interacting with UI controls (custom dropdowns, modals, view switchers, Wiki tree, Stickies), and capturing high-resolution screenshots.

---

## Key Repository Files

- `backend/internal/e2e/validator.go`: Canonical E2E check definitions (`DefaultChecks()`), browser launcher (`LaunchBrowser()`), and report generator (`RunSuite()`).
- `backend/internal/e2e/ui_e2e_test.go`: Standard `go test` E2E test suite (`TestJynkoUIEndToEnd`) that runs each check as a `t.Run(...)` subtest.
- `backend/cmd/ui-validator/main.go`: Standalone CLI wrapper around `internal/e2e`.
- `scripts/run-e2e.sh`: Self-contained local & CI/CD runner script that auto-starts the Angular server on `:4200` if not already running, runs `go test -v ./internal/e2e/...`, and cleans up the server on exit.
- `.github/workflows/e2e.yml`: GitHub Actions CI/CD workflow that builds both frontend and backend, executes `./scripts/run-e2e.sh`, and uploads the screenshots + `report.json` as workflow artifacts.

---

## Quick Start Workflow

### Option A: One-Command E2E Runner (Local & CI/CD)

Run `./scripts/run-e2e.sh` from the repository root. It automatically checks whether `http://localhost:4200` is listening, starts the Angular dev server in the background if needed, runs the `go test` E2E suite, and writes screenshots + `report.json` to the output directory:

```bash
./scripts/run-e2e.sh /tmp/jynko-screenshots
```

*(Note: In the Antigravity sandbox, starting Angular CLI or connecting `go-rod` to headless Chrome over loopback sockets requires `BypassSandbox: true` if sandboxed execution fails.)*

### Option B: Run via `go test` Against an Already-Running Frontend

If `http://localhost:4200` is already running:

```bash
JYNKO_E2E=1 JYNKO_E2E_OUT_DIR=/tmp/jynko-screenshots go -C backend test -v -count=1 ./internal/e2e/...
```

---

## Inspecting the Report and Screenshots

Each run outputs:
1. **`report.json`** in `OUT_DIR`: Structured pass/fail status, elapsed timing, assertion details, and screenshot file paths for every check.
2. **Screenshots (`*.png`)** in `OUT_DIR`:
   - `01-home-overview.png` — Cross-project Home overview (`hodo`, `cloud-infra`), top-left `Jynko` icon (no caret), `Work` sidebar without `Drafts`, and `+` button at root of `Projects`.
   - `02-my-work-dropdown-open.png` — Cross-project `My Work` (`HODO-1`, `CLD-1`) with the custom `<app-dropdown>` (`[role="listbox"]`) open on screen.
   - `03-projects-create-modal.png` — `Project Overview` (confirming no header `+ New Project` button) with the `Create New Project` modal opened by clicking `button[aria-label="Create new project"]` in the left panel.
   - `04-work-items-board.png` — `Work Items` view switcher (`List`, `Board`, `Calendar`, `Timeline`, `Spreadsheet`) with styled filter dropdowns.
   - `05-wiki-section.png` — `Wiki` section showing `Collections -> General -> Pages` tree in the left secondary panel and the `Welcome to Company's Wiki` editor on the right.
   - `06-stickies-board.png` — `Stickies` canvas with color filters and `+ New sticky` composer button.

Use `read_file` on the generated `.png` files to visually inspect the rendered UI, or copy them into the conversation's artifact directory (`<appDataDir>/brain/<conversation-id>/`) to embed in markdown artifacts.

---

## Mandatory Rule: Always Update E2E Tests When Modifying the UI

Whenever you add, modify, or remove a UI feature, route, or component:
1. Read [references/selectors-and-routes.md](references/selectors-and-routes.md) for the canonical route table, `aria-label` hooks, and design invariants.
2. Update the existing `Check*` function or register a new `CheckSpec` in `DefaultChecks()` inside `backend/internal/e2e/validator.go`.
3. Update [references/selectors-and-routes.md](references/selectors-and-routes.md) with any new routes or `aria-label` selectors.
4. Run `./scripts/run-e2e.sh` and confirm all subtests in `TestJynkoUIEndToEnd` pass.
