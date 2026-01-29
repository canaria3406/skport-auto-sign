<h1 align="center">
    <img width="120" height="120" src="pic/logo.svg" alt=""><br>
    skport-auto-sign
</h1>

<p align="center">
    <img src="https://img.shields.io/github/license/canaria3406/skport-auto-sign?style=flat-square" alt="">
    <img src="https://img.shields.io/github/stars/canaria3406/skport-auto-sign?style=flat-square" alt="">
</p>

A lightweight, secure, and free script that automatically collect SKPORT daily check in rewards.
Supports Arknights:Endfield. Support multiple accounts.

## Features
* **Lightweight** - The script only requires minimal configuration and is only 90 lines of code.
* **Secure** - The script can be self-deployed to Google Apps Script, no worries about data leaks.
* **Free** - Google Apps Script is currently a free service.
* **Simple** - The script can run without a browser and will automatically notify you through Discord or Telegram(future).

## Setup
1. Go to [Google Apps Script](https://script.google.com/home/start) and create a new project with your custom name.
2. Select the editor and paste the code( [Discord version](https://github.com/canaria3406/skport-auto-sign/blob/main/src/main-discord.gs) / ~~Telegram version~~ ). Refer to the instructions below to configure the config file and save it.
3. Select "main" and click the "Run" button at the top.
   Grant the necessary permissions and confirm that the configuration is correct (Execution started > completed).
4. Click the trigger button on the left side and add a new trigger.
   Select the function to run: main
   Select the event source: Time-driven
   Select the type of time based trigger: Day timer
   Select the time of day: recommended to choose any off-peak time between 0900 to 1500.

## Configuration

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
<summary><b>SKPORT settings</b></summary>

1. **SK_OAUTH_CRED_KEY** - Please enter the cred for SKPORT check-in page.

   After entering the [SKPORT check-in page](https://game.skport.com/endfield/sign-in), press F12 to enter the console.
   Paste the following code and run it to get the cred. Copy the cred and fill it in "quotes".
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

   Please enter your Arknights:Endfield game ID here. (must be number)

3. **server**

   Please enter your Arknights:Endfield game server here.  
   If you're in Asia server, please enter `2`,  
   If you're in Americas/Europe server, please enter `3`.

4. **language**

   Please enter your Arknights:Endfield game language here.  
   If you're using english, please enter `en`,  
   If you're using 日本語, please enter `ja`,  
   If you're using 繁體中文, please enter `zh_Hant`,  
   If you're using 简体中文, please enter `zh_Hans`,  
   If you're using 한국어, please enter `ko`,  
   If you're using Русский, please enter `ru_RU`.

5. **accountName** - Please enter your customized nickname.

   Please enter your customized SKPORT or in-game nickname here.

</details>

<details>
<summary><b>discord notify settings (only for <a href="https://github.com/canaria3406/skport-auto-sign/blob/main/src/main-discord.gs">Discord version</a>)</b></summary>

```javascript
const discord_notify = true
const myDiscordID = "20000080000000040"
const discordWebhook = "https://discord.com/api/webhooks/1050000000000000060/6aXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXnB"
```

1. **discord_notify**

   Whether to enable Discord notify.
   If you want to enable auto check-in notify, set it to true. If not, please set it to false.

2. **myDiscordID** - Please enter your Discord user ID.

   Whether you want to be ping when there is an unsuccessful check-in.
   Copy your Discord user ID which like `23456789012345678` and fill it in "quotes".
   You can refer to [this article](https://support.discord.com/hc/en-us/articles/206346498) to find your Discord user ID.
   If you don't want to be pinged, leave the "quotes" empty.

3. **discordWebhook** - Please enter the Discord webhook for the server channel to send notify.

   You can refer to [this article](https://support.discord.com/hc/en-us/articles/228383668) to create a Discord webhook.
   Once you have finished creating the Discord webhook, you will receive your Discord webhook URL, which like `https://discord.com/api/webhooks/1234567890987654321/PekopekoPekopekoPekopeko06f810494a4dbf07b726924a5f60659f09edcaa1`.
   Copy the webhook URL and paste it in "quotes".

</details>

<details>
<summary><b>telegram notify settings (only for <a href="https://github.com/canaria3406/skport-auto-sign/blob/main/src/main-telegram.gs">Telegram version</a>)</b></summary>

```javascript
const telegram_notify = true
const myTelegramID = "1XXXXXXX0"
const telegramBotToken = "6XXXXXXXXX:AAAAAAAAAAXXXXXXXXXX8888888888Peko"
```

1. **telegram_notify**

   Whether to enable Telegram notify.
   If you want to enable auto check in notify, set it to true. If not, please set it to false.

2. **myTelegramID** - Please enter your Telegram ID.

   Use the `/getid` command to find your Telegram user ID by messaging [@IDBot](https://t.me/myidbot).
   Copy your Telegram ID which like `123456780` and fill it in "quotes".

3. **telegramBotToken** - Please enter your Telegram Bot Token.

   Use the `/newbot` command to create a new bot on Telegram by messaging [@BotFather](https://t.me/botfather).
   Once you have finished creating the bot, you will receive your Telegram Bot Token, which like `110201543:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw`.
   Copy your Telegram Bot Token and fill it in "quotes".
   For more detailed instructions, you can refer to [this article](https://core.telegram.org/bots/features#botfather).

</details>

## Demo
If the auto check in process is success, it will send "OK".
If you have already check in today, it will send "Traveler/Trailblazer/Captain, you've already checked in today"

## Changelog
2026-01-29 Project launched.
