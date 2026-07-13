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

## 다음에 다듬을 것 (TODO)

- [ ] 샘플 강습 6개 → 실제 시간표로 교체 (관리자 화면에서)
- [ ] 디자인/UI 다듬기 (색감, 로고, 모바일)
- [ ] 문구/브랜딩 정리
- [ ] 예약 취소·대기 순번 알림 등 기능 추가
