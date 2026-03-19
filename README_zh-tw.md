<h1 align="center">
    <img width="120" height="120" src="pic/logo.svg" alt=""><br>
    skport-auto-signin
</h1>

<p align="center">
    <img src="https://img.shields.io/github/license/NatsumeAoii/skport-auto-signin?style=flat-square" alt="">
    <img src="https://img.shields.io/github/stars/NatsumeAoii/skport-auto-signin?style=flat-square" alt="">
    <br><b>繁體中文</b>　<a href="/README.md">English</a>　<a href="/README_ru.md">Русский</a>
</p>

穩定、安全且免費的腳本，自動領取 SKPORT 每日簽到獎勵。
支援 **明日方舟：終末地**。支援多帳號。

## 特色

- **穩定** — 僅需最少設定。推薦版本包含重試機制、自動刷新 Token 及執行時間控制。
- **安全** — 自行部署至您的 Google Apps Script 專案，憑證不會離開您的 Google 帳戶。
- **免費** — Google Apps Script 是 Google 提供的免費服務。
- **簡單** — 在伺服器端運行，無需瀏覽器。自動透過 Discord 和/或 Telegram 發送結果。

## 快速開始

### 1. 建立 Google Apps Script 專案

前往 [Google Apps Script](https://script.google.com/home/start)，建立新專案（名稱自訂）。

### 2. 貼上腳本

開啟編輯器（Code.gs），將內容替換為
[`src/main-disc-tele.gs`](https://github.com/NatsumeAoii/skport-auto-signin/blob/main/src/main-disc-tele.gs) 的程式碼。

> 這是推薦使用的腳本。它同時支援 Discord 和 Telegram 通知、
> 自動刷新 Token、指數退避重試機制，以及執行時間限制。

### 3. 設定配置

編輯腳本頂部的 `profiles` 陣列與通知設定。
詳情請參閱下方的[配置說明](#配置說明)。

### 4. 手動執行一次

從函式下拉選單中選擇 `main`，然後點擊 **執行**。
在出現提示時授予所需權限。確認執行記錄顯示 `開始執行 > 執行完畢`。

![執行腳本](https://github.com/NatsumeAoii/skport-auto-signin/blob/main/pic/02.png)

### 5. 設定每日觸發條件

點擊左側的 **觸發條件**（時鐘圖示），然後點擊 **新增觸發條件**：

![觸發條件選單](https://github.com/NatsumeAoii/skport-auto-signin/blob/main/pic/03.png)
![新增觸發條件](https://github.com/NatsumeAoii/skport-auto-signin/blob/main/pic/04.png)

| 設定 | 值 |
|------|-----|
| 選擇您要執行的功能 | `main` |
| 選取活動來源 | 時間驅動 |
| 選取時間型觸發條件類型 | 日計時器 |
| 選取時段 | 選擇離峰時段（建議 09:00–15:00） |

![觸發條件設定](https://github.com/NatsumeAoii/skport-auto-signin/blob/main/pic/05.png)

> **替代方式：** 在編輯器中執行 `setupDailyTrigger()` 函式一次，即可取代手動設定觸發條件。它會在每日 09:00 為 `main` 建立觸發條件。

## 配置說明

```javascript
const profiles = [
  {
    SK_OAUTH_CRED_KEY: "",   // 必填 — 您的 SKPORT OAuth 憑證（來自 cookie）
    SK_TOKEN_CACHE_KEY: "",  // 選填 — 保持空白；腳本會自動取得
    id: "",                  // 必填 — 您的明日方舟：終末地遊戲 ID（數字）
    server: "2",             // 必填 — 亞洲 = "2"，美洲/歐洲 = "3"
    language: "en",          // 選填 — en | ja | zh_Hant | zh_Hans | ko | ru_RU
    accountName: ""          // 必填 — 通知訊息中顯示的暱稱
  }
];

// Discord 通知設定
const discord_notify = true;
const discordWebhook = "";    // 您的 Discord 頻道 Webhook URL

// Telegram 通知設定
const telegram_notify = false;
const myTelegramID = "";      // 您的 Telegram 使用者 ID
const telegramBotToken = "";  // 您的 Telegram 機器人 Token

// 顯示設定（選填）
const botDisplayName = "Arknights Endfield Auto Sign-In";
const botAvatarUrl = "https://i.imgur.com/TguAOiA.png";
const embedTitle = "Endfield Daily Check-In";
```

> 至少需要完整設定一個通知頻道（Discord 或 Telegram）。若兩者都未設定，腳本將提前結束。

### 取得 SK_OAUTH_CRED_KEY

1. 開啟 [SKPORT 簽到頁面](https://game.skport.com/endfield/sign-in) 並登入。
2. 開啟瀏覽器開發者工具主控台（F12 → Console 分頁）。
3. 貼上並執行 [`src/getToken.js`](https://github.com/NatsumeAoii/skport-auto-signin/blob/main/src/getToken.js) 的內容。
4. 憑證將被複製到剪貼簿（若剪貼簿存取被拒絕，則會顯示在對話框中）。
5. 將該值貼入腳本中的 `SK_OAUTH_CRED_KEY` 欄位。

> **安全提醒：** 請將 `SK_OAUTH_CRED_KEY` 視為密碼。切勿將其提交至公開的儲存庫。
> 為了更高的安全性，您可以將憑證儲存在 GAS 的 **Script Properties** 中，並使用
> `prop:` 前綴來引用它們（例如 `SK_OAUTH_CRED_KEY: "prop:MY_CRED"`）。腳本會透過
> `PropertiesService` 自動解析。

<details>
<summary><b>Profile 欄位參考</b></summary>

| 欄位 | 必填 | 說明 |
|------|------|------|
| `SK_OAUTH_CRED_KEY` | 是 | 來自 SKPORT cookie 的 OAuth 憑證。透過 `getToken.js` 取得。 |
| `SK_TOKEN_CACHE_KEY` | 否 | 保持空白。腳本會使用您的 OAuth 憑證自動取得並刷新此 Token。 |
| `id` | 是 | 您的明日方舟：終末地遊戲玩家 ID（數字）。 |
| `server` | 是 | `"2"` 為亞洲，`"3"` 為美洲/歐洲。 |
| `language` | 否 | 顯示語言：`en`、`ja`、`zh_Hant`、`zh_Hans`、`ko`、`ru_RU`。預設為 `en`。 |
| `accountName` | 是 | 在通知訊息中顯示的暱稱。 |

**多帳號：** 在 `profiles` 陣列中新增額外的物件即可。

</details>

<details>
<summary><b>Discord 通知設定</b></summary>

1. 將 `discord_notify` 設為 `true`。
2. **discordWebhook** — 為要接收通知的頻道[建立 Webhook](https://support.discord.com/hc/en-us/articles/228383668)。

</details>

<details>
<summary><b>Telegram 通知設定</b></summary>

1. 將 `telegram_notify` 設為 `true`。
2. **myTelegramID** — 向 [@IDBot](https://t.me/myidbot) 傳送 `/getid` 以取得您的數字 Telegram ID。
3. **telegramBotToken** — 向 [@BotFather](https://t.me/botfather) 傳送 `/newbot` 以建立機器人並取得 Token。[詳細指南](https://core.telegram.org/bots/features#botfather)。

</details>

## 範例

簽到成功會傳送「OK」。若今天已簽到過，則會傳送通知。

![範例截圖](https://github.com/NatsumeAoii/skport-auto-singin/blob/main/pic/01.png)

## 腳本版本

| 檔案 | 狀態 | 說明 |
|------|------|------|
| [`main-disc-tele.gs`](src/main-disc-tele.gs) | **推薦** | 統一腳本，支援 Discord + Telegram、自動刷新 Token、重試邏輯、執行時間控制及腳本層級鎖定。 |
| [`main-discord.gs`](src/main-discord.gs) | 舊版 | 僅 Discord，無自動刷新，無重試。保留供參考。 |
| [`main-telegram.gs`](src/main-telegram.gs) | 舊版 | 僅 Telegram，無自動刷新，無重試。保留供參考。 |
| [`getToken.js`](src/getToken.js) | 工具 | 瀏覽器主控台腳本，用於從 SKPORT cookie 中提取 `SK_OAUTH_CRED_KEY`。 |

## 資料夾結構

```
skport-auto-singin/
├── pic/                     # 文件中使用的截圖與標誌
│   ├── logo.svg
│   └── 01–05.png
├── src/
│   ├── main-disc-tele.gs    # 推薦：統一 GAS 腳本
│   ├── main-discord.gs      # 舊版：僅 Discord
│   ├── main-telegram.gs     # 舊版：僅 Telegram
│   └── getToken.js          # 憑證提取工具
├── README.md                # 英文文件
├── README_zh-tw.md          # 繁體中文文件
├── README_ru.md             # 俄文文件
└── LICENSE                  # MIT
```

## 疑難排解

| 症狀 | 原因 | 解決方式 |
|------|------|----------|
| 「User is not logged in」或「OAuth Key Expired」 | `SK_OAUTH_CRED_KEY` 已過期。 | 重新登入[簽到頁面](https://game.skport.com/endfield/sign-in)，再次執行 `getToken.js` 取得新的憑證。 |
| 「Token expired」（代碼 10000）但自動刷新失敗 | Token 與 OAuth 憑證皆已過期。 | 同上 — 重新取得 `SK_OAUTH_CRED_KEY`。 |
| 未收到通知 | 通知頻道未完整設定。 | 確認至少一個頻道的旗標為 `true`，且所有必填欄位（Webhook URL 或 Bot Token + Chat ID）皆已填入。 |
| 「Another instance is running」 | 前次執行仍在進行中，或鎖定未被釋放。 | 等待幾分鐘。GAS 腳本鎖定會自動過期。 |
| 觸發條件未執行 | 觸發條件設定錯誤或 GAS 配額已用盡。 | 確認觸發條件面板中存在觸發條件。檢查 GAS [配額](https://developers.google.com/apps-script/guides/services/quotas)。 |

## 更新紀錄

- **2026-02-23** — 重大更新：將 Discord 與 Telegram 合併至 `main-disc-tele.gs`，實裝 Rich Embed/HTML 格式化，新增 `SK_TOKEN_CACHE_KEY` 自動取得與刷新機制，支援在地化時間戳。
- **2026-02-14** — 修正錯誤。感謝 Keit (@keit32) 的協助。
- **2026-01-29** — 專案上線。

## 鳴謝

- **[canaria](https://github.com/canaria3406)** — Skport Auto Sign-In 腳本的原作者。

## 授權條款

[MIT](LICENSE)
