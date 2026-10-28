# Jynko — Open-Source Project Management & Knowledge Platform

**Jynko** is a high-performance, open-source project management and wiki platform. It combines structured project tracking (Work Items across 5 views, Sub-Items, Cycles, Epics, Modules, Labels, Stickies, and Comments) with a hierarchical Markdown Block Wiki.

---

## Architecture Highlights

- **No Workspaces**: `Project` (`projects/{projectId}`) is the top-level tenant, permission boundary, and Firestore root collection.
- **Google Cloud IAP / OIDC Authentication**: Validates `X-Goog-Authenticated-User-Id` and `X-Goog-Authenticated-User-Email` headers (with a configurable `ENV=development` local identity switcher).
- **Live GCP Firestore Persistence**: Direct connection to Google Cloud Firestore (`cloud.google.com/go/firestore`) with atomic transaction sequence generation (`JYNKO-1`, `JYNKO-2`).
- **Per-Project RBAC (`ADMIN`, `MEMBER`, `VIEWER`)**: Enforced across all project routes and Wiki pages.
- **Light Mode UI (`slate-50`)**: Built with Angular 18+ Standalone Components, Angular Signals, Angular CDK Drag-and-Drop, and Tailwind CSS.
- **All 5 Work Item Views**:
  1. **List** (Grouped high-density rows)
  2. **Board** (Kanban drag-and-drop columns)
  3. **Calendar** (Monthly due/start date schedule grid)
  4. **Timeline** (Gantt duration bars by Epic)
  5. **Spreadsheet** (Inline-editable tabular grid)
- **Markdown Block Wiki**: Nested page trees, page collections, `/` slash commands (`/h1`, `/h2`, `/todo`, `/code`, `/quote`, `/divider`), page locking, and immutable `PageVersion` revision history.

---

## Quick Start

### 1. Backend (`/backend`)

```bash
cd backend
cp .env.example .env
# Edit .env with your GOOGLE_CLOUD_PROJECT
go mod tidy
go test ./...
go run ./cmd/server/main.go
```

### 2. Frontend (`/frontend`)

```bash
cd frontend
npm install
npm run start
```

Open `http://localhost:4200` in your browser.

---

## Documentation

- [Architecture Specification (`docs/ARCHITECTURE.md`)](./docs/ARCHITECTURE.md)
- [AI Coding Agent Guide (`AGENTS.md`)](./AGENTS.md)
