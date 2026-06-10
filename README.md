<h1 align="center">
    <img width="120" height="120" src="pic/logo.svg" alt=""><br>
    skport-auto-sign
</h1>

<p align="center">
    <img src="https://img.shields.io/github/license/canaria3406/skport-auto-sign?style=flat-square" alt="">
    <img src="https://img.shields.io/github/stars/canaria3406/skport-auto-sign?style=flat-square" alt="">
    <br><a href="/README_zh-tw.md">繁體中文</a>　<b>English</b>　<a href="/README_ru.md">Русский</a>
</p>

A lightweight, secure, and free script that automatically collect SKPORT daily check in rewards.  
Supports **Arknights(TW server)** and **Arknights: Endfield**. Support multiple accounts.

## Features
* **Lightweight** - The script only requires minimal configuration and is only 250 lines of code.
* **Secure** - The script can be self-deployed to Google Apps Script, no worries about data leaks.
* **Free** - Google Apps Script is currently a free service.
* **Simple** - The script can run without a browser and will automatically notify you through Discord or Telegram.

## Setup
1. Go to [Google Apps Script](https://script.google.com/home/start) and create a new project with your custom name.
2. Select the editor and paste the code( [Discord version](https://github.com/canaria3406/skport-auto-sign/blob/main/src/main-discord.gs) / [Telegram version](https://github.com/canaria3406/skport-auto-sign/blob/main/src/main-telegram.gs) ). Refer to the instructions below to configure the config file and save it.
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
    account_token: "", // your skport account_token in cookie store
    arknights: true,
    endfield: true,
    language: "en" // english=en 日本語=ja 繁體中文=zh_Hant 简体中文=zh_Hans 한국어=ko Русский=ru_RU
  }
];
```

<details>
<summary><b>SKPORT settings</b></summary>

1. **account_token** - Please enter your long-term account token.  

   Go to the [Gryphline Cookie Store API page](https://web-api.gryphline.com/cookie_store/account_token) (make sure you are already logged into Gryphline / SKPORT on the same browser).
   You will see a JSON string similar to this:
   ```json
   {"code":0,"data":{"content":"YourAccountTokenHere"},"msg":""}
   ```
   Please copy the alphanumeric string after `content` (in the example above, `YourAccountTokenHere`) and fill it into the "quotes" of `account_token` in the configuration.

2. **arknights**

   Whether to enable auto check-in for **Arknights**. Set to `true` if you want to enable it, `false` otherwise.
   The script will automatically fetch and check-in for all Arknights characters under this account.

3. **endfield**

   Whether to enable auto check-in for **Arknights: Endfield**. Set to `true` if you want to enable it, `false` otherwise.
   By default, the script will automatically fetch and check-in for characters on "all servers" under this account (e.g., signing in for both Asia and Americas/Europe servers simultaneously).
   If you only want to sign in for specific servers, you can change this field to an array format, for example: `endfield: [2]` (only sign in for Asia server), or `endfield: [3]` (only sign in for Americas/Europe server).

4. **language**

   Please enter your Arknights: Endfield game language here.  
   If you're using english, please enter `en`,  
   If you're using 日本語, please enter `ja`,  
   If you're using 繁體中文, please enter `zh_Hant`,  
   If you're using 简体中文, please enter `zh_Hans`,  
   If you're using 한국어, please enter `ko`,  
   If you're using Русский, please enter `ru_RU`.

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
If you have already check in today, it will give a notify.

![image](https://github.com/canaria3406/skport-auto-sign/blob/main/pic/01.png)

## Changelog
2026-01-29 Project launched.  
2026-02-14 Bug fixed. Thanks to Keit(@keit32) for the help.
