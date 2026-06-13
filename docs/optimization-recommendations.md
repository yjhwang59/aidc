# AIDC.work 流程優化建議書

> 撰寫日期：2026-06-13
> 範圍：本專案（Next.js 15 + Prisma + PostgreSQL，含諮詢預約、8 週課程報名、會員/管理後台）
> 目的：盤點開發、部署與業務流程中可再優化之處，依風險與投資報酬排序，供後續迭代取捨。

本建議書聚焦「流程」而非個別功能：包含**工程流程**（測試、CI/CD、發版、觀測）與**業務流程**（預約、報名、通知）。每項標註優先級、現況、風險與建議做法，並附對應檔案位置。

---

## 優先級總覽

| # | 項目 | 類型 | 優先級 |
|---|------|------|--------|
| 1 | 自動化測試幾乎為零 | 工程 | 🔴 P0 |
| 2 | Email 內容未跳脫 + 寄送無紀錄/重試 | 安全/業務 | 🔴 P0 |
| 3 | 後台登入無防爆破、無 CSRF 防護 | 安全 | 🔴 P0 |
| 4 | 部署未綁定 CI 結果、無回滾驗證 | 工程 | 🟠 P1 |
| 5 | Rate limit 為單機記憶體實作 | 工程 | 🟠 P1 |
| 6 | 課程報名名額流程不一致 | 業務 | 🟠 P1 |
| 7 | 缺乏錯誤追蹤與結構化日誌 | 工程 | 🟠 P1 |
| 8 | 無預約提醒信 / 行事曆邀請 | 業務 | 🟡 P2 |
| 9 | 預約 vs 課程報名邏輯重複 | 工程 | 🟡 P2 |
| 10 | 發版與變更紀錄手動 | 工程 | 🟡 P2 |

---

## 🔴 P0：高風險，建議優先處理

### 1. 自動化測試幾乎為零

**現況**
- `package.json` 無 test runner、無任何 `*.test.ts`（`node_modules` 以外）。
- CI（`.github/workflows/ci.yml`）只有 `lint` → `check:links` → `build`，**沒有型別檢查（tsc --noEmit）、沒有單元測試、沒有 E2E**。
- 課程規格書 `docs/course-booking-system-spec.md` §9 把「完成 E2E 測試」列為驗收條件，但實際未落實。

**風險**
- 核心金流相關邏輯（預約交易、時段鎖定、名額判斷、HMAC session 簽章、rate limit）改動後無法回歸驗證，重構/升級依賴時風險高。

**建議**
1. 導入 **Vitest** 做單元測試，優先覆蓋純邏輯：
   - `lib/auth/session.ts`（簽章/驗章、過期、竄改）
   - `lib/rate-limit.ts`（視窗重置、上限）
   - `lib/validations/booking.ts`（邊界值）
2. 導入 **Playwright** 覆蓋兩條關鍵 happy path：會員預約成功、課程報名成功。
3. CI 補上 `tsc --noEmit` 與 `vitest run`，並將 E2E 設為 PR 必過。

---

### 2. Email 內容未跳脫，且寄送是「射後不理」無紀錄

**現況**（`lib/email.ts`）
- 所有信件 HTML 以樣板字串直接插入使用者輸入：`${data.name}`、`${data.message}`、`${data.company}` 等，**未做 HTML escape**。
- 寄送採 fire-and-forget：`sendBookingCreatedEmails(...).catch(console.error)`（見 `app/api/bookings/route.ts:78`、`app/api/course-enrollments/route.ts:64`）。失敗只進 console，**DB 無任何寄送紀錄、無重試、無補發機制**。

**風險**
- **HTML/內容注入**：報名者於「需求說明」填入 HTML 或釣魚連結，會原樣呈現在寄給管理員與客戶的信中。
- **通知遺失無感知**：Resend 暫時故障時，客戶與管理員都不會收到信，且系統沒有任何紀錄可事後補發 — 對「兩個工作天內確認」的承諾是直接違約風險。

**建議**
1. 對所有插入信件的使用者欄位做 escape（簡單 `escapeHtml` 工具即可），或改用樣板引擎。
2. 新增 `Notification`（或 outbox）資料表，記錄每封信的 to/subject/status/providerMessageId/error，寄送前落庫、寄送後更新狀態。
3. 失敗加入重試（指數退避）或背景補發；後台可顯示「通知失敗」並提供「重寄」按鈕。

---

### 3. 後台登入缺乏防爆破與 CSRF 防護

**現況**
- `lib/rate-limit.ts` 目前只套用在預約與課程報名 API；**登入 API 沒有速率限制**（`app/api/auth/login`、`app/api/member/login`）。
- Cookie-based session + 狀態變更採 POST/PATCH，但未見 CSRF token 或 `SameSite`/Origin 驗證機制說明。
- Admin session 為無狀態 HMAC token（`email:expiresAt:sig`），**無法在到期前主動撤銷**；remember-me 達 30 天且不輪替。
- `validateAdminCredentials` 保留以 `ADMIN_PASSWORD` 環境變數明文比對的後門路徑（`lib/auth/session.ts:100-103`）。

**風險**
- 登入端點可被字典攻擊；長效不可撤銷的 session 一旦外洩風險擴大；跨站請求可能在管理員已登入時被誘導觸發狀態變更。

**建議**
1. 對登入端點套用 rate limit（以 IP + 帳號為 key），連續失敗鎖定/延遲。
2. 確認所有 session cookie 設定 `HttpOnly`、`Secure`、`SameSite=Lax`（或 Strict）；對後台 mutating API 加 Origin/Referer 檢查或 CSRF token。
3. 縮短預設 session 壽命並提供「登出所有裝置」（可改為 DB-backed session 或加 token 版本號）。
4. 環境變數明文後門僅限首次 bootstrap，建立帳號後即停用。

---

## 🟠 P1：中風險，建議近期排程

### 4. 部署未綁定 CI 成功、無回滾與健康驗證

**現況**（`.github/workflows/deploy.yml`）
- `push: main` 直接 SSH 到 `10.23.1.53` 執行 `git pull && docker compose up -d --build`。
- Deploy 與 CI 是**兩個獨立 workflow 並行觸發**，deploy 不等 CI 通過，**建置失敗的 commit 仍會嘗試部署**。
- 部署後只 `docker compose ps`，**無 HTTP 健康檢查門檻、無自動回滾**（Dockerfile 內已有 container HEALTHCHECK，但 workflow 未據此 gate）。
- 無 staging 環境，直上正式。

**建議**
1. 讓 deploy 以 `workflow_run`（CI 成功）為前置條件，或合併成單一 pipeline：CI 綠燈才 deploy。
2. 部署後對外部 URL 做健康檢查輪詢，失敗則 `docker compose` 回滾到前一個 image/commit。
3. 中期評估 staging 環境或 blue-green，降低正式環境中斷風險。

> 註：Dockerfile 啟動時已執行 `prisma migrate deploy` 且 `.env.local` 已被 `.gitignore` 涵蓋，這兩點現況良好，無需處理。

---

### 5. Rate limit 為單機記憶體實作

**現況**（`lib/rate-limit.ts`）
- 使用模組級 `Map`。多容器/多實例或重啟後狀態即遺失，限制可被繞過。

**建議**
- 目前單容器部署下尚可運作，但應在註解中標明此限制；一旦水平擴展或改 serverless，改用 Redis/Upstash 等共享儲存。

---

### 6. 課程報名名額流程不一致

**現況**（`app/api/course-enrollments/route.ts`）
- 建立報名時查詢了 `_count.enrollments(status: CONFIRMED)`（第 28 行），**但結果從未被使用** — 等於 dead code。
- 提交報名時**只檢查 cohort 為 `OPEN` 與報名截止日，不檢查名額**，因此可無限產生 `PENDING` 報名；名額只在管理員「確認」時於 `app/api/admin/course-enrollments/[id]/route.ts` 把關。
- 前台無「即時剩餘名額/額滿」呈現一致性保證（規格書 §3.1 要求顯示剩餘名額與報名狀態）。

**風險**
- 客戶可在實際已滿的班期送出報名，事後才被告知無法確認，體驗不佳。若這是「候補制」刻意設計，目前未在程式與文件中明確標示。

**建議**
1. 移除未使用的 `_count` 查詢，或實際用它在提交時判斷並回傳「已額滿，將列候補」。
2. 明確定義名額策略（硬性上限 vs 候補制）並寫入規格書與前台文案，使前後台一致。

---

### 7. 缺乏錯誤追蹤與結構化日誌

**現況**
- 全專案僅 `console.*`。無 error tracking（如 Sentry）、無結構化日誌、無正式 uptime 監控。

**建議**
- 接入錯誤追蹤服務，至少覆蓋 API route 的 500 與 email 失敗路徑；對首頁/健康端點設置外部 uptime 監控與告警。

---

## 🟡 P2：體驗與維護性優化

### 8. 無預約提醒信與行事曆邀請

**現況**
- Schema 已有 `NO_SHOW` 狀態，但**沒有任何約前提醒**機制；確認信也未附 `.ics` 行事曆檔。

**建議**
- 排程於約前 24h 寄提醒信，降低 no-show。
- 確認信附 `.ics`（低成本、高價值），方便客戶一鍵加入行事曆。規格書已將 Zoom/Meet 自動建會列為暫不納入，`.ics` 不在其列，可先做。

### 9. 預約與課程報名邏輯高度重複

**現況**
- `lib/email.ts` 中 booking 與 course-enrollment 的明細 HTML、狀態訊息對照表、status-update 寄信流程幾乎平行重複。API route 的 rate-limit→驗證→交易→寄信→錯誤對照樣板也重複。

**建議**
- 抽出共用的 `escapeHtml`、信件外框 layout、狀態訊息 helper 與 API 錯誤對照表，降低未來雙邊改動漏改的風險。

### 10. 發版與變更紀錄手動

**現況**
- 版本以 `release:patch` 手動 bump（commit 歷史可見多次 release 提交），無自動 changelog。

**建議**
- 採 Conventional Commits + 自動產生 changelog/tag（如 release-please 或 changesets），讓發版與紀錄與 PR 合併連動。

---

## 建議推進順序

1. **第一波（P0）**：補關鍵單元測試 + CI 加 `tsc`/`vitest`；Email escape 與寄送紀錄表；登入 rate limit。
2. **第二波（P1）**：CI gate 部署 + 健康檢查回滾；釐清課程名額策略並清除 dead code；接入錯誤追蹤。
3. **第三波（P2）**：提醒信/`.ics`；共用邏輯重構；發版自動化。

> 本文件僅為盤點與建議，未變更任何程式碼。各項可獨立排程，建議每完成一項回填對應 PR 連結與狀態。
