# AIDC.work 線上預約系統設計書

## 1. 設計目標

AIDC.work 的線上預約系統需支援兩種服務型態：

1. **鐘點諮詢預約**
   - 適用於臨時、一對一或小型團隊諮詢。
   - 客戶選擇一個可預約時段，送出預約申請。
   - 管理員確認或取消後，系統寄出 Email 通知。

2. **8 週課程班期報名**
   - 適用於固定週期課程，例如「AI 系統開發入門班」與「AI 系統開發進階班」。
   - 客戶報名一整期課程，而不是單一時段。
   - 每期預設 8 週，管理員可建立班期、調整每週上課時間、管理報名名單。

本系統設計以「低維運、可擴充、先可用」為原則，延續目前 Next.js + Prisma + PostgreSQL + Resend 架構。

## 2. 系統範圍

### 2.1 本階段納入

- 鐘點諮詢服務管理
- 鐘點可預約時段管理
- 鐘點預約申請、確認、取消
- 課程方案管理
- 8 週課程班期管理
- 課程週次時段自動產生
- 課程報名申請、確認、取消、候補
- 管理員後台
- Email 通知
- 基本報名人數控管
- 後台登入與改密碼

### 2.2 本階段不納入

- 線上付款
- 發票與金流
- 學員登入專區
- 教材下載權限
- 出席紀錄
- Zoom / Google Meet 自動建立連結
- 多講師排班
- 多管理員權限分級

## 3. 角色與權限

### 3.1 訪客 / 客戶

可執行：

- 查看鐘點諮詢服務與可預約時段
- 送出鐘點諮詢預約
- 查看預約確認頁
- 查看可報名課程班期
- 查看 8 週課表
- 送出課程報名
- 查看課程報名確認頁

不可執行：

- 查看其他客戶資料
- 修改預約或報名狀態
- 進入後台

### 3.2 管理員

可執行：

- 登入後台
- 修改管理員密碼
- 建立與管理鐘點可預約時段
- 查看鐘點預約資料
- 確認、取消、完成鐘點預約
- 建立與管理課程方案
- 建立與管理 8 週課程班期
- 查看課程報名資料
- 確認、取消、候補、完成課程報名
- 儲存管理備註

## 4. 前台資訊架構

```text
AIDC.work
├─ /booking
│  ├─ 選擇鐘點諮詢服務
│  ├─ 選擇可預約時段
│  └─ 填寫預約資料
│
├─ /booking/confirmation/[id]
│  └─ 鐘點諮詢預約確認頁
│
├─ /courses
│  ├─ 課程介紹
│  └─ 可報名班期列表
│
├─ /courses/[slug]
│  ├─ 課程詳情
│  ├─ 可報名班期
│  └─ 8 週課表
│
├─ /courses/[slug]/enroll/[cohortId]
│  └─ 課程報名表
│
└─ /courses/enroll/confirmation/[id]
   └─ 課程報名確認頁
```

## 5. 後台資訊架構

```text
/admin
├─ /admin/dashboard
│  └─ 總覽：待確認預約、近期諮詢、近期課程報名
│
├─ /admin/slots
│  └─ 鐘點可預約時段管理
│
├─ /admin/bookings
│  └─ 鐘點預約管理
│
├─ /admin/course-programs
│  └─ 課程方案管理
│
├─ /admin/course-cohorts
│  └─ 課程班期與 8 週課表管理
│
├─ /admin/course-enrollments
│  └─ 課程報名管理
│
└─ /admin/settings
   └─ 帳號設定與改密碼
```

## 6. 鐘點諮詢預約設計

### 6.1 前台流程

```text
進入 /booking
→ 選擇諮詢服務
→ 選擇可預約時段
→ 填寫姓名、Email、公司、電話、需求說明
→ 送出預約
→ 系統建立 Booking，狀態為 PENDING
→ 寄出管理員通知信
→ 寄出客戶預約已收到通知信
→ 顯示確認頁
```

### 6.2 後台流程

```text
管理員進入 /admin/slots
→ 建立單筆時段或批次建立時段
→ 時段狀態為 AVAILABLE

客戶送出預約後
→ 對應時段改為 BOOKED
→ 管理員進入 /admin/bookings
→ 查看預約資料
→ 確認或取消
→ 系統寄出狀態通知信
```

### 6.3 鐘點狀態

`AvailabilitySlot.status`

- `AVAILABLE`：可預約
- `BOOKED`：已被預約
- `BLOCKED`：管理員封鎖，不開放預約

`Booking.status`

- `PENDING`：待確認
- `CONFIRMED`：已確認
- `CANCELLED`：已取消
- `COMPLETED`：已完成
- `NO_SHOW`：未出席

## 7. 課程班期預約設計

### 7.1 課程定位

課程預設為 8 週一期，每週一次。首批課程建議包含：

1. **AI 系統開發入門班：Vibe Coding 從設計到上線**
2. **AI 系統開發進階班：架構、專案管理與雲端部署**

### 7.2 入門班 8 週大綱

| 週次 | 主題 | 內容重點 | 產出 |
|---|---|---|---|
| 第 1 週 | AI 系統開發概念與專案選題 | AI 工具角色、Vibe Coding 流程、需求拆解、選定小系統題目 | 專案需求草稿 |
| 第 2 週 | 使用者流程與前端設計 | 使用者旅程、頁面結構、表單流程、UI/UX、RWD 概念 | Wireframe / 頁面規劃 |
| 第 3 週 | Vibe Coding 基礎實作 | 使用 Cursor / Codex 產生頁面、元件拆分、樣式調整 | 首版前端頁面 |
| 第 4 週 | 表單設計與資料驗證 | 表單欄位、必填規則、錯誤提示、送出狀態、使用者回饋 | 可操作資料表單 |
| 第 5 週 | 資料儲存與後端 API | API Route、資料模型、簡單資料庫概念、表單資料寫入 | 可儲存資料的系統 |
| 第 6 週 | 後台列表與資料管理 | 查詢資料、列表頁、狀態管理、基本管理後台 | 可查看表單資料 |
| 第 7 週 | 測試、修正與部署準備 | 功能測試、錯誤處理、環境變數、版本管理、部署檢查表 | 可部署版本 |
| 第 8 週 | 部署上線與成果發表 | Vercel / Docker / 雲端部署概念、正式上線、Demo 與回饋 | 上線作品 |

### 7.3 進階班 8 週大綱

| 週次 | 主題 | 內容重點 | 產出 |
|---|---|---|---|
| 第 1 週 | AI 系統開發生命週期 SDLC | 需求、設計、開發、測試、部署、維運；AI 輔助開發在各階段的角色 | SDLC 專案地圖 |
| 第 2 週 | Agile 專案管理與需求拆解 | User Story、Backlog、Sprint、驗收條件、Issue / PR 流程 | Sprint Backlog |
| 第 3 週 | 系統架構設計 | 前後端分離、API、服務邊界、權限、錯誤處理、系統圖 | 系統架構圖 |
| 第 4 週 | 資料庫設計與資料模型 | ERD、資料表、關聯、索引、Migration、Prisma / SQL 基礎 | 資料模型設計 |
| 第 5 週 | 後端 API 與商業邏輯 | REST API、驗證、交易流程、狀態機、錯誤回應、Rate Limit | API 規格與實作 |
| 第 6 週 | AI 功能整合與工作流 | LLM API、Prompt 管理、RAG 概念、Agent 工作流、人工覆核 | AI 工作流設計 |
| 第 7 週 | 雲端部署與 DevOps | Docker、環境變數、CI/CD、Log、監控、備份、Rollback | 部署流程文件 |
| 第 8 週 | 安全、維運與專案總結 | 權限、資料保護、測試策略、維運清單、成本估算、成果發表 | 上線與維運計畫 |

### 7.4 前台課程報名流程

```text
進入 /courses
→ 查看課程與可報名班期
→ 進入 /courses/[slug]
→ 查看課程介紹與 8 週課表
→ 點擊報名
→ 填寫報名資料
→ 系統建立 CourseEnrollment，狀態為 PENDING
→ 寄出管理員通知信
→ 寄出客戶報名已收到通知信
→ 顯示報名確認頁
```

### 7.5 後台課程管理流程

```text
管理員建立 CourseProgram
→ 建立 CourseCohort
→ 輸入第一週日期、星期、時間、人數上限
→ 系統自動產生 8 筆 CourseSession
→ 管理員檢查或調整各週時間
→ 將班期狀態設為 OPEN
→ 前台開放報名
```

### 7.6 課程狀態

`CourseCohort.status`

- `DRAFT`：草稿
- `OPEN`：開放報名
- `FULL`：額滿
- `CLOSED`：停止報名
- `COMPLETED`：已結束
- `CANCELLED`：已取消

`CourseEnrollment.status`

- `PENDING`：待確認
- `CONFIRMED`：已確認
- `CANCELLED`：已取消
- `WAITLISTED`：候補
- `COMPLETED`：已完成

## 8. 資料模型設計

### 8.1 既有鐘點預約模型

```text
Service
AvailabilitySlot
Booking
AdminUser
```

既有模型保留，不與課程報名混用。

### 8.2 新增課程模型

```text
CourseProgram
- id
- slug
- title
- description
- level
- durationWeeks
- sessionDurationMin
- capacity
- isActive
- sortOrder
- createdAt
- updatedAt

CourseCohort
- id
- courseProgramId
- title
- startsAt
- endsAt
- registrationDeadline
- capacity
- status
- createdAt
- updatedAt

CourseSession
- id
- cohortId
- weekNumber
- startAt
- endAt
- topic
- description
- createdAt
- updatedAt

CourseEnrollment
- id
- cohortId
- status
- name
- email
- company
- phone
- message
- adminNote
- confirmedAt
- cancelledAt
- createdAt
- updatedAt
```

### 8.3 建議索引

```text
CourseProgram:
- unique(slug)
- index(isActive, sortOrder)

CourseCohort:
- index(courseProgramId, status)
- index(startsAt)
- index(status)

CourseSession:
- unique(cohortId, weekNumber)
- index(cohortId, startAt)

CourseEnrollment:
- index(cohortId, status)
- index(email)
- index(createdAt)
```

## 9. API 設計

### 9.1 鐘點公開 API

既有：

- `GET /api/services`
- `GET /api/slots?serviceId=...`
- `POST /api/bookings`
- `GET /api/bookings/[id]`

### 9.2 鐘點管理 API

既有：

- `GET /api/admin/slots`
- `POST /api/admin/slots`
- `PATCH /api/admin/slots/[id]`
- `DELETE /api/admin/slots/[id]`
- `GET /api/admin/bookings`
- `PATCH /api/admin/bookings/[id]`

### 9.3 課程公開 API

新增：

- `GET /api/course-programs`
- `GET /api/course-programs/[slug]`
- `GET /api/course-cohorts?programId=...`
- `POST /api/course-enrollments`
- `GET /api/course-enrollments/[id]`

### 9.4 課程管理 API

新增：

- `GET /api/admin/course-programs`
- `POST /api/admin/course-programs`
- `PATCH /api/admin/course-programs/[id]`
- `GET /api/admin/course-cohorts`
- `POST /api/admin/course-cohorts`
- `PATCH /api/admin/course-cohorts/[id]`
- `PATCH /api/admin/course-sessions/[id]`
- `GET /api/admin/course-enrollments`
- `PATCH /api/admin/course-enrollments/[id]`

## 10. Email 設計

### 10.1 鐘點預約 Email

既有：

- 新預約通知管理員
- 預約已收到通知客戶
- 預約狀態更新通知客戶

### 10.2 課程報名 Email

新增：

管理員通知：

- 主旨：`[AIDC.work] 新課程報名 — {姓名}`
- 內容包含：
  - 報名編號
  - 課程名稱
  - 班期名稱
  - 8 週課表
  - 姓名
  - Email
  - 公司
  - 電話
  - 需求說明

客戶報名已收到：

- 主旨：`[AIDC.work] 課程報名申請已收到`
- 內容包含：
  - 待確認提示
  - 課程名稱
  - 班期名稱
  - 8 週課表

客戶狀態更新：

- 已確認
- 已取消
- 候補
- 已完成

## 11. 後台總覽整合

`/admin/dashboard` 應整合兩種資料：

- 待確認鐘點預約數
- 待確認課程報名數
- 本週即將到來的鐘點諮詢
- 近期開課班期
- 最新鐘點預約
- 最新課程報名

## 12. 商業規則

### 12.1 鐘點

- 只有 `AVAILABLE` 時段可被前台預約。
- 預約送出後，時段改為 `BOOKED`。
- 管理員取消預約後，時段恢復 `AVAILABLE`。
- 過去時間不可預約。
- 同一時段不可重複預約。

### 12.2 課程

- 只有 `OPEN` 班期可報名。
- 超過報名截止日不可報名。
- `CONFIRMED` 人數達到 capacity 時，班期可自動改為 `FULL`。
- `WAITLISTED` 不計入正式名額。
- 取消報名後不刪除資料，只更新狀態。
- 8 週課表建立後可手動調整單週時間。
- 課程報名不佔用鐘點諮詢時段。

## 13. 驗收條件

### 13.1 鐘點預約

- 客戶可完成鐘點預約。
- 管理員可收到預約 Email。
- 客戶可收到預約已收到 Email。
- 管理員可確認或取消預約。
- 狀態更新會寄信。
- 後台可批次建立可預約時段。

### 13.2 課程報名

- 管理員可建立入門班與進階班課程方案。
- 管理員可建立 8 週班期。
- 系統可自動產生 8 週課表。
- 前台可顯示課程班期與 8 週課表。
- 客戶可送出課程報名。
- 管理員可收到報名 Email。
- 客戶可收到報名已收到 Email。
- 管理員可確認、取消、候補報名。
- 狀態更新會寄信。

## 14. 開發階段規劃

### Phase 1：資料模型與種子資料

- 新增課程 Prisma schema
- 新增 migration
- 建立入門班與進階班 seed
- 建立示範班期與 8 週課表

### Phase 2：課程管理後台

- 課程方案列表與建立
- 班期列表與建立
- 8 週課表自動產生
- 單週課程時間調整

### Phase 3：課程前台報名

- `/courses` 顯示可報名班期
- `/courses/[slug]` 顯示課程詳情與 8 週課表
- 課程報名表
- 報名確認頁

### Phase 4：課程報名管理與 Email

- 課程報名管理列表
- 確認 / 取消 / 候補 / 完成
- Email 通知
- 後台總覽整合

### Phase 5：驗證與部署

- 本機 build
- 線上 migration
- 建立測試班期
- 測試課程報名
- 測試 Email
- 清理測試資料

## 15. 設計決策

- 鐘點預約與課程報名分開資料表，避免兩種業務規則互相牽制。
- 課程班期使用 `CourseCohort` 表示一期課程，`CourseSession` 表示每週上課時間。
- 報名狀態與班期狀態分離，方便管理額滿、候補、取消與結束。
- 延續現有管理後台登入與 Email 基礎，不新增外部服務。
- 第一版先不做付款，避免金流與發票複雜度阻塞預約功能。

