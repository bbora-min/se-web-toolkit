#!/usr/bin/env bash
# SE Web Toolkit 준비 — 한 번에.
#   ./scripts/setup.sh            Node 22 · pnpm · 의존성 · 검사 · Claude Code 플러그인 등록
#   ./scripts/setup.sh --dev      + 레퍼런스 앱 3개 백그라운드 실행 (5173·5174·5175)
#   ./scripts/setup.sh --full     + typecheck · lint · test 전체
# 어디서 실행해도 된다. sudo 불필요. 다시 실행해도 안전(멱등).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
DEV=0; FULL=0
for a in "$@"; do case "$a" in --dev) DEV=1 ;; --full) FULL=1 ;; -h|--help) sed -n '2,7p' "$0"; exit 0 ;; esac; done
ok()   { printf '\033[32m✓\033[0m %s\n' "$*"; }
warn() { printf '\033[33m!\033[0m %s\n' "$*"; }
step() { printf '\n\033[1m%s\033[0m\n' "$*"; }
WANT="$(tr -d 'v\n' < .nvmrc)"          # 22.23.2
WANT_MAJOR="${WANT%%.*}"

step "1/5 Node ${WANT_MAJOR} LTS"
have_major="$(node -v 2>/dev/null | sed 's/^v//; s/\..*//' || echo 0)"
if [ "${have_major:-0}" -ge "$WANT_MAJOR" ]; then
  ok "node $(node -v)"
else
  NODE_DIR="$HOME/.nvm/versions/node/v$WANT"
  if [ -x "$NODE_DIR/bin/node" ]; then
    ok "이미 받아 둔 node v$WANT 사용"
  elif [ -s "$HOME/.nvm/nvm.sh" ] && ! grep -q '^prefix=' "$HOME/.npmrc" 2>/dev/null; then
    # nvm 이 정상이면 nvm 으로
    . "$HOME/.nvm/nvm.sh" && nvm install "$WANT" >/dev/null && ok "nvm install $WANT"
  else
    # nvm 이 없거나 ~/.npmrc 의 prefix 와 충돌하면 바이너리만 내려받는다 (sudo 없이)
    ARCH="$(uname -m)"; case "$ARCH" in x86_64) ARCH=x64 ;; aarch64|arm64) ARCH=arm64 ;; esac
    OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
    warn "node ${WANT_MAJOR} 가 없어 $NODE_DIR 에 내려받습니다 (nvm/prefix 충돌 시 이 방식이 안전)"
    mkdir -p "$NODE_DIR"
    curl -fsSL "https://nodejs.org/dist/v$WANT/node-v$WANT-$OS-$ARCH.tar.xz" | tar -xJ -C "$NODE_DIR" --strip-components=1
    ok "node v$WANT 설치"
  fi
  export PATH="$NODE_DIR/bin:$PATH"
  warn "이 셸 밖에서는:  export PATH=$NODE_DIR/bin:\$PATH   (또는 ~/.npmrc 의 prefix= 줄을 지우고 nvm use)"
fi

step "2/5 pnpm (corepack)"
if ! command -v pnpm >/dev/null 2>&1; then
  corepack enable pnpm --install-directory "$(dirname "$(command -v node)")" >/dev/null 2>&1 || corepack enable pnpm >/dev/null 2>&1 || true
  corepack prepare "$(node -p "require('./package.json').packageManager")" --activate >/dev/null 2>&1 || true
fi
command -v pnpm >/dev/null || { echo "✗ pnpm 을 활성화하지 못했습니다: corepack enable pnpm"; exit 1; }
ok "pnpm $(pnpm -v)"

step "3/5 의존성 설치 (@se/tokens 빌드 포함)"
pnpm install --frozen-lockfile >/dev/null 2>&1 || pnpm install >/dev/null
ok "pnpm install"

step "4/5 검사"
pnpm check-identity >/dev/null && ok "아이덴티티 레지스트리"
pnpm check:skill-docs >/dev/null && ok "스킬 문서 = 코드"
if [ "$FULL" = 1 ]; then
  pnpm -r typecheck >/dev/null && ok "typecheck"
  pnpm lint >/dev/null && ok "lint"
  pnpm -r test >/dev/null 2>&1 && ok "test"
fi

step "5/5 Claude Code 플러그인"
if command -v claude >/dev/null 2>&1; then
  claude plugin validate ./plugin >/dev/null 2>&1 && ok "플러그인 매니페스트 검증" || warn "플러그인 검증 실패: claude plugin validate ./plugin"
  # 로컬 체크아웃을 마켓플레이스로 — 이 저장소를 고치면 바로 반영된다
  if claude plugin marketplace list 2>/dev/null | grep -q "se-web-toolkit"; then
    ok "마켓플레이스 se-web-toolkit 등록됨"
  else
    claude plugin marketplace add "$ROOT" >/dev/null 2>&1 && ok "마켓플레이스 등록 ($ROOT)" || warn "마켓플레이스 등록 실패 — Claude Code 안에서: /plugin marketplace add $ROOT"
  fi
  if claude plugin list 2>/dev/null | grep -q "^se@se-web-toolkit\|se@se-web-toolkit"; then
    ok "플러그인 se 설치됨"
  else
    claude plugin install se@se-web-toolkit >/dev/null 2>&1 && ok "플러그인 se 설치" || warn "설치 실패 — Claude Code 안에서: /plugin install se@se-web-toolkit"
  fi
else
  warn "claude CLI 가 없습니다. Claude Code 안에서: /plugin marketplace add $ROOT  →  /plugin install se@se-web-toolkit"
fi

if [ "$DEV" = 1 ]; then
  step "레퍼런스 앱"
  mkdir -p .logs
  for app in reference-app:5173 dataset-explorer:5174 release-desk:5175; do
    name="${app%%:*}"; port="${app##*:}"
    if curl -s -o /dev/null --max-time 1 "http://localhost:$port/"; then ok "$name 이미 실행 중 :$port"; continue; fi
    (pnpm --filter "$name" dev > ".logs/$name.log" 2>&1 &)
    ok "$name → http://localhost:$port  (로그 .logs/$name.log)"
  done
fi

printf '\n\033[1m준비 끝.\033[0m 다음:\n'
printf '  claude                     # 이 저장소에서 새 세션 — 시작 메시지에 [SE Web Toolkit] 이 보이면 훅 동작\n'
printf '  /se:new incident-desk      # 시험 A (docs/VALIDATION.md)\n'
[ "$DEV" = 1 ] || printf '  ./scripts/setup.sh --dev   # 레퍼런스 앱 3개 띄우기\n'
