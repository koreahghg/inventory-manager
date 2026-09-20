## 개발 환경 설정

```bash
cp .env.local.example .env.local
# .env.local에 Supabase 프로젝트 URL / anon key / service role key 입력

npm install
npm run dev
```

## 데이터베이스

`supabase/migrations` 디렉터리에 스키마 마이그레이션 SQL이 있다. Supabase 프로젝트의 SQL Editor에서 순서대로 실행하거나 `supabase db push`로 적용한다.

### 타입 자동 생성

프로젝트를 Supabase CLI에 연결한 뒤에는 DB 스키마로부터 TypeScript 타입을 자동 생성할 수 있다.

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npm run gen:types
```

## 프론트엔드 아키텍처 (FSD)

`src`는 Feature-Sliced Design 레이어로 구성한다.

```text
src/
  app/        Next.js App Router 라우팅 (레이아웃/페이지 파일, 얇게 유지)
  views/      라우트별 화면 조합 (FSD의 pages 레이어. Next.js pages 라우터와
              이름이 충돌하지 않도록 views로 명명)
  widgets/    여러 entity/feature를 조합한 화면 단위 블록
  features/   사용자 상호작용 단위 (폼 + 서버 액션): 로그인, 상품 등록,
              매입/판매 등록, 물류 코드 등록 등
  entities/   비즈니스 엔티티별 타입과 서버 조회 함수 (product, purchase,
              sale, logistics-code, stats)
  shared/     공용 UI 컴포넌트, Supabase 클라이언트, 포맷터 등
```

의존 방향은 상위 레이어가 하위 레이어를 참조하는 단방향이다: `app → views → widgets → features → entities → shared`.
