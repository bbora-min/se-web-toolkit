#!/usr/bin/env bash
# PostToolUse(Edit|Write): 방금 저장한 .ts/.tsx 를 그 앱의 ESLint(se 규칙)로 검사.
#  - 규칙 위반(eslint exit 1) → exit 2 로 Claude 에게 되돌려 즉시 고치게 한다
#  - eslint 미설치·설정 오류 같은 인프라 실패 → 경고만 남기고 exit 0 (코드가 틀린 게 아니다)
#  - 앱 루트는 파일에서 위로 올라가며 @se/ui 를 의존하는 package.json 을 찾는다 (모노레포의 examples/* 도 잡힌다)
set -u
input="$(cat)"
file="$(printf '%s' "$input" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{const j=JSON.parse(s);process.stdout.write(j.tool_input?.file_path||'')}catch{}})" 2>/dev/null)"
[ -n "$file" ] || exit 0
case "$file" in *.ts|*.tsx) ;; *) exit 0 ;; esac
[ -f "$file" ] || exit 0

# 앱 루트 찾기
dir="$(dirname "$file")"
app=""
while [ "$dir" != "/" ]; do
  if [ -f "$dir/package.json" ] && grep -q '"@se/ui"' "$dir/package.json" 2>/dev/null; then app="$dir"; break; fi
  dir="$(dirname "$dir")"
done
[ -n "$app" ] || exit 0

# eslint 실행 파일: 앱 → 상위(모노레포 루트) 순으로
bin=""
dir="$app"
while [ "$dir" != "/" ]; do
  [ -x "$dir/node_modules/.bin/eslint" ] && bin="$dir/node_modules/.bin/eslint" && break
  dir="$(dirname "$dir")"
done
if [ -z "$bin" ]; then echo "[se lint] eslint 가 설치되지 않아 건너뜁니다 (pnpm install)" >&2; exit 0; fi

cd "$app" || exit 0
out="$("$bin" --no-warn-ignored --max-warnings=0 --cache --cache-location node_modules/.cache/se-eslint "$file" 2>&1)"
code=$?
case $code in
  0) exit 0 ;;
  1) printf '%s\n' "[se lint] 디자인 시스템 규칙 위반 — 고친 뒤 계속하십시오:" "$out" >&2; exit 2 ;;
  *) printf '%s\n' "[se lint] eslint 실행 실패(코드 $code) — 규칙 위반이 아니라 설정 문제입니다:" "$out" >&2; exit 0 ;;
esac
