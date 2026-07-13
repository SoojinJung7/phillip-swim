# 🏊 필립 수영 — 집/다른 컴퓨터에서 이어서 작업하기

라이브 사이트: **https://phillip-swim.vercel.app**
(GitHub `main`에 push하면 Vercel이 자동 재배포)

## 처음 세팅 (새 컴퓨터에서 한 번만)

```bash
# 1. 코드 받기
git clone https://github.com/SoojinJung7/phillip-swim.git
cd phillip-swim

# 2. 패키지 설치
npm install

# 3. Vercel 로그인 (계정: soojinjung7)
npm install -g vercel
vercel login

# 4. 프로젝트 연결 + 환경변수 자동으로 받아오기
vercel link                  # 물어보면 → 기존 phillip-swim 프로젝트 선택
vercel env pull .env.local   # Supabase 키 4개가 .env.local 로 자동 설치됨

# 5. 로컬 실행
npm run dev                  # http://localhost:3000
```

`vercel env pull` 덕분에 Supabase 키를 손으로 다시 입력할 필요 없음. 진짜 DB에 연결된 채로 로컬 작업 가능.

## 매일 작업 흐름

```bash
git pull            # 최신 코드 받기
npm run dev         # 로컬에서 작업/확인
# ...코드 수정...
git add -A && git commit -m "메시지"
git push            # → Vercel 자동 재배포
```

## 관리자로 로그인

- 이름: 아무거나
- 전화번호: **010-9800-6774**
- → 강습 개설 / 예약 관리 화면이 열림

## 인프라 요약

| 구성 | 위치 |
|---|---|
| 코드 | GitHub `SoojinJung7/phillip-swim` |
| 호스팅 | Vercel (프로젝트 `phillip-swim`) |
| DB / 인증데이터 | Supabase (electree's Org, Seoul 리전) |

## 환경변수 (Vercel Production에 저장됨 — `vercel env pull`로 받음)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (공개용 publishable 키)
- `SUPABASE_SERVICE_ROLE_KEY` (서버 전용 secret 키 — 절대 브라우저 노출 금지)
- `ADMIN_PHONE` (관리자 전화번호)

DB 스키마를 다시 깔아야 하면 `supabase/schema.sql` 을 Supabase SQL Editor에 붙여넣고 Run.

## 🔔 지금 진행 중: 카카오 알림톡 (Solapi)

- **코드는 완료**되어 배포됨(2026-07-14). 예약 확정·대기자 호출 시 자동 발송하도록 연결됨.
  키가 없으면 조용히 생략하므로 지금도 예약/대기 기능은 정상.
- **남은 일 = Solapi 세팅(사장님)**: `ALIMTALK.md` 순서대로
  1. Solapi 가입 → API Key/Secret
  2. 발신번호 등록
  3. 이미 있는 카카오 채널 연동 → 발신프로필 ID(pfId)
  4. 템플릿 2개 등록·승인(1~2 영업일)
  5. Vercel Production 환경변수 6개 추가 → 재배포하면 발송 시작
- 5단계 값 6개만 확보되면 `vercel env add`로 등록하면 끝.

## 다음에 다듬을 것 (TODO)

- [ ] **카카오 알림톡** — Solapi 세팅 마무리(위 참조, `ALIMTALK.md`)
- [ ] 샘플 강습 6개 → 실제 시간표로 교체 (관리자 화면에서)
- [ ] 디자인/UI 다듬기 (색감, 로고, 모바일)
- [ ] 문구/브랜딩 정리
- [ ] 예약 취소 → 대기 1번 자동 승격 (지금은 운영자 수동 호출)
