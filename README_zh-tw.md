<h1 align="center">
    <img width="120" height="120" src="pic/logo.svg" alt=""><br>
    skport-auto-sign
</h1>

<p align="center">
    <img src="https://img.shields.io/github/license/canaria3406/skport-auto-sign?style=flat-square" alt="">
    <img src="https://img.shields.io/github/stars/canaria3406/skport-auto-sign?style=flat-square" alt="">
    <br><b>繁體中文</b>　<a href="/README.md">English</a>
</p>

skport自動簽到script，每月約可自動領取260石，堪比蚊子腿。  
支援 明日方舟：終末地 。支援多帳號。

## 特色
* **輕巧** - 僅需少量的設定即可運作，程式碼僅90行
* **安全** - 自行部屬至Google Apps Script，不必擔心資料外洩的問題
* **免費** - Google Apps Script目前是免費使用的佛心服務
* **簡單** - 無須電腦瀏覽器即可自動幫你簽到，並由 Discord 或 Telegram 自動通知

## 配置
1. 進入[Google Apps Script](https://script.google.com/home/start)，新增專案，名稱可自訂。
2. 選擇編輯器，貼上程式碼( [Discord版](https://github.com/canaria3406/skport-auto-sign/blob/main/src/main-discord.gs) / ~~Telegram版~~ )，並參考下述說明配置config檔，完成後儲存。
3. 在上方選擇main、點選上方的[**執行**]，並授予權限，確認配置是否正確(開始執行>執行完畢)。
4. 在左側選擇觸發條件，新增觸發條件
   選擇您要執行的功能: main
   選取活動來源: 時間驅動
   選取時間型觸發條件類型: 日計時器
   選取時段: 自行選擇，建議選擇0900~1500之離峰任意時段

## config檔設定

```javascript
const profiles = [
  {
    SK_OAUTH_CRED_KEY: "", // your skport SK_OAUTH_CRED_KEY in cookie
    id: "", // your Endfield game id
    server: "2", // Asia=2 Americas/Europe=3
    language: "en", // english=en 日本語=ja 繁體中文=zh_Hant 简体中文=zh_Hans 한국어=ko Русский=ru_RU
    accountName: "YOUR NICKNAME"
  }
];
```

<details>
<summary><b>SKPORT 設定</b></summary>

1. **SK_OAUTH_CRED_KEY** - 請填入SKPORT簽到頁面的cred

   進入[SKPORT簽到頁面](https://game.skport.com/endfield/sign-in)後，按F12進入console，
   貼上以下程式碼後執行即可取得cred，複製cred並填入"括號內"。
   ```javascript
   function getCookie(name) {
   const value = `; ${document.cookie}`;
   const parts = value.split(`; ${name}=`);
   if (parts.length === 2) return parts.pop().split(';').shift();
   }

   let cred = 'Error';
   if (document.cookie.includes('SK_OAUTH_CRED_KEY=')) {
   cred = `${getCookie('SK_OAUTH_CRED_KEY')}`;
   }

   let ask = confirm(cred + '\n\nPress enter, then paste the token into your Google Apps Script Project');
   let msg = ask ? cred : 'Cancel';
   ```

2. **id**

   請在此輸入您的明日方舟：終末地遊戲ID。
   (應為數字)

3. **server**

   請在此輸入您的明日方舟：終末地遊戲伺服器。
   若您在亞洲伺服器，請輸入 `2`，
   若您在美洲/歐洲伺服器，請輸入 `3`。

4. **language**

   請在此輸入您的明日方舟：終末地遊戲語言。
   若您使用英文，請輸入 `en`，
   若您使用日文，請輸入 `ja`，
   若您使用繁體中文，請輸入 `zh_Hant`，
   若您使用簡體中文，請輸入 `zh_Hans`，
   若您使用韓文，請輸入 `ko`，
   若您使用俄文，請輸入 `ru_RU`。

5. **accountName** - 請輸入您的自訂暱稱

   請在此輸入您的自訂SKPORT或遊戲內暱稱。

</details>

<details>
<summary><b>discord 通知設定 (適用於 <a href="https://github.com/canaria3406/skport-auto-sign/blob/main/src/main-discord.gs">Discord版</a>)</b></summary>

```javascript
const discord_notify = true
const myDiscordID = "20000080000000040"
const discordWebhook = "https://discord.com/api/webhooks/1050000000000000060/6aXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXnB"
```

1. **discord_notify**

   是否要進行Discord的自動簽到通知。
   若要進行自動簽到通知則為true，若不要請填入false。

2. **myDiscordID** - 請填入自己的 Discord ID

   如果希望在執行失敗時被tag，請填入自己的 Discord ID。
   你的 Discord ID 看起來會像`23456789012345678`，複製ID並填入"括號內"即可。
   Discord ID 取得方法可參考[此篇文章](https://support.discord.com/hc/en-us/articles/206346498)。
   若您不希望被tag，請讓"括號內"保持空白。

3. **discordWebhook** - 請填入發送通知的伺服器頻道之 Discord Webhook

   Discord Webhook 建立方式可參考[此篇文章](https://support.discord.com/hc/en-us/articles/228383668)。
   當你建立 Discord Webhook 後，您會取得 Discord Webhook 網址，看起來會像`https://discord.com/api/webhooks/1234567890987654321/PekopekoPekopekoPekopeko06f810494a4dbf07b726924a5f60659f09edcaa1`。
   複製 Webhook 網址 並填入"括號內"即可。

</details>

<details>
<summary><b>telegram 通知設定 (適用於 <a href="https://github.com/canaria3406/skport-auto-sign/blob/main/src/main-telegram.gs">Telegram版</a>)</b></summary>

```javascript
const telegram_notify = true
const myTelegramID = "1XXXXXXX0"
const telegramBotToken = "6XXXXXXXXX:AAAAAAAAAAXXXXXXXXXX8888888888Peko"
```

1. **telegram_notify**

   是否要進行Telegram的自動簽到通知。若要進行自動簽到通知則為true，若不要請填入false。

2. **myTelegramID** - 請填入您的 Telegram ID.

   向 [@IDBot](https://t.me/myidbot) 傳送 `/getid` 指令以取得您的 Telegram ID，
   你的 Telegram ID 看起來會像`123456780`，複製並填入"括號內"即可。

3. **telegramBotToken** - 請填入您的 Telegram Bot Token.

   向 [@BotFather](https://t.me/botfather) 傳送 `/newbot` 指令以建立新的 Telegram Bot。
   當你建立 Telegram Bot 後，您會取得 Telegram Bot Token，看起來會像`110201543:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw`。
   複製Token並填入"括號內"即可。
   你可以參考[此篇文章](https://core.telegram.org/bots/features#botfather)以獲得更詳細的說明。

</details>

## Demo
若自動簽到完成，則傳送 OK  
若今天已簽到過，則傳送通知。

![image](https://github.com/canaria3406/skport-auto-sign/blob/main/pic/01.png)

## Changelog
2026-01-29 專案公開
2026-02-14 修正錯誤，感謝 Keit(@keit32) 的協助
