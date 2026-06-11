# 開發流程

> AIDC.work 專案開發、內容管理與協作規範

## 1. 專案概述

| 項目 | 說明 |
|------|------|
| 專案名稱 | AIDC.work |
| 技術棧 | Next.js App Router、TypeScript、Tailwind CSS、MDX/Markdown |
| 架構 | Next.js SSR + API Routes（內容仍為 Markdown 靜態讀取） |
| 資料庫 | Neon PostgreSQL + Prisma（預約服務） |
| 部署 | Vercel（`vercel-build` 含 migrate deploy） |

## 2. 專案結構（預期）

```text
aidc-work/
├─ app/                    # Next.js App Router 頁面
│   ├─ page.tsx            # 首頁
│   ├─ about/
│   ├─ services/
│   ├─ cases/
│   ├─ courses/
│   ├─ blog/
│   ├─ templates/
│   └─ contact/
├─ components/             # 共用 UI 元件
├─ content/                # Markdown / MDX 內容
│   ├─ blog/
│   ├─ cases/
│   ├─ courses/
│   └─ templates/
├─ lib/                    # 工具函式（內容讀取、格式化等）
├─ public/                 # 靜態資源
├─ docs/                   # 專案文件
├─ AGENTS.md               # AI Agent 開發指引
└─ package.json
```

## 3. 開發環境設定

### 3.1 前置需求

- Node.js 18+（建議 LTS）
- npm、pnpm 或 yarn（依專案設定）
- Git

### 3.2 本機啟動（預期流程）

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 建置
npm run build

# 預覽建置結果
npm run start
```

### 3.3 環境變數

複製 `.env.example` 為 `.env.local`，填入 Neon `DATABASE_URL`、管理員帳密、`SESSION_SECRET` 與 Resend 設定。**勿提交至版本庫**。

```bash
# 首次設定資料庫
npm run db:migrate
npm run db:seed

# 可選：建立示範可預約時段
SEED_DEMO_SLOTS=true npm run db:seed
```

## 4. 分支策略

### 4.1 主要分支

| 分支 | 用途 |
|------|------|
| `main` | 穩定版本，可部署至正式環境 |
| `feature/*` | 新功能開發 |
| `content/*` | 純內容新增或更新 |
| `fix/*` | 錯誤修復 |

### 4.2 分支命名慣例

```text
feature/blog-list-page
feature/mdx-renderer
content/ai-agent-pitfalls-article
fix/contact-form-validation
```

## 5. 開發工作流程

```text
1. 從 main 建立分支
2. 本機開發與測試
3. 提交 commit（訊息清楚描述變更目的）
4. 推送分支並建立 Pull Request
5. Code Review（自我檢核或他人審閱）
6. 合併至 main
7. 部署（CI/CD 或手動）
```

## 6. Commit 訊息規範

採用簡潔的動詞開頭，說明「為什麼」多於「做了什麼」。

| 類型 | 用途 | 範例 |
|------|------|------|
| `feat` | 新功能 | `feat: 新增部落格列表頁與 slug 路由` |
| `fix` | 錯誤修復 | `fix: 修正案例頁 frontmatter 日期格式` |
| `content` | 內容變更 | `content: 新增 AI Agent 導入陷阱文章` |
| `style` | 樣式調整 | `style: 調整首頁 Hero 區塊間距` |
| `refactor` | 重構 | `refactor: 抽取 MDX 內容讀取邏輯至 lib` |
| `docs` | 文件 | `docs: 更新網站地圖與內容策略` |
| `chore` | 維護 | `chore: 更新依賴版本` |

## 7. 內容開發流程

內容變更與程式碼變更遵循相同 Git 流程，但可獨立以 `content/*` 分支進行。

### 7.1 新增文章

```text
1. 在 content/blog/ 建立 [slug].mdx
2. 填寫 frontmatter（title, description, date, tags 等）
3. 撰寫正文（繁體中文，參考 content-strategy.md）
4. 本機預覽確認渲染正確
5. 提交 PR
```

### 7.2 新增案例 / 課程 / 模板

流程同上，分別放入對應的 `content/` 子目錄。

### 7.3 Frontmatter 範本

```yaml
---
title: "文章或資源標題"
description: "簡短摘要，用於 SEO 與列表顯示"
date: "2026-06-05"
author: "Jack Y. J. Hwang"
tags: ["AI Agent", "企業導入"]
category: "策略"
draft: false
---
```

## 8. 程式碼規範

### 8.1 一般原則

- 使用 TypeScript，避免 `any`
- 遵循現有目錄結構與命名慣例
- 不引入非必要依賴
- 元件保持單一職責，避免過度抽象
- 註解僅用於非顯而易見的業務邏輯

### 8.2 樣式

- 使用 Tailwind CSS utility classes
- 響應式設計：mobile-first
- 色彩與字體遵循 [品牌指南](./brand-guide.md)

### 8.3 內容讀取

- 內容與呈現分離：從 `content/` 讀取，不在元件中硬編碼長文
- 使用一致的 slug 生成與路由對應規則

## 9. 測試與品質檢核

### 9.1 發布前檢核

- [ ] `npm run build` 成功無錯誤
- [ ] 新增頁面可正常瀏覽
- [ ] 響應式版面在手機與桌機可讀
- [ ] 連結無死鏈
- [ ] 內容符合品牌語氣與繁體中文規範
- [ ] 無敏感資訊或未授權客戶資料

### 9.2 MVP 階段

正式測試框架非必須，但建置必須通過。Post-MVP 可考慮加入 ESLint、Prettier 與基本 E2E 測試。

## 10. 部署

### 10.1 架構

專案使用 Next.js `output: "export"` 產出靜態檔案至 `out/`，並以 **Docker + Nginx** 提供正式環境服務。遠端部署模式與 **fyhGoogle** 相同：SSH 至 `10.23.1.53`，`git pull` 後在主機上 `docker compose up -d --build`。

### 10.2 CI / CD 流程

| Workflow | 觸發 | 用途 |
|----------|------|------|
| `.github/workflows/ci.yml` | PR、`main` push | `npm ci`、lint、build 品質檢查 |
| `.github/workflows/deploy.yml` | `main` push、手動 | SSH 部署至 `10.23.1.53` |

```text
開發 → PR → CI 通過 → 合併 main
                          ↓
              deploy.yml：SSH → git pull → docker compose up -d --build
```

### 10.3 版本發布（Bump）

本機或 Agent 發布時，使用 patch 版本遞增：

```bash
npm run release:patch   # 更新 package.json 版本（不建立 git tag）
git add .
git commit -m "chore(release): bump version to vX.Y.Z"
git push origin main
```

推送後 GitHub Actions 會自動部署至 `10.23.1.53`。頁尾會顯示 `NEXT_PUBLIC_APP_VERSION`（建置時由 `package.json` 注入）。

### 10.4 本機 Docker 驗證

```bash
# 建置映像
npm run docker:build

# 以 docker compose 啟動（http://localhost:3163）
npm run docker:up

# 停止
npm run docker:down
```

### 10.5 遠端主機自動部署（10.23.1.53）

與 **fyhGoogle** 相同設定，沿用既有 SSH 金鑰與主機環境：

| 項目 | 值 |
|------|-----|
| 主機 | `10.23.1.53` |
| SSH 使用者 | `yjhwang` |
| 遠端目錄 | `/home/yjhwang/aidc-work` |
| 對外 URL | `http://10.23.1.53:3163` |
| 映像 | `aidc-work:latest`（主機本機 build） |

#### GitHub Secret

與 fyhGoogle GitLab CI 相同，只需 **`SSH_PRIVATE_KEY`**（若已在 org / repo 層級設定過，aidc-work 可直接沿用）。

#### 主機首次初始化（只需一次）

```bash
ssh yjhwang@10.23.1.53
git clone https://github.com/yjhwang59/aidc-work.git /home/yjhwang/aidc-work
cd /home/yjhwang/aidc-work
docker compose up -d --build
```

#### 手動部署

**已 push 至 GitHub：**

```powershell
# Windows（SSH git pull，同 GitLab deploy_remote）
bash scripts/deploy-remote.sh
```

**本機未 push、需直接上傳程式碼：**

```powershell
.\deploy_remote.ps1
```

（與 fyhGoogle 相同：tar 打包 → scp → 遠端解壓 → `docker compose up -d --build`）

## 11. AI 輔助開發

使用 Cursor 或其他 AI 工具時，請參考：

- 專案根目錄 `AGENTS.md` — Agent 開發指引
- `docs/prompt-templates.md` — 常用 Prompt 模板

**原則**：

- AI 產出需人工審閱，特別是內容與客戶相關資訊
- 不盲目引入 AGENTS.md 未列出的依賴
- 保持最小必要變更範圍

## 12. 相關文件

- [Issue 模板](./issue-template.md)
- [PR 模板](./pr-template.md)
- [Prompt 模板](./prompt-templates.md)
- [產品需求](./product-requirements.md)
- [網站地圖](./site-map.md)
