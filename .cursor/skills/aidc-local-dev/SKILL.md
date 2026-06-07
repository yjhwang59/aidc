---
name: aidc-local-dev
description: >-
  Starts AIDC.work local Next.js dev server on port 3163 after releasing port
  conflicts. Use when the user asks for 本機啟動、start local service、
  localhost:3163、dev 重啟、關 port 3163、dev:fresh, or starting aidc-work locally.
---

# AIDC.work 本機啟動

## 流程

使用者要求本機啟動時，**依序執行**（勿逐步詢問確認）：

1. **檢查是否 port 3163 佔用, 先釋放**
2. **啟動 http://localhost:3163**

## 執行方式

專案根目錄：

```powershell
npm run dev:fresh
```

或直接：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ./scripts/start-dev.ps1
```

僅釋放埠、不啟動 dev：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ./scripts/start-dev.ps1 -CleanupOnly
```

## Agent 操作規範

1. 在 `aidc-work` 根目錄執行 `npm run dev:fresh`。
2. 若需背景執行（Agent 終端）：`npm run dev:fresh` 用 `block_until_ms: 0` 啟動，等待輸出出現 `Ready` 或 `Local: http://localhost:3163`。
3. 若出現 `EADDRINUSE`：再跑 `-CleanupOnly`，確認 3163 已釋放後重試。
4. 成功後回報：**http://localhost:3163** 與 `package.json` 版本。

## 安全限制

- **只**結束正在 **LISTEN** port **3163** 的行程；禁止 `killall node` 或大量終止 Node。
- 同一 PID 同一輪只停止一次。
- 優先 `Get-NetTCPConnection`；無結果時以 `netstat -ano` 後援。
- 清除 Next.js stale lock：`.next/dev/lock`（若存在）。

## 專案設定

| 項目 | 值 |
|------|-----|
| Dev 指令 | `npm run dev` → `next dev -p 3163` |
| 本機 URL | http://localhost:3163 |
| 啟動腳本 | `scripts/start-dev.ps1` |
| npm 別名 | `dev:fresh` |

## 驗證

```powershell
curl -s -o NUL -w "%{http_code}" http://localhost:3163
```

預期 HTTP **200**，頁面標題含 **AIDC.work**。
