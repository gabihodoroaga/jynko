#!/usr/bin/env bash
set -euo pipefail

# Jynko Go-Rod UI Validator Skill Runner (delegates to repo-level scripts/run-e2e.sh)
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
exec "${REPO_ROOT}/scripts/run-e2e.sh" "$@"
