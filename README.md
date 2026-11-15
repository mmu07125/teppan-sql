# 鐵板上・SQL｜鐵板燒餐廳管理系統

繁體中文資料庫課程作品。可編輯 SQL 並使用 sql.js 1.13.0 / SQLite 實際執行，無須後端伺服器，適合 GitHub Pages。

## 功能

- 案例背景、使用者需求與資料範圍。
- 4 張表的 ERD、完整欄位字典及 45 筆模擬資料。
- 8 組原始／修改版 SQL、預期值、實際運算結果或 SQLite 錯誤訊息。
- 查詢比較與口頭解說筆記。
- Web Worker 執行，8 秒逾時停止；每次執行從原始樣本開始。
- 所有程式與 SQL 引擎隨站附帶，不依賴第三方 CDN。

## 資料

自製虛構資料，日期 2026-11-01 至 2026-11-03。6 張餐桌、8 項餐點、10 張訂單、21 筆明細。已結帳營收為 NT$5,280。並非真實餐廳或個人資料。

## GitHub Pages 部署

1. 在 GitHub 建立公開 repository，例如 `teppan-sql`。
2. 將本資料夾**裡面的檔案**全部上傳到 main 分支根目錄。index.html 應位於根目錄；不要只上傳 ZIP，也不要額外包一層資料夾。
3. 開啟 Settings → Pages → Build and deployment，Source 選 Deploy from a branch。
4. Branch 選 main，資料夾選 / (root)，按 Save。
5. 等待部署成功，使用 GitHub 顯示的 Pages 網址。通常格式為 https://帳號.github.io/teppan-sql/ 。
6. 打開網址，執行「計算實際已收營收」確認結果是 5280，再以修改版確認為 5910。

官方說明：https://docs.github.com/en/pages/quickstart

## 本機預覽

使用任一靜態 HTTP 伺服器提供此資料夾，例如 VS Code 的 Live Server。不要直接雙擊使用 file:// 開啟；瀏覽器會限制載入 SQL 與 Worker。

## 解說準備

請在交作業前逐題實際操作，並使用「解說筆記」練習說明。作者姓名／學號請於寄信時填寫，不在公開網站預填個人資料。

## 來源與授權

- 案例資料、餐廳查詢與介面：本作品自製。
- 參考網站：https://database-query-practice.wy-lee9591.chatgpt.site/#case （僅參考教學內容的組織方式）。
- sql.js 1.13.0，MIT License，授權文件位於 LICENSE-sql.js。
- 引擎來源：https://cdn.jsdelivr.net/npm/sql.js@1.13.0/dist/sql-asm.js
- SQLite：https://www.sqlite.org/

## 限制

使用 SQLite 語法。每次執行的資料修改不持久保存，不含登入、訂位、成本、折扣或正式收銀功能。查詢超過 8 秒會終止；每個結果集最多顯示 500 列。此網站是教學查詢作品，並非正式餐廳營運系統。
