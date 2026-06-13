# 網站地圖

> AIDC.work 資訊架構與路由規劃

## 1. 網站架構總覽

```text
AIDC.work
│
├─ 首頁 (/)
│
├─ 關於我 (/about)
│
├─ 服務項目 (/services)
│   ├─ AI 工具培訓
│   ├─ Vibe Coding
│   ├─ AI 系統開發
│   ├─ AI Agent 工作流
│   └─ 企業 AI 導入路線圖
│
├─ 案例研究 (/cases)
│   └─ 個別案例 (/cases/[slug])
│
├─ 課程與培訓 (/courses)
│   └─ 個別課程 (/courses/[slug])
│       ├─ 課程報名 (/courses/[slug]/enroll/[cohortId])
│       └─ 課程報名確認 (/courses/enroll/confirmation/[id])
│
├─ 部落格 (/blog)
│   └─ 個別文章 (/blog/[slug])
│
├─ 模板與工具 (/templates)
│   └─ 個別模板 (/templates/[slug])
│
├─ 聯絡我們 (/contact)
├─ 預約諮詢 (/booking)
│   └─ 預約確認 (/booking/confirmation/[id])
└─ 管理後台 (/admin) [需登入]
    ├─ 總覽 (/admin/dashboard)
    ├─ 預約管理 (/admin/bookings)
    ├─ 時段管理 (/admin/slots)
    ├─ 課程方案 (/admin/course-programs)
    ├─ 課程班期 (/admin/course-cohorts)
    ├─ 課程報名 (/admin/course-enrollments)
    └─ 帳號設定 (/admin/settings)
```

## 2. 路由規格

### 2.1 靜態頁面

| 路由 | 頁面標題（建議） | 目的 |
|------|------------------|------|
| `/` | AIDC.work — 企業 AI 發展顧問 | 品牌入口、服務摘要、精選內容 |
| `/about` | 關於 Jack Y. J. Hwang | 建立個人信任與專業 credibility |
| `/services` | 服務項目 | 說明顧問服務範圍與合作方式 |
| `/contact` | 聯絡我們 | 合作洽詢說明與聯絡資訊 |
| `/booking` | 預約諮詢 | 線上預約諮詢時段 |
| `/courses/[slug]/enroll/[cohortId]` | 課程報名 | 報名指定課程班期 |
| `/courses/enroll/confirmation/[id]` | 課程報名確認 | 顯示課程報名結果與待確認提示 |

### 2.2 內容列表頁

| 路由 | 頁面標題（建議） | 內容來源 |
|------|------------------|----------|
| `/cases` | 案例研究 | `content/cases/` |
| `/courses` | 課程與培訓 | `content/courses/` |
| `/blog` | 部落格 | `content/blog/` |
| `/templates` | 模板與工具 | `content/templates/` |

### 2.3 內容詳情頁（動態路由）

| 路由模式 | 範例 | 內容來源 |
|----------|------|----------|
| `/cases/[slug]` | `/cases/manufacturing-ai-workflow` | `content/cases/manufacturing-ai-workflow.mdx` |
| `/courses/[slug]` | `/courses/vibe-coding-workshop` | `content/courses/vibe-coding-workshop.mdx` |
| `/blog/[slug]` | `/blog/ai-agent-pitfalls` | `content/blog/ai-agent-pitfalls.mdx` |
| `/templates/[slug]` | `/templates/ai-adoption-checklist` | `content/templates/ai-adoption-checklist.mdx` |

## 3. 頁面內容規劃

### 3.1 首頁 `/`

| 區塊 | 內容 |
|------|------|
| Hero | 品牌定位語、簡短價值主張、主要 CTA（聯絡 / 了解服務） |
| 服務摘要 | 五大服務領域卡片，連結至 `/services` |
| 精選案例 | 2–3 則案例摘要，連結至 `/cases` |
| 最新文章 | 3 篇最新部落格，連結至 `/blog` |
| 精選模板 | 2–3 個實用模板，連結至 `/templates` |
| CTA 區塊 | 引導至 `/contact` 或 `/courses` |

### 3.2 關於我 `/about`

- 個人簡介與專業背景
- 服務企業類型與產業經驗
- 核心理念與合作方式
- 專業領域標籤（AI 工具、Vibe Coding、Agent 工作流等）

### 3.3 服務項目 `/services`

| 服務區塊 | 說明重點 |
|----------|----------|
| AI 工具培訓 | 協助團隊有效使用 AI 工具，建立正確使用習慣 |
| Vibe Coding | 以 AI 輔助開發加速原型與系統建置 |
| AI 系統開發 | 從需求到落地的系統設計與實作顧問 |
| AI Agent 工作流 | 設計與實作可運行的 Agent 自動化流程 |
| 企業 AI 導入路線圖 | 評估現況、規劃階段性導入策略 |

### 3.4 案例研究 `/cases`

- 列表：案例標題、產業、服務類型、摘要、標籤
- 詳情：背景、挑戰、解法、成果、可複製經驗

### 3.5 課程與培訓 `/courses`

- 列表：課程名稱、對象、形式、時數、摘要
- 詳情：學習目標、大綱、適合對象、報名或洽詢方式

### 3.6 部落格 `/blog`

- 列表：文章標題、日期、分類、摘要
- 詳情：完整文章內容，可含程式碼、圖表、引用

### 3.7 模板與工具 `/templates`

- 列表：模板名稱、用途、格式、摘要
- 詳情：使用說明、下載連結或內嵌內容

### 3.8 聯絡我們 `/contact`

- 合作洽詢說明
- 線上預約入口（連結至 `/booking`）
- Email 聯絡方式與合作流程簡述

### 3.9 預約諮詢 `/booking`

- 選擇諮詢服務類型
- 選擇可預約時段（未來 4 週）
- 填寫姓名、Email、公司、需求說明
- 預約確認頁（預約編號與待確認提示）

## 4. 全域導覽

### 4.1 主導覽列（Header）

```text
Logo → 首頁
關於我 | 服務項目 | 案例研究 | 課程與培訓 | 部落格 | 模板與工具 | 聯絡我們
```

### 4.2 頁尾（Footer）

| 區塊 | 內容 |
|------|------|
| 品牌 | AIDC.work 簡述與定位語 |
| 快速連結 | 主要路由連結 |
| 聯絡 | Email 或社群 |
| 版權 | © Jack Y. J. Hwang |

## 5. 內容目錄對應

```text
content/
├─ blog/
│   └─ [slug].mdx          → /blog/[slug]
├─ cases/
│   └─ [slug].mdx          → /cases/[slug]
├─ courses/
│   └─ [slug].mdx          → /courses/[slug]
└─ templates/
    └─ [slug].mdx          → /templates/[slug]
```

## 6. URL 命名慣例

- 使用小寫英文與連字號（kebab-case）
- 語意清楚、利於 SEO
- 範例：`ai-agent-workflow-design`、`enterprise-ai-roadmap`

## 7. 未來可能新增的路由

| 路由 | 說明 | 優先級 |
|------|------|--------|
| `/search` | 全站內容搜尋 | 中 |
| `/tags/[tag]` | 依標籤瀏覽 | 中 |
| `/newsletter` | 電子報訂閱 | 低 |
| `/privacy` | 隱私權政策 | 低（若有表單收集資料時提升） |

## 8. 相關文件

- [產品需求](./product-requirements.md)
- [內容策略](./content-strategy.md)
- [品牌指南](./brand-guide.md)
