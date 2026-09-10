#!/usr/bin/env bash
# 세션 시작: Node 버전 정책 검사 + @se/ui 버전 + se.identity.json 요약을 컨텍스트로.
# 디자인 시스템 프로젝트가 아니면 조용히 종료.
set -u
root="${CLAUDE_PROJECT_DIR:-$PWD}"
[ -f "$root/package.json" ] || exit 0
grep -q '"@se/ui"' "$root/package.json" 2>/dev/null || exit 0

node_v="$(node -v 2>/dev/null || echo none)"
major="${node_v#v}"; major="${major%%.*}"
minor="${node_v#v*.}"; minor="${minor%%.*}"
node_note=""
if [ "$node_v" = "none" ]; then node_note="⚠ node를 찾을 수 없습니다"
elif [ "$major" -lt 20 ] || { [ "$major" -eq 20 ] && [ "${minor:-0}" -lt 19 ]; }; then node_note="⚠ Node $node_v — 툴체인 하한(20.19) 미만. .nvmrc(22)로 올리십시오: nvm use"
elif [ "$major" -lt 22 ]; then node_note="△ Node $node_v — 동작하지만 툴킷 표준은 22 LTS (.nvmrc)"
fi

ui_v="$(node -e "try{console.log(require('$root/node_modules/@se/ui/package.json').version)}catch{console.log('미설치')}" 2>/dev/null)"
identity=""
if [ -f "$root/se.identity.json" ]; then
  identity="$(node -e "const i=require('$root/se.identity.json');console.log(\`\${i.name} (\${i.id}) · hue \${i.accent?.hue}° · \${i.signature} · \${i.density} · \${i.tone}\`)" 2>/dev/null)"
fi

{
  echo "[SE Web Toolkit] @se/ui $ui_v · Node $node_v"
  [ -n "$identity" ] && echo "아이덴티티: $identity — 색은 토큰 클래스만, 시그니처는 se.identity.json이 정합니다"
  [ -n "$node_note" ] && echo "$node_note"
  echo "화면 작업 전 se-design 플랜 → se-ui 패턴 원본 복사. 명령: /se:spec /se:page /se:review /se:audit"
} 2>/dev/null
exit 0
