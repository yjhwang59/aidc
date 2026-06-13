export const introCourseSessions = [
  {
    topic: "AI 系統開發概念與專案選題",
    description:
      "AI 工具角色、Vibe Coding 流程、需求拆解、選定小系統題目。",
  },
  {
    topic: "使用者流程與前端設計",
    description: "使用者旅程、頁面結構、表單流程、UI/UX、RWD 概念。",
  },
  {
    topic: "Vibe Coding 基礎實作",
    description: "使用 Cursor / Codex 產生頁面、元件拆分、樣式調整。",
  },
  {
    topic: "表單設計與資料驗證",
    description: "表單欄位、必填規則、錯誤提示、送出狀態、使用者回饋。",
  },
  {
    topic: "資料儲存與後端 API",
    description: "API Route、資料模型、簡單資料庫概念、表單資料寫入。",
  },
  {
    topic: "後台列表與資料管理",
    description: "查詢資料、列表頁、狀態管理、基本管理後台。",
  },
  {
    topic: "測試、修正與部署準備",
    description: "功能測試、錯誤處理、環境變數、版本管理、部署檢查表。",
  },
  {
    topic: "部署上線與成果發表",
    description: "雲端部署概念、正式上線、Demo 與回饋。",
  },
];

export const advancedCourseSessions = [
  {
    topic: "AI 系統開發生命週期 SDLC",
    description: "需求、設計、開發、測試、部署、維運與 AI 輔助開發角色。",
  },
  {
    topic: "Agile 專案管理與需求拆解",
    description: "User Story、Backlog、Sprint、驗收條件、Issue / PR 流程。",
  },
  {
    topic: "系統架構設計",
    description: "前後端分離、API、服務邊界、權限、錯誤處理、系統圖。",
  },
  {
    topic: "資料庫設計與資料模型",
    description: "ERD、資料表、關聯、索引、Migration、Prisma / SQL 基礎。",
  },
  {
    topic: "後端 API 與商業邏輯",
    description: "REST API、驗證、交易流程、狀態機、錯誤回應、Rate Limit。",
  },
  {
    topic: "AI 功能整合與工作流",
    description: "LLM API、Prompt 管理、RAG 概念、Agent 工作流、人工覆核。",
  },
  {
    topic: "雲端部署與 DevOps",
    description: "Docker、環境變數、CI/CD、Log、監控、備份、Rollback。",
  },
  {
    topic: "安全、維運與專案總結",
    description: "權限、資料保護、測試策略、維運清單、成本估算、成果發表。",
  },
];

export const courseProgramSeeds = [
  {
    slug: "ai-system-development-intro",
    title: "AI 系統開發入門班：Vibe Coding 從設計到上線",
    description:
      "8 週帶領團隊從需求拆解、前端原型、表單驗證、API 與資料儲存，一路完成可部署的小型 AI 輔助系統。",
    level: "入門",
    durationWeeks: 8,
    sessionDurationMin: 120,
    capacity: 12,
    sortOrder: 1,
    sessions: introCourseSessions,
  },
  {
    slug: "ai-system-development-advanced",
    title: "AI 系統開發進階班：架構、專案管理與雲端部署",
    description:
      "8 週聚焦 AI 系統開發生命週期、架構設計、資料模型、後端 API、AI 工作流與部署維運，適合已有原型經驗的團隊。",
    level: "進階",
    durationWeeks: 8,
    sessionDurationMin: 120,
    capacity: 10,
    sortOrder: 2,
    sessions: advancedCourseSessions,
  },
];

export function getDefaultCourseSessions(programSlug?: string) {
  const program = courseProgramSeeds.find((item) => item.slug === programSlug);
  return program?.sessions ?? introCourseSessions;
}
