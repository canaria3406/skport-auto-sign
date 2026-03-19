<h1 align="center">
    <img width="120" height="120" src="pic/logo.svg" alt=""><br>
    skport-auto-signin
</h1>

<p align="center">
    <img src="https://img.shields.io/github/license/NatsumeAoii/skport-auto-signin?style=flat-square" alt="">
    <img src="https://img.shields.io/github/stars/NatsumeAoii/skport-auto-signin?style=flat-square" alt="">
    <br><a href="/README_zh-tw.md">繁體中文</a>　<b>English</b>　<a href="/README_ru.md">Русский</a>
</p>

A stable, secure, and free script that automatically collects SKPORT daily check-in rewards.
Supports **Arknights: Endfield**. Supports multiple accounts.

## Features

- **Stable** — Minimal configuration. The recommended script includes retry logic, auto-refresh, and execution time guards.
- **Secure** — Self-deployed to your own Google Apps Script project. Credentials never leave your Google account.
- **Free** — Google Apps Script is a free Google service.
- **Simple** — Runs server-side without a browser. Sends results to Discord and/or Telegram automatically.

## Quick Start

### 1. Create a Google Apps Script project

Go to [Google Apps Script](https://script.google.com/home/start) and create a new project (name it anything).

### 2. Paste the script

Open the editor (Code.gs) and replace its contents with the code from
[`src/main-disc-tele.gs`](https://github.com/NatsumeAoii/skport-auto-signin/blob/main/src/main-disc-tele.gs).

> This is the recommended script. It supports both Discord and Telegram notifications,
> automatic token refresh, retries with exponential backoff, and execution time limits.

### 3. Configure

Edit the `profiles` array and notification settings at the top of the script.
See [Configuration](#configuration) below for details.

### 4. Run manually once

Select `main` from the function dropdown and click **Run**.
Grant the requested permissions when prompted. Confirm the execution log shows `Execution started > completed`.

![Run the script](https://github.com/NatsumeAoii/skport-auto-signin/blob/main/pic/02.png)

### 5. Set up a daily trigger

Click **Triggers** (clock icon) in the left sidebar, then **Add Trigger**:

![Trigger menu](https://github.com/NatsumeAoii/skport-auto-signin/blob/main/pic/03.png)
![Add trigger](https://github.com/NatsumeAoii/skport-auto-signin/blob/main/pic/04.png)

| Setting | Value |
|---------|-------|
| Function to run | `main` |
| Event source | Time-driven |
| Trigger type | Day timer |
| Time of day | Pick an off-peak hour (09:00–15:00 recommended) |

![Trigger config](https://github.com/NatsumeAoii/skport-auto-signin/blob/main/pic/05.png)

> **Alternative:** Run the `setupDailyTrigger()` function once from the editor instead of configuring the trigger manually. It creates a daily trigger for `main` at 09:00.

## Configuration

```javascript
const profiles = [
  {
    SK_OAUTH_CRED_KEY: "",   // Required — your SKPORT OAuth credential (from cookie)
    SK_TOKEN_CACHE_KEY: "",  // Optional — leave blank; the script acquires this automatically
    id: "",                  // Required — your Arknights: Endfield in-game ID (numeric)
    server: "2",             // Required — Asia = "2", Americas/Europe = "3"
    language: "en",          // Optional — en | ja | zh_Hant | zh_Hans | ko | ru_RU
    accountName: ""          // Required — a display name for notification messages
  }
];

// Discord notification config
const discord_notify = true;
const discordWebhook = "";    // Your Discord channel webhook URL

// Telegram notification config
const telegram_notify = false;
const myTelegramID = "";      // Your Telegram user ID
const telegramBotToken = "";  // Your Telegram bot token

// Display config (optional)
const botDisplayName = "Arknights Endfield Auto Sign-In";
const botAvatarUrl = "https://i.imgur.com/TguAOiA.png";
const embedTitle = "Endfield Daily Check-In";
```

> At least one notification channel (Discord or Telegram) must be fully configured. The script will exit early if neither is ready.

### Getting your SK_OAUTH_CRED_KEY

1. Open the [SKPORT check-in page](https://game.skport.com/endfield/sign-in) and log in.
2. Open the browser DevTools console (F12 → Console tab).
3. Paste and run the contents of [`src/getToken.js`](https://github.com/NatsumeAoii/skport-auto-signin/blob/main/src/getToken.js).
4. The credential is copied to your clipboard (or displayed in a prompt if clipboard access is denied).
5. Paste the value into the `SK_OAUTH_CRED_KEY` field in your script.

> **Security:** Treat `SK_OAUTH_CRED_KEY` like a password. Do not commit it to a public repository.
> For additional security, you can store credentials in GAS **Script Properties** and reference them
> with the `prop:` prefix (e.g., `SK_OAUTH_CRED_KEY: "prop:MY_CRED"`). The script resolves these
> automatically via `PropertiesService`.

<details>
<summary><b>Profile fields reference</b></summary>

| Field | Required | Description |
|-------|----------|-------------|
| `SK_OAUTH_CRED_KEY` | Yes | OAuth credential from the SKPORT cookie. Obtained via `getToken.js`. |
| `SK_TOKEN_CACHE_KEY` | No | Leave blank. The script auto-acquires and refreshes this token using your OAuth credential. |
| `id` | Yes | Your Arknights: Endfield in-game player ID (numeric). |
| `server` | Yes | `"2"` for Asia, `"3"` for Americas/Europe. |
| `language` | No | Display language: `en`, `ja`, `zh_Hant`, `zh_Hans`, `ko`, `ru_RU`. Defaults to `en`. |
| `accountName` | Yes | A nickname shown in notification messages. |

**Multiple accounts:** Add additional objects to the `profiles` array.

</details>

<details>
<summary><b>Discord notification setup</b></summary>

1. Set `discord_notify` to `true`.
2. **discordWebhook** — [Create a webhook](https://support.discord.com/hc/en-us/articles/228383668) for the channel where notifications should appear.

</details>

<details>
<summary><b>Telegram notification setup</b></summary>

1. Set `telegram_notify` to `true`.
2. **myTelegramID** — Send `/getid` to [@IDBot](https://t.me/myidbot) to get your numeric Telegram ID.
3. **telegramBotToken** — Send `/newbot` to [@BotFather](https://t.me/botfather) to create a bot and receive a token. [Detailed guide](https://core.telegram.org/bots/features#botfather).

</details>

## Demo

Successful check-in sends "OK". Already checked in today sends a notice.

![Demo screenshot](https://github.com/NatsumeAoii/skport-auto-singin/blob/main/pic/01.png)

## Script Variants

| File | Status | Description |
|------|--------|-------------|
| [`main-disc-tele.gs`](src/main-disc-tele.gs) | **Recommended** | Unified script with Discord + Telegram support, automatic token refresh, retry logic, execution time guards, and script-level locking. |
| [`main-discord.gs`](src/main-discord.gs) | Legacy | Discord-only, no auto-refresh, no retries. Kept for reference. |
| [`main-telegram.gs`](src/main-telegram.gs) | Legacy | Telegram-only, no auto-refresh, no retries. Kept for reference. |
| [`getToken.js`](src/getToken.js) | Utility | Browser console script to extract `SK_OAUTH_CRED_KEY` from the SKPORT cookie. |

## Folder Structure

```
skport-auto-singin/
├── pic/                     # Screenshots and logo used in documentation
│   ├── logo.svg
│   └── 01–05.png
├── src/
│   ├── main-disc-tele.gs    # Recommended: unified GAS script
│   ├── main-discord.gs      # Legacy: Discord-only variant
│   ├── main-telegram.gs     # Legacy: Telegram-only variant
│   └── getToken.js          # Browser utility for credential extraction
├── README.md                # English documentation
├── README_zh-tw.md          # Traditional Chinese documentation
├── README_ru.md             # Russian documentation
└── LICENSE                  # MIT
```

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| "User is not logged in" or "OAuth Key Expired" | `SK_OAUTH_CRED_KEY` has expired. | Re-login at the [check-in page](https://game.skport.com/endfield/sign-in) and re-run `getToken.js` to get a fresh credential. |
| "Token expired" (code 10000) but auto-refresh fails | Both the token and the OAuth credential have expired. | Same as above — re-acquire `SK_OAUTH_CRED_KEY`. |
| No notifications received | Notification channel not fully configured. | Ensure at least one channel's flag is `true` and all required fields (webhook URL or bot token + chat ID) are filled in. |
| "Another instance is running" | A previous execution is still active or the lock wasn't released. | Wait a few minutes. GAS script locks auto-expire. |
| Trigger doesn't fire | Trigger misconfigured or GAS quota exceeded. | Verify trigger exists in the Triggers panel. Check GAS [quotas](https://developers.google.com/apps-script/guides/services/quotas). |

## Changelog

- **2026-02-23** — Major overhaul: unified Discord and Telegram into `main-disc-tele.gs`, implemented rich embeds/HTML formatting, added automatic `SK_TOKEN_CACHE_KEY` acquisition and refresh, localized timestamps.
- **2026-02-14** — Bug fix. Thanks to Keit (@keit32).
- **2026-01-29** — Project launched.

## Credits

- **[canaria](https://github.com/canaria3406)** — Original author and creator of the Skport Auto Sign-In script.

## License

[MIT](LICENSE)
