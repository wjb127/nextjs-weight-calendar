# Weight Calendar - 몸무게 기록 앱

매일 몸무게를 기록하고 추이를 확인할 수 있는 모바일 최적화 웹앱

## 기술 스택

- **Frontend**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **UI**: shadcn/ui + Tailwind CSS
- **Icons**: Lucide React
- **Calendar**: react-calendar
- **Charts**: recharts

## 기능

- **기록 탭**: 캘린더에서 날짜를 클릭해 몸무게 기록
- **통계 탭**: 일간/주간/월간 그래프 및 평균, 변화량 확인
- **설정 탭**: 목표 몸무게, 키 설정, CSV 내보내기

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. Supabase 설정

1. [Supabase](https://supabase.com)에서 프로젝트 생성
2. SQL Editor에서 `supabase-schema.sql` 실행
3. `.env.local` 파일 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 접속

## Vercel 배포

1. Vercel에 GitHub 저장소 연결
2. 환경 변수 설정:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. 배포

## 프로젝트 구조

```
src/
├── app/
│   ├── api/
│   │   ├── weights/     # 몸무게 기록 API
│   │   └── settings/    # 설정 API
│   ├── record/          # 기록 탭
│   ├── stats/           # 통계 탭
│   └── settings/        # 설정 탭
├── components/
│   ├── ui/              # shadcn/ui 컴포넌트
│   ├── bottom-nav.tsx   # 하단 네비게이션
│   ├── calendar-view.tsx
│   ├── weight-input-modal.tsx
│   └── stats-chart.tsx
├── lib/
│   └── supabase.ts
└── types/
    └── index.ts
```
