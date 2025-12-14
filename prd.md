# PRD: 몸무게 기록 웹앱 (Weight Calendar)

## 1. 개요

### 1.1 프로젝트 목표
매일 몸무게를 기록하고 추이를 확인할 수 있는 모바일 최적화 웹앱 (개인 사용 용도)

### 1.2 기술 스택
- **Frontend**: Next.js 14 (App Router)
- **Deployment**: Vercel
- **Database**: Supabase (PostgreSQL)
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Styling**: Tailwind CSS
- **Calendar**: react-calendar
- **Charts**: recharts
- **API**: Next.js API Routes (Route Handlers)

---

## 2. 핵심 기능

### 2.1 하단 탭 네비게이션
모바일 앱처럼 고정된 하단 탭 바 (3개 탭)

| 탭 | 아이콘 | 기능 |
|---|---|---|
| 기록 | 📅 | 캘린더 형태로 몸무게 기록/조회 |
| 통계 | 📊 | 일간/주간/월간 그래프 및 평균 |
| 설정 | ⚙️ | 사용자 설정 |

---

### 2.2 기록 탭 (메인)

#### 캘린더 뷰
- 월별 캘린더 표시
- 각 날짜에 기록된 몸무게 숫자 표시
- 날짜 클릭 시 상세 입력/수정 모달

#### 몸무게 입력
- 날짜 선택 (기본: 오늘)
- 몸무게 입력 (숫자, 소수점 1자리까지)
- 단위: kg
- 메모 (선택사항)

#### 데이터 표시
- 기록 있는 날짜: 배경색 표시 + 숫자
- 기록 없는 날짜: 빈 칸
- 오늘 날짜: 강조 표시

---

### 2.3 통계 탭

#### 기간 선택
- 일간 (최근 7일)
- 주간 (최근 4주)
- 월간 (최근 6개월)

#### 그래프
- 막대 그래프로 몸무게 추이 시각화
- X축: 날짜/주/월
- Y축: 몸무게 (kg)

#### 통계 정보
- 선택 기간 평균 몸무게
- 최고/최저 몸무게
- 변화량 (시작 대비)

---

### 2.4 설정 탭

#### 프로필 설정
- 목표 몸무게 설정
- 키 입력 (BMI 계산용)

#### 앱 설정
- 데이터 내보내기 (CSV)
- 데이터 초기화

---

## 3. 데이터 모델

### 3.1 Settings 테이블
```sql
CREATE TABLE settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  target_weight DECIMAL(5,2),
  height DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3.2 Weight Records 테이블
```sql
CREATE TABLE weight_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  weight DECIMAL(5,2) NOT NULL,
  memo TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_weight_records_date ON weight_records(date);
```

---

## 4. 프로젝트 구조

```
/app
├── layout.tsx              # 루트 레이아웃 (하단 탭 포함)
├── page.tsx                # 메인 (기록 탭으로 리다이렉트)
├── record/
│   └── page.tsx            # 기록 탭 (캘린더)
├── stats/
│   └── page.tsx            # 통계 탭
├── settings/
│   └── page.tsx            # 설정 탭
└── api/
    ├── weights/
    │   ├── route.ts        # GET (목록), POST (생성)
    │   └── [date]/
    │       └── route.ts    # GET, PUT, DELETE (개별)
    └── settings/
        └── route.ts        # GET, PUT

/components
├── ui/                     # shadcn/ui 컴포넌트
├── bottom-nav.tsx          # 하단 탭 네비게이션
├── calendar-view.tsx       # 캘린더 뷰
├── weight-input-modal.tsx  # 몸무게 입력 모달
├── stats-chart.tsx         # 통계 그래프
└── period-selector.tsx     # 기간 선택 탭

/lib
├── supabase.ts             # Supabase 클라이언트
└── utils.ts                # 유틸리티 함수
```

---

## 5. API 엔드포인트

### 5.1 몸무게 기록 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/weights` | 전체 기록 조회 (쿼리: year, month) |
| POST | `/api/weights` | 새 기록 생성 |
| GET | `/api/weights/[date]` | 특정 날짜 기록 조회 |
| PUT | `/api/weights/[date]` | 특정 날짜 기록 수정 |
| DELETE | `/api/weights/[date]` | 특정 날짜 기록 삭제 |

#### Request/Response 예시
```typescript
// POST /api/weights
// Request Body
{
  "date": "2024-01-15",
  "weight": 72.5,
  "memo": "운동 후 측정"
}

// Response
{
  "id": "uuid",
  "date": "2024-01-15",
  "weight": 72.5,
  "memo": "운동 후 측정",
  "created_at": "2024-01-15T09:00:00Z"
}
```

### 5.2 설정 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/settings` | 설정 조회 |
| PUT | `/api/settings` | 설정 수정 |

```typescript
// PUT /api/settings
{
  "target_weight": 70.0,
  "height": 175.5
}
```

---

## 6. UI/UX 요구사항

### 6.1 반응형 디자인
- 모바일 우선 (Mobile-first)
- 최대 너비: 480px (모바일 최적화)
- 데스크탑에서는 중앙 정렬된 모바일 뷰

### 6.2 하단 탭 바
- 화면 하단 고정
- 높이: 60-70px
- Safe area 대응 (노치/홈바)
- 현재 탭 강조 표시
- Lucide 아이콘 사용: Calendar, BarChart3, Settings

### 6.3 색상 테마
- 기본: 라이트 모드
- Primary: #3B82F6 (파란색)
- Background: #F9FAFB
- Text: #111827

### 6.4 폰트
- 시스템 폰트 사용
- 숫자: tabular-nums (고정폭)

### 6.5 shadcn/ui 컴포넌트 활용
- Button, Input, Card, Dialog (모달)
- Tabs (기간 선택)
- Toast (알림)

---

## 7. 개발 우선순위

### Phase 1 (MVP)
1. 프로젝트 셋업 (Next.js + Supabase + shadcn/ui)
2. 하단 탭 네비게이션
3. 캘린더 뷰 + 몸무게 입력
4. 기본 통계 (그래프)

### Phase 2
1. 상세 통계 (평균, 최고/최저)
2. 설정 페이지
3. 목표 몸무게 설정
4. BMI 계산

### Phase 3
1. 데이터 내보내기 (CSV)
2. 다크 모드

---

## 8. 성능 요구사항

- First Contentful Paint (FCP): < 1.5s
- Lighthouse 점수: 90+ (모바일)

---

## 9. 향후 확장 가능성

- 체지방률, 근육량 등 추가 기록
- Apple Health / Google Fit 연동
- PWA 지원
