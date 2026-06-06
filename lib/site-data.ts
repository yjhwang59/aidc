export const siteConfig = {
  name: "AIDC.work",
  title: "AIDC.work — 企業 AI 發展顧問",
  description:
    "協助企業從 AI 工具使用，走向 AI 系統開發與 AI Agent 工作流落地。",
  author: "Jack Y. J. Hwang",
  email: "yjhwang59@gmail.com",
  tagline:
    "協助企業從 AI 工具使用，走向 AI 系統開發與 AI Agent 工作流落地。",
  version: process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0",
};

export const navItems = [
  { label: "關於我", href: "/about" },
  { label: "服務項目", href: "/services" },
  { label: "案例研究", href: "/cases" },
  { label: "課程與培訓", href: "/courses" },
  { label: "部落格", href: "/blog" },
  { label: "模板與工具", href: "/templates" },
  { label: "聯絡我們", href: "/contact" },
];

export const painPoints = [
  {
    title: "工具很多，卻不知道從哪裡開始",
    description:
      "團隊已採購多種 AI 工具，但缺乏一致的使用方法與導入優先順序，投資效益難以評估。",
  },
  {
    title: "原型有了，卻難以進入正式環境",
    description:
      "實驗性專案停留在 Demo 階段，缺少系統化設計、權限控管與維運考量。",
  },
  {
    title: "Agent 概念清楚，落地流程卻模糊",
    description:
      "知道 AI Agent 能自動化工作，但不清楚如何拆解任務、設計工作流與建立稽核機制。",
  },
  {
    title: "缺乏可複製的方法與內部能力",
    description:
      "顧問離開後流程就中斷，團隊沒有累積模板、文件與可持續演進的導入路線圖。",
  },
];

export const services = [
  {
    slug: "ai-tool-training",
    title: "AI 工具培訓",
    description:
      "協助團隊建立正確的 AI 工具使用習慣，從日常場景出發，讓成員知道何時用、如何用、如何評估成效。",
    href: "/services#ai-tool-training",
  },
  {
    slug: "vibe-coding",
    title: "Vibe Coding",
    description:
      "以 AI 輔助開發加速原型與系統建置，讓團隊在短時間內產出可驗證、可迭代的實際成果。",
    href: "/services#vibe-coding",
  },
  {
    slug: "ai-agent",
    title: "AI Agent 工作流",
    description:
      "設計與實作可運行的 Agent 自動化流程，涵蓋任務拆解、權限設計、錯誤處理與人工覆核節點。",
    href: "/services#ai-agent",
  },
  {
    slug: "ai-roadmap",
    title: "AI 導入藍圖",
    description:
      "評估企業現況，規劃階段性導入策略，建立從試點到規模化的清晰路線圖與衡量指標。",
    href: "/services#ai-roadmap",
  },
];

export const cases = [
  {
    slug: "manufacturing-ai-workflow",
    title: "製造業品質檢驗工作流自動化",
    industry: "製造業",
    serviceType: "AI Agent 工作流",
    description:
      "協助品管團隊將重複性檢驗報告整理流程自動化，縮短回報時間並保留完整稽核軌跡。",
    tags: ["AI Agent", "工作流", "製造業"],
  },
  {
    slug: "retail-vibe-coding-prototype",
    title: "零售業內部工具快速原型開發",
    industry: "零售業",
    serviceType: "Vibe Coding",
    description:
      "透過 Vibe Coding 工作坊，讓非工程背景團隊在兩天內完成庫存查詢工具的可用原型。",
    tags: ["Vibe Coding", "原型開發", "零售業"],
  },
  {
    slug: "finance-ai-adoption-roadmap",
    title: "金融服務業 AI 導入路線圖規劃",
    industry: "金融服務",
    serviceType: "AI 導入藍圖",
    description:
      "從現況盤點到分階段試點，協助決策團隊建立可追蹤、可溝通的 AI 導入計畫。",
    tags: ["導入路線圖", "策略規劃", "金融業"],
  },
];

export const blogPosts = [
  {
    slug: "ai-agent-pitfalls",
    title: "企業導入 AI Agent 的三個常見陷阱",
    date: "2026-05-20",
    category: "策略",
    description:
      "多數企業在導入 AI Agent 時，忽略了權限設計、錯誤處理與人工覆核節點，導致流程難以持續運行。",
    tags: ["AI Agent", "企業導入"],
  },
  {
    slug: "vibe-coding-team-adoption",
    title: "讓團隊真正用上 Vibe Coding 的三個關鍵",
    date: "2026-05-08",
    category: "實務",
    description:
      "Vibe Coding 不只是工具操作，更需要明確的任務拆解、驗收標準與程式碼審閱習慣。",
    tags: ["Vibe Coding", "團隊培訓"],
  },
  {
    slug: "ai-tool-roi-evaluation",
    title: "如何評估企業 AI 工具的實際效益",
    date: "2026-04-22",
    category: "方法論",
    description:
      "從時間節省、品質提升與流程可複製性三個面向，建立可量化的 AI 工具效益評估框架。",
    tags: ["AI 工具", "效益評估"],
  },
];

export const templates = [
  {
    slug: "ai-adoption-checklist",
    title: "AI 導入評估檢核表",
    format: "Markdown",
    description:
      "協助團隊在導入前盤點現況、風險與資源需求，作為內部討論與決策的基礎文件。",
    tags: ["檢核表", "導入評估"],
  },
  {
    slug: "agent-workflow-template",
    title: "AI Agent 工作流設計模板",
    format: "Markdown",
    description:
      "標準化的 Agent 工作流設計文件，涵蓋任務拆解、觸發條件、權限與覆核節點。",
    tags: ["AI Agent", "工作流"],
  },
  {
    slug: "vibe-coding-session-guide",
    title: "Vibe Coding 工作坊引導指南",
    format: "Markdown",
    description:
      "適合內部培訓或工作坊使用的引導流程，協助團隊在有限時間內產出可用原型。",
    tags: ["Vibe Coding", "工作坊"],
  },
];

export const courses = [
  {
    slug: "vibe-coding-workshop",
    title: "Vibe Coding 實戰工作坊",
    audience: "產品、業務與技術團隊",
    format: "實體 / 線上",
    duration: "2 天",
    description:
      "從需求定義到可運行原型，讓團隊親身體驗 AI 輔助開發的完整流程與協作模式。",
    tags: ["Vibe Coding", "工作坊"],
  },
  {
    slug: "ai-agent-design",
    title: "AI Agent 工作流設計實務",
    audience: "技術負責人、架構師",
    format: "實體 / 線上",
    duration: "1 天",
    description:
      "學習如何將業務流程轉化為可運行的 Agent 工作流，含權限、稽核與錯誤處理設計。",
    tags: ["AI Agent", "工作流"],
  },
  {
    slug: "enterprise-ai-tool-training",
    title: "企業 AI 工具實戰培訓",
    audience: "全體員工 / 部門團隊",
    format: "客製化培訓",
    duration: "半日至 2 天",
    description:
      "依企業實際場景設計培訓內容，建立團隊正確使用 AI 工具的習慣與評估方法。",
    tags: ["AI 工具", "企業培訓"],
  },
];
