# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

개인용 몸무게 기록 PWA 웹앱. 캘린더 형태로 매일 몸무게를 기록하고, 통계 그래프로 추이를 확인할 수 있음.

## Commands

```bash
npm run dev      # 개발 서버 (Turbopack)
npm run build    # 프로덕션 빌드 (webpack - PWA 생성 필요)
npm run lint     # ESLint
npm run start    # 프로덕션 서버
```

## Architecture

### Tech Stack
- Next.js 16 (App Router) + React 19
- Supabase (PostgreSQL) - API Routes로만 접근
- shadcn/ui + Tailwind CSS 4 + Lucide React
- react-calendar, recharts
- PWA: @ducanh2912/next-pwa

### Database Access
- **RLS 활성화됨** - 직접 DB 접근 차단
- **service_role 키** 사용 (`src/lib/supabase.ts`)
- API Routes에서만 Supabase 호출

### Pages Structure
- `/record` - 캘린더 뷰, 몸무게 입력/수정
- `/stats` - 일간/주간/월간 통계 그래프
- `/settings` - 목표 설정, CSV 내보내기

### API Endpoints
- `GET/POST /api/weights` - 기록 조회/생성 (year, month 쿼리)
- `GET/PUT/DELETE /api/weights/[date]` - 개별 기록
- `GET/PUT /api/settings` - 설정

### Key Components
- `bottom-nav.tsx` - 하단 탭 (safe area 처리 포함)
- `calendar-view.tsx` - react-calendar 래퍼
- `weight-input-modal.tsx` - 몸무게 입력 다이얼로그
- `stats-chart.tsx` - recharts 기반 그래프

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

## Notes

- 빌드 시 `--webpack` 플래그 필수 (PWA service worker 생성)
- `globals.css`에 react-calendar 커스텀 스타일 정의
- 모바일 최적화 (max-width: 480px, safe area 대응)
