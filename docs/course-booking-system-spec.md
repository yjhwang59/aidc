# 課程班期預約系統開發規格書

## 1. 目標

AIDC.work 目前已支援「單次諮詢預約」。本規格書定義第二種預約型態：「8 週一期課程報名」。

系統需同時支援：

- 單次鐘點諮詢：客戶選擇單一時段預約。
- 8 週課程班期：客戶報名一整期固定週期課程。

本階段目標是擴充既有預約後台，而不是重做系統。

## 2. 使用者角色

### 2.1 訪客 / 客戶

- 瀏覽可報名課程班期。
- 查看 8 週課程日期與時間。
- 填寫課程報名資料。
- 收到報名送出通知。
- 報名經管理員確認後，收到確認或取消通知。

### 2.2 管理員

- 建立課程方案。
- 建立 8 週班期。
- 管理每週上課時段。
- 查看課程報名名單。
- 確認、取消、候補或完成報名。
- 寄出狀態通知信。

## 3. 前台功能

### 3.1 課程列表頁 `/courses`

現有課程頁需新增「可報名班期」區塊。

顯示欄位：

- 課程名稱
- 班期名稱
- 開課日期
- 每週上課時間
- 總週數，預設 8 週
- 剩餘名額
- 報名狀態
- 報名按鈕

### 3.2 課程詳情頁 `/courses/[slug]`

顯示課程介紹與可報名班期。

每個班期顯示：

- 班期名稱
- 起訖日期
- 報名截止日
- 人數上限
- 已報名人數
- 剩餘名額
- 8 週課表

8 週課表欄位：

- 週次
- 日期
- 開始時間
- 結束時間
- 備註或主題，選填

### 3.3 課程報名頁 `/courses/[slug]/enroll/[cohortId]`

報名表欄位：

- 姓名，必填
- Email，必填
- 公司 / 組織，選填
- 電話，選填
- 需求說明，選填

送出後：

- 建立報名紀錄，狀態為 `PENDING`
- 寄出管理員通知信
- 寄出客戶報名已收到通知信
- 導向確認頁

### 3.4 報名確認頁 `/courses/enroll/confirmation/[id]`

顯示：

- 報名編號
- 報名狀態
- 課程名稱
- 班期名稱
- 8 週課表
- 報名人姓名與 Email
- 待確認提示

## 4. 後台功能

### 4.1 後台導航

後台新增選單：

- 課程方案
- 課程班期
- 課程報名

既有選單保留：

- 總覽
- 預約管理
- 時段管理
- 帳號設定

### 4.2 課程方案管理 `/admin/course-programs`

管理員可建立、編輯、停用課程方案。

欄位：

- 課程名稱
- Slug
- 課程說明
- 預設總週數，預設 8
- 每次上課分鐘數
- 預設人數上限
- 是否啟用
- 排序

操作：

- 新增課程方案
- 編輯課程方案
- 啟用 / 停用

### 4.3 課程班期管理 `/admin/course-cohorts`

管理員可依課程方案建立班期。

建立班期欄位：

- 所屬課程方案
- 班期名稱
- 第一週日期
- 每週星期
- 開始時間
- 結束時間
- 總週數，預設 8
- 報名截止日
- 人數上限
- 狀態

建立後系統自動產生 `CourseSession`，例如 8 週共 8 筆上課時段。

班期狀態：

- `DRAFT`：草稿
- `OPEN`：開放報名
- `FULL`：額滿
- `CLOSED`：停止報名
- `COMPLETED`：已結束
- `CANCELLED`：已取消

操作：

- 新增班期
- 編輯班期基本資料
- 手動調整單週課程時間
- 開放 / 關閉報名
- 查看報名名單

### 4.4 課程報名管理 `/admin/course-enrollments`

顯示所有課程報名資料。

列表欄位：

- 報名者姓名
- Email
- 公司
- 電話
- 課程名稱
- 班期名稱
- 報名狀態
- 報名時間

篩選：

- 全部
- 待確認
- 已確認
- 已取消
- 候補
- 已完成

詳細資料：

- 報名資料
- 需求說明
- 8 週課表
- 管理備註

操作：

- 確認報名並寄信
- 取消報名並寄信
- 設為候補並寄信
- 標記完成
- 儲存管理備註

## 5. 資料模型

### 5.1 CourseProgram

```text
id              String
slug            String unique
title           String
description     String?
durationWeeks   Int default 8
sessionDurationMin Int default 120
capacity        Int default 12
isActive        Boolean default true
sortOrder       Int default 0
createdAt       DateTime
updatedAt       DateTime
```

### 5.2 CourseCohort

```text
id                    String
courseProgramId       String
title                 String
startsAt              DateTime
endsAt                DateTime
registrationDeadline  DateTime?
capacity              Int
status                CourseCohortStatus
createdAt             DateTime
updatedAt             DateTime
```

### 5.3 CourseSession

```text
id          String
cohortId    String
weekNumber  Int
startAt     DateTime
endAt       DateTime
topic       String?
createdAt   DateTime
updatedAt   DateTime
```

### 5.4 CourseEnrollment

```text
id           String
cohortId     String
status       CourseEnrollmentStatus
name         String
email        String
company      String?
phone        String?
message      String?
adminNote    String?
confirmedAt  DateTime?
cancelledAt  DateTime?
createdAt    DateTime
updatedAt    DateTime
```

### 5.5 Enum

```text
CourseCohortStatus:
- DRAFT
- OPEN
- FULL
- CLOSED
- COMPLETED
- CANCELLED

CourseEnrollmentStatus:
- PENDING
- CONFIRMED
- CANCELLED
- WAITLISTED
- COMPLETED
```

## 6. API 規格

### 6.1 公開 API

#### GET `/api/course-programs`

取得啟用中的課程方案與可報名班期。

#### GET `/api/course-cohorts?programId=...`

取得指定課程方案的班期。

#### POST `/api/course-enrollments`

建立課程報名。

Request：

```json
{
  "cohortId": "string",
  "name": "string",
  "email": "string",
  "company": "string",
  "phone": "string",
  "message": "string"
}
```

Response：

```json
{
  "enrollment": {
    "id": "string",
    "status": "PENDING"
  }
}
```

### 6.2 管理 API

#### GET `/api/admin/course-programs`

取得課程方案列表。

#### POST `/api/admin/course-programs`

建立課程方案。

#### PATCH `/api/admin/course-programs/[id]`

更新課程方案。

#### GET `/api/admin/course-cohorts`

取得班期列表。

#### POST `/api/admin/course-cohorts`

建立班期並自動產生 8 週課表。

#### PATCH `/api/admin/course-cohorts/[id]`

更新班期基本資料。

#### PATCH `/api/admin/course-sessions/[id]`

調整單週課程時段或主題。

#### GET `/api/admin/course-enrollments`

取得報名列表。

#### PATCH `/api/admin/course-enrollments/[id]`

更新報名狀態與管理備註。

## 7. Email 通知

### 7.1 報名送出通知

寄給管理員：

- 主旨：`[AIDC.work] 新課程報名 — {姓名}`
- 內容：
  - 報名編號
  - 課程名稱
  - 班期名稱
  - 8 週課表
  - 姓名
  - Email
  - 公司
  - 電話
  - 需求說明

寄給客戶：

- 主旨：`[AIDC.work] 課程報名申請已收到`
- 內容：
  - 待確認提示
  - 課程與班期資訊
  - 8 週課表

### 7.2 狀態更新通知

管理員執行狀態更新時寄給客戶：

- 確認報名
- 取消報名
- 設為候補
- 標記完成

## 8. 商業規則

- 只有 `OPEN` 狀態的班期可以報名。
- 超過報名截止日不可報名。
- `CONFIRMED` 報名數達到 capacity 時，班期可自動標記為 `FULL`。
- `WAITLISTED` 不計入正式名額。
- 取消報名後不刪資料，只更新狀態。
- 管理備註不寄給客戶。
- 課程報名與單次諮詢預約分開資料表，避免業務邏輯互相干擾。

## 9. 驗收條件

### 9.1 前台

- 使用者可看到可報名課程班期。
- 使用者可看到完整 8 週課表。
- 使用者可送出課程報名。
- 報名後可看到確認頁。
- 報名後管理員可收到 Email。
- 報名後客戶可收到 Email。

### 9.2 後台

- 管理員可建立課程方案。
- 管理員可建立 8 週班期。
- 系統可自動產生 8 週課表。
- 管理員可調整單週課程時間。
- 管理員可查看報名資料。
- 管理員可確認、取消、候補報名。
- 狀態更新會寄 Email 給客戶。

### 9.3 權限

- 未登入不可進入任何 `/admin/course-*` 頁面。
- 未登入不可呼叫任何 `/api/admin/course-*` API。

## 10. 建議開發順序

1. 新增 Prisma schema 與 migration。
2. 新增課程方案後台 CRUD。
3. 新增班期建立與 8 週課表自動產生。
4. 新增課程報名前台頁面。
5. 新增課程報名 API。
6. 新增課程報名 Email 通知。
7. 新增課程報名後台管理。
8. 整合後台總覽統計。
9. 完成 E2E 測試與線上驗證。

## 11. 暫不納入本階段

- 線上付款
- 發票
- 多講師管理
- Zoom / Google Meet 自動建立會議連結
- 學員登入專區
- 課程教材下載權限
- 出席紀錄

