WITH intro_cohort AS (
  INSERT INTO "CourseCohort" (
    "id",
    "courseProgramId",
    "title",
    "startsAt",
    "endsAt",
    "registrationDeadline",
    "capacity",
    "status",
    "createdAt",
    "updatedAt"
  )
  SELECT
    'course_cohort_intro_demo',
    "id",
    '入門班示範班期',
    date_trunc('day', CURRENT_TIMESTAMP) + interval '14 days 19 hours 30 minutes',
    date_trunc('day', CURRENT_TIMESTAMP) + interval '63 days 21 hours 30 minutes',
    date_trunc('day', CURRENT_TIMESTAMP) + interval '11 days 23 hours 59 minutes',
    12,
    'OPEN'::"CourseCohortStatus",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  FROM "CourseProgram"
  WHERE "slug" = 'ai-system-development-intro'
  ON CONFLICT ("id") DO UPDATE SET
    "courseProgramId" = EXCLUDED."courseProgramId",
    "title" = EXCLUDED."title",
    "startsAt" = EXCLUDED."startsAt",
    "endsAt" = EXCLUDED."endsAt",
    "registrationDeadline" = EXCLUDED."registrationDeadline",
    "capacity" = EXCLUDED."capacity",
    "status" = EXCLUDED."status",
    "updatedAt" = CURRENT_TIMESTAMP
  RETURNING "id", "startsAt"
),
advanced_cohort AS (
  INSERT INTO "CourseCohort" (
    "id",
    "courseProgramId",
    "title",
    "startsAt",
    "endsAt",
    "registrationDeadline",
    "capacity",
    "status",
    "createdAt",
    "updatedAt"
  )
  SELECT
    'course_cohort_advanced_demo',
    "id",
    '進階班示範班期',
    date_trunc('day', CURRENT_TIMESTAMP) + interval '21 days 19 hours 30 minutes',
    date_trunc('day', CURRENT_TIMESTAMP) + interval '70 days 21 hours 30 minutes',
    date_trunc('day', CURRENT_TIMESTAMP) + interval '18 days 23 hours 59 minutes',
    10,
    'OPEN'::"CourseCohortStatus",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  FROM "CourseProgram"
  WHERE "slug" = 'ai-system-development-advanced'
  ON CONFLICT ("id") DO UPDATE SET
    "courseProgramId" = EXCLUDED."courseProgramId",
    "title" = EXCLUDED."title",
    "startsAt" = EXCLUDED."startsAt",
    "endsAt" = EXCLUDED."endsAt",
    "registrationDeadline" = EXCLUDED."registrationDeadline",
    "capacity" = EXCLUDED."capacity",
    "status" = EXCLUDED."status",
    "updatedAt" = CURRENT_TIMESTAMP
  RETURNING "id", "startsAt"
),
intro_sessions ("weekNumber", "topic", "description") AS (
  VALUES
    (1, 'AI 系統開發概念與專案選題', 'AI 工具角色、Vibe Coding 流程、需求拆解、選定小系統題目。'),
    (2, '使用者流程與前端設計', '使用者旅程、頁面結構、表單流程、UI/UX、RWD 概念。'),
    (3, 'Vibe Coding 基礎實作', '使用 Cursor / Codex 產生頁面、元件拆分、樣式調整。'),
    (4, '表單設計與資料驗證', '表單欄位、必填規則、錯誤提示、送出狀態、使用者回饋。'),
    (5, '資料儲存與後端 API', 'API Route、資料模型、簡單資料庫概念、表單資料寫入。'),
    (6, '後台列表與資料管理', '查詢資料、列表頁、狀態管理、基本管理後台。'),
    (7, '測試、修正與部署準備', '功能測試、錯誤處理、環境變數、版本管理、部署檢查表。'),
    (8, '部署上線與成果發表', '雲端部署概念、正式上線、Demo 與回饋。')
),
advanced_sessions ("weekNumber", "topic", "description") AS (
  VALUES
    (1, 'AI 系統開發生命週期 SDLC', '需求、設計、開發、測試、部署、維運與 AI 輔助開發角色。'),
    (2, 'Agile 專案管理與需求拆解', 'User Story、Backlog、Sprint、驗收條件、Issue / PR 流程。'),
    (3, '系統架構設計', '前後端分離、API、服務邊界、權限、錯誤處理、系統圖。'),
    (4, '資料庫設計與資料模型', 'ERD、資料表、關聯、索引、Migration、Prisma / SQL 基礎。'),
    (5, '後端 API 與商業邏輯', 'REST API、驗證、交易流程、狀態機、錯誤回應、Rate Limit。'),
    (6, 'AI 功能整合與工作流', 'LLM API、Prompt 管理、RAG 概念、Agent 工作流、人工覆核。'),
    (7, '雲端部署與 DevOps', 'Docker、環境變數、CI/CD、Log、監控、備份、Rollback。'),
    (8, '安全、維運與專案總結', '權限、資料保護、測試策略、維運清單、成本估算、成果發表。')
),
insert_intro_sessions AS (
  INSERT INTO "CourseSession" (
    "id",
    "cohortId",
    "weekNumber",
    "startAt",
    "endAt",
    "topic",
    "description",
    "createdAt",
    "updatedAt"
  )
  SELECT
    'course_session_intro_demo_' || intro_sessions."weekNumber",
    intro_cohort."id",
    intro_sessions."weekNumber",
    intro_cohort."startsAt" + ((intro_sessions."weekNumber" - 1) * interval '7 days'),
    intro_cohort."startsAt" + ((intro_sessions."weekNumber" - 1) * interval '7 days') + interval '2 hours',
    intro_sessions."topic",
    intro_sessions."description",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  FROM intro_cohort
  CROSS JOIN intro_sessions
  ON CONFLICT ("cohortId", "weekNumber") DO UPDATE SET
    "startAt" = EXCLUDED."startAt",
    "endAt" = EXCLUDED."endAt",
    "topic" = EXCLUDED."topic",
    "description" = EXCLUDED."description",
    "updatedAt" = CURRENT_TIMESTAMP
  RETURNING "id"
)
INSERT INTO "CourseSession" (
  "id",
  "cohortId",
  "weekNumber",
  "startAt",
  "endAt",
  "topic",
  "description",
  "createdAt",
  "updatedAt"
)
SELECT
  'course_session_advanced_demo_' || advanced_sessions."weekNumber",
  advanced_cohort."id",
  advanced_sessions."weekNumber",
  advanced_cohort."startsAt" + ((advanced_sessions."weekNumber" - 1) * interval '7 days'),
  advanced_cohort."startsAt" + ((advanced_sessions."weekNumber" - 1) * interval '7 days') + interval '2 hours',
  advanced_sessions."topic",
  advanced_sessions."description",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM advanced_cohort
CROSS JOIN advanced_sessions
ON CONFLICT ("cohortId", "weekNumber") DO UPDATE SET
  "startAt" = EXCLUDED."startAt",
  "endAt" = EXCLUDED."endAt",
  "topic" = EXCLUDED."topic",
  "description" = EXCLUDED."description",
  "updatedAt" = CURRENT_TIMESTAMP;
