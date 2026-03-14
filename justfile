# DizzyResume justfile
# Requires: just (https://github.com/casey/just)
#           pnpm >= 9.0.0

# Show available recipes
default:
    @just --list

# ── Installation ──────────────────────────────────────────────────────────────

# Install Linux system dependencies required by Tauri (run once, needs sudo)
[unix]
install-sys-deps:
    sudo apt-get install -y \
        libwebkit2gtk-4.1-dev \
        libgtk-3-dev \
        libayatana-appindicator3-dev \
        librsvg2-dev

# Check Windows Tauri prerequisites (WebView2, MSVC, Rust)
[windows]
install-sys-deps:
    @echo "Windows Tauri prerequisites:"
    @echo "  1. WebView2 — pre-installed on Windows 10 (1803+) and Windows 11"
    @echo "     If missing: https://developer.microsoft.com/en-us/microsoft-edge/webview2/"
    @echo "  2. MSVC Build Tools — install via Visual Studio Installer (C++ workload)"
    @echo "     Or: winget install Microsoft.VisualStudio.2022.BuildTools"
    @echo "  3. Rust — already installed if 'rustc --version' works"
    @echo "     If missing: winget install Rustlang.Rust.MSVC"

# Install all workspace dependencies
install:
    pnpm install

# Install dependencies for a specific package (e.g. just add ra lucide-react)
add package dep:
    pnpm --filter @dizzy-resume/{{package}} add {{dep}}

# Install a dev dependency for a specific package
add-dev package dep:
    pnpm --filter @dizzy-resume/{{package}} add -D {{dep}}

# ── Development ───────────────────────────────────────────────────────────────

# Run the full Tauri desktop app (Ra) in dev mode
dev:
    pnpm --filter @dizzy-resume/ra tauri:dev

# Run only the Vite frontend (no Tauri shell)
dev-web:
    pnpm --filter @dizzy-resume/ra dev

# Build the Horus extension and watch for changes
dev-horus:
    pnpm --filter @dizzy-resume/horus dev

# Build the Horus extension for loading into Chrome
build-horus:
    pnpm --filter @dizzy-resume/horus build

# Preview the production Vite build
preview:
    pnpm --filter @dizzy-resume/ra preview

# ── Building ──────────────────────────────────────────────────────────────────

# Build all packages in the workspace
build:
    pnpm -r build

# Build only the Ra frontend (tsc + vite build)
build-web:
    pnpm --filter @dizzy-resume/ra build

# Build the Tauri desktop app for distribution
build-tauri:
    pnpm --filter @dizzy-resume/ra tauri:build

# ── Code Quality ──────────────────────────────────────────────────────────────

# Run TypeScript type-check across all packages
typecheck:
    pnpm -r typecheck

# Run ESLint across all packages
lint:
    pnpm lint

# Format all source files with Prettier
format:
    pnpm format

# Run lint + typecheck
check: lint typecheck

# ── Workspace Management ──────────────────────────────────────────────────────

# List all workspace packages
workspaces:
    pnpm ls -r --depth 0

# Run a script in every workspace package (e.g. just run-all build)
run-all script:
    pnpm -r {{script}}

# Run a script in a specific package (e.g. just run ra dev)
run package script:
    pnpm --filter @dizzy-resume/{{package}} {{script}}

# ── Cleanup ───────────────────────────────────────────────────────────────────

# Remove all node_modules and build artifacts
[unix]
clean:
    pnpm -r --if-present run clean
    find . -name 'node_modules' -not -path '*/.git/*' -prune -exec rm -rf {} +
    find . -name 'dist' -not -path '*/.git/*' -not -path '*/src-tauri/*' -prune -exec rm -rf {} +

[windows]
clean:
    pnpm -r --if-present run clean
    powershell -NoProfile -Command "Get-ChildItem -Recurse -Force -Directory -Filter node_modules | Where-Object { $_.FullName -notmatch '\\.git' } | Remove-Item -Recurse -Force"
    powershell -NoProfile -Command "Get-ChildItem -Recurse -Force -Directory -Filter dist | Where-Object { $_.FullName -notmatch '\\.git' -and $_.FullName -notmatch 'src-tauri' } | Remove-Item -Recurse -Force"

# Remove pnpm lockfile and reinstall from scratch
[unix]
reset: clean
    rm -f pnpm-lock.yaml
    pnpm install

[windows]
reset: clean
    powershell -NoProfile -Command "Remove-Item -Force -ErrorAction SilentlyContinue pnpm-lock.yaml"
    pnpm install

# ── Tauri ─────────────────────────────────────────────────────────────────────

# Open the Tauri CLI for Ra directly
tauri *args:
    pnpm --filter @dizzy-resume/ra tauri {{args}}
