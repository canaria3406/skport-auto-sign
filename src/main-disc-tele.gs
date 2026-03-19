const profiles = [
  {
    SK_OAUTH_CRED_KEY: "",  // your skport SK_OAUTH_CRED_KEY in cookie
    SK_TOKEN_CACHE_KEY: "", // [OPTIONAL] Leave blank — the script auto-acquires and refreshes this token
    id: "",                 // your Endfield in-game id
    server: "2",            // Asia=2  Americas/Europe=3
    language: "en",         // en | ja | zh_Hant | zh_Hans | ko | ru_RU
    accountName: ""
  }
];

// Discord notification config
const discord_notify = true;
const discordWebhook = "";

// Telegram notification config
const telegram_notify = false;
const myTelegramID = "";
const telegramBotToken = "";

// Display config
const botDisplayName = "Arknights Endfield Auto Sign-In";
const botAvatarUrl = "https://i.imgur.com/TguAOiA.png";
const embedTitle = "Endfield Daily Check-In";

/** You may modify above. The following is script code. **/

/* ── Constants ─────────────────────────────────────── */

const SIGN_PATH = "/web/v1/game/endfield/attendance";
const SIGN_URL = "https://zonai.skport.com" + SIGN_PATH;
const REFRESH_URL = "https://zonai.skport.com/web/v1/auth/refresh";
const CODE_TOKEN_EXPIRED = 10000;
const HTTP_TIMEOUT_MS = 30000;
const RETRY_COUNT = 2;
const RETRY_BASE_SLEEP_MS = 800;
const MAX_EXECUTION_MS = 3 * 60 * 1000; // #2: 3-minute hard ceiling
const LOCK_TIMEOUT_MS = 25000;

const BASE_HEADERS = {
  "Accept": "*/*",
  "Content-Type": "application/json",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0",
  "Referer": "https://game.skport.com/",
  "Origin": "https://game.skport.com",
  "platform": "3",
  "vName": "1.0.0",
};

const SIGN_HEADER_KEYS = ["platform", "timestamp", "dId", "vName"];

/* ── Shared State ──────────────────────────────────── */

// #1: Cached once in main(), passed down to avoid repeated IO
var _scriptProps = null;
var _executionStart = 0;

/* ── Utilities ─────────────────────────────────────── */

function logInfo() {
  var msg = Array.prototype.slice.call(arguments).join(" ");
  (typeof console !== "undefined" && console.log) ? console.log(msg) : Logger.log(msg);
}

function logError() {
  var msg = Array.prototype.slice.call(arguments).join(" ");
  (typeof console !== "undefined" && console.error) ? console.error(msg) : Logger.log("ERROR: " + msg);
}

/** #1: Resolves secret values. Uses cached _scriptProps instead of hitting IO per call. */
function resolveSecret(value) {
  if (!value) return "";
  if (typeof value === "string" && value.indexOf("prop:") === 0) {
    var key = value.slice(5).trim();
    if (!_scriptProps) _scriptProps = PropertiesService.getScriptProperties();
    return _scriptProps.getProperty(key) || "";
  }
  return value;
}

/** #2: Returns true if we've exceeded the 3-minute execution ceiling. */
function isTimeBudgetExhausted() {
  return (Date.now() - _executionStart) >= MAX_EXECUTION_MS;
}

function formatTimestamp() {
  var tz = Session.getScriptTimeZone();
  var now = new Date();
  var local = Utilities.formatDate(now, tz, "yyyy-MM-dd HH:mm:ss");
  var offset = Utilities.formatDate(now, tz, "XXX");
  return local + " (UTC" + offset + ")";
}

function safeJsonParse(text) {
  if (!text) return null;
  try { return JSON.parse(text); } catch (_) { return null; }
}

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ── Crypto ────────────────────────────────────────── */

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map(function (b) { return (b < 0 ? b + 256 : b).toString(16).padStart(2, "0"); })
    .join("");
}

function generateSign(path, method, headers, query, body, token) {
  var stringToSign = path + (method === "GET" ? (query || "") : (body || ""));
  if (headers.timestamp) stringToSign += String(headers.timestamp);

  var headerObj = {};
  for (var i = 0; i < SIGN_HEADER_KEYS.length; i++) {
    var key = SIGN_HEADER_KEYS[i];
    var val = headers[key] !== undefined ? headers[key] : (key === "dId" ? "" : undefined);
    if (val !== undefined) headerObj[key] = val;
  }
  stringToSign += JSON.stringify(headerObj);

  var hmacHex = bytesToHex(Utilities.computeHmacSha256Signature(stringToSign, token));
  return bytesToHex(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, hmacHex, Utilities.Charset.UTF_8));
}

/* ── Core Sign-In ──────────────────────────────────── */

function validateProfile(p) {
  if (!p) return "Profile is empty.";
  // SK_TOKEN_CACHE_KEY is no longer strictly required since we can auto-refresh it
  var required = ["accountName", "id", "server", "language", "SK_OAUTH_CRED_KEY"];
  var missing = required.filter(function (k) { return !p[k]; });
  return missing.length ? "Missing: " + missing.join(", ") : "";
}

/**
 * #13: Builds fresh headers with a current timestamp and re-signs them.
 *      Called on every retry attempt so the API never rejects stale signatures.
 */
function buildSignedHeaders(profile) {
  var timestamp = String(Math.floor(Date.now() / 1000));
  var headers = Object.assign({}, BASE_HEADERS, {
    cred: profile.SK_OAUTH_CRED_KEY,
    "sk-game-role": "3_" + profile.id + "_" + profile.server,
    "sk-language": profile.language,
    timestamp: timestamp
  });
  if (profile.dId) headers.dId = String(profile.dId);
  headers.sign = generateSign(SIGN_PATH, "POST", headers, "", "", profile.SK_TOKEN_CACHE_KEY);
  return headers;
}

function autoSign(profile) {
  var name = (profile && profile.accountName) || "Unknown";
  var cred = resolveSecret(profile.SK_OAUTH_CRED_KEY);
  var token = resolveSecret(profile.SK_TOKEN_CACHE_KEY);
  var p = Object.assign({}, profile, { SK_OAUTH_CRED_KEY: cred, SK_TOKEN_CACHE_KEY: token });
  var nowStamp = formatTimestamp();

  var err = validateProfile(p);
  if (err) return { name: name, status: "⚠️ Skipped — " + err, ok: false, time: nowStamp };

  // #2: Bail if we're about to exceed the execution budget
  if (isTimeBudgetExhausted()) {
    return { name: name, status: "⏱️ Skipped — execution time limit reached.", ok: false, time: nowStamp };
  }

  // If token is empty up front, try to refresh before entering the loop
  if (!p.SK_TOKEN_CACHE_KEY) {
    try {
      var preRefresh = UrlFetchApp.fetch(REFRESH_URL, {
        method: "get",
        headers: Object.assign({}, BASE_HEADERS, { cred: p.SK_OAUTH_CRED_KEY }),
        muteHttpExceptions: true,
        timeout: HTTP_TIMEOUT_MS
      });
      var preJson = safeJsonParse(preRefresh.getContentText());
      if (preJson && preJson.code === 0 && preJson.data && preJson.data.token) {
        p.SK_TOKEN_CACHE_KEY = preJson.data.token;
        logInfo("Token acquired automatically for", name);
      } else {
        return { 
          name: name, 
          status: "⚠️ OAuth Key Expired!\nPlease re-login manually to get a new SK_OAUTH_CRED_KEY:\n\nhttps://game.skport.com/endfield/sign-in\n\nScript: https://github.com/NatsumeAoii/skport-auto-signin/blob/main/src/getToken.js", 
          ok: false, 
          time: nowStamp 
        };
      }
    } catch (e) {
      return { name: name, status: "❌ Token refresh request failed — " + (e.message || e), ok: false, time: nowStamp };
    }
  }

  // #13: Sign-and-retry loop — timestamp & HMAC are regenerated per attempt
  var lastErr = null;
  for (var attempt = 0; attempt <= RETRY_COUNT; attempt++) {
    // #2: Check budget before each retry
    if (attempt > 0 && isTimeBudgetExhausted()) {
      return { name: name, status: "⏱️ Retry aborted — execution time limit reached.", ok: false, time: nowStamp };
    }

    var headers = buildSignedHeaders(p);

    try {
      var res = UrlFetchApp.fetch(SIGN_URL, {
        method: "post",
        headers: headers,
        muteHttpExceptions: true,
        followRedirects: false,            // #15: prevent redirect-based token leaks
        validateHttpsCertificates: true,
        timeout: HTTP_TIMEOUT_MS
      });

      var httpCode = res.getResponseCode();

      // #15: Treat unexpected redirects as errors instead of following them
      if (httpCode >= 300 && httpCode < 400) {
        return { name: name, status: "⚠️ Unexpected redirect (HTTP " + httpCode + ")", ok: false, time: nowStamp };
      }

      var json = safeJsonParse(res.getContentText());

      if (!json) {
        return { name: name, status: "❌ Non-JSON response (HTTP " + httpCode + ")", ok: false, time: nowStamp };
      }

      var isExpired = json.code === CODE_TOKEN_EXPIRED;

      // # Auto-Refresh Logic
      // If the token is expired (or empty initially), try to fetch a new one
      if ((isExpired || !p.SK_TOKEN_CACHE_KEY) && attempt < RETRY_COUNT) {
        var refreshRes = UrlFetchApp.fetch(REFRESH_URL, {
          method: "get",
          headers: Object.assign({}, BASE_HEADERS, { cred: p.SK_OAUTH_CRED_KEY }),
          muteHttpExceptions: true,
          timeout: HTTP_TIMEOUT_MS
        });
        var refreshJson = safeJsonParse(refreshRes.getContentText());
        
        if (refreshJson && refreshJson.code === 0 && refreshJson.data && refreshJson.data.token) {
          p.SK_TOKEN_CACHE_KEY = refreshJson.data.token;
          
          // If the token storage was configured via script properties, persist the new one
          if (profile.SK_TOKEN_CACHE_KEY && profile.SK_TOKEN_CACHE_KEY.indexOf("prop:") === 0) {
            _scriptProps.setProperty(profile.SK_TOKEN_CACHE_KEY.slice(5).trim(), p.SK_TOKEN_CACHE_KEY);
          }
          
          logInfo("Token refreshed automatically for", name);
          continue; // Loops to next attempt using the newly acquired token
        }
      }

      var msg = json.message || "Unknown response";
      if (msg === "User is not logged in") {
        msg += " or your OAuth key is expired!\nPlease re-login manually to get a new SK_OAUTH_CRED_KEY:\n\nhttps://game.skport.com/endfield/sign-in\n\nScript: https://github.com/NatsumeAoii/skport-auto-signin/blob/main/src/getToken.js";
      }

      var status = isExpired
        ? "⚠️ OAuth Key Expired!\nPlease re-login manually to get a new SK_OAUTH_CRED_KEY:\n\nhttps://game.skport.com/endfield/sign-in\n\nScript: https://github.com/NatsumeAoii/skport-auto-signin/blob/main/src/getToken.js"
        : msg;
      var isOk = !isExpired && json.message === "OK";

      return { name: name, status: status, ok: isOk, time: nowStamp };
    } catch (e) {
      lastErr = e;
      logError("Sign-in attempt", String(attempt + 1), "for", name, "failed:", e.message || e);
      if (attempt < RETRY_COUNT) {
        Utilities.sleep(RETRY_BASE_SLEEP_MS * Math.pow(2, attempt));
      }
    }
  }

  return { name: name, status: "❌ Request failed — " + ((lastErr && lastErr.message) ? lastErr.message : lastErr), ok: false, time: nowStamp };
}

/* ── Notifications ─────────────────────────────────── */

function buildDiscordEmbeds(results) {
  var hasError = results.some(function (r) { return !r.ok; });
  var color = hasError ? 0xED4245 : 0x57F287;

  var fields = results.map(function (r) {
    var icon = r.ok ? "✅" : "⚠️";
    return {
      name: icon + "  " + r.name,
      value: "```\n" + r.status + "\n```",
      inline: false
    };
  });

  return [{
    title: embedTitle,
    color: color,
    fields: fields,
    footer: { text: results[0].time },
  }];
}

function postDiscord(results) {
  var webhook = resolveSecret(discordWebhook);
  if (!webhook) return;

  try {
    UrlFetchApp.fetch(webhook, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        username: botDisplayName,
        avatar_url: botAvatarUrl,            // #23: configurable avatar
        embeds: buildDiscordEmbeds(results)
      }),
      muteHttpExceptions: true,
      timeout: HTTP_TIMEOUT_MS
    });
  } catch (e) {
    logError("Discord notification failed:", e.message || e);
  }
}

function buildTelegramHtml(results) {
  var lines = ["<b>" + escapeHtml(embedTitle) + "</b>", ""];
  results.forEach(function (r) {
    var icon = r.ok ? "✅" : "⚠️";
    lines.push(icon + " <b>Account :</b> " + escapeHtml(r.name));
    lines.push("    " + escapeHtml(r.status));
    lines.push("");
  });
  lines.push("<i>" + escapeHtml(results[0].time) + "</i>");
  return lines.join("\n");
}

function postTelegram(results) {
  var tgToken = resolveSecret(telegramBotToken);
  var tgChatId = resolveSecret(myTelegramID);
  if (!tgToken || !tgChatId) return;

  try {
    UrlFetchApp.fetch("https://api.telegram.org/bot" + tgToken + "/sendMessage", {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        chat_id: tgChatId,
        text: buildTelegramHtml(results),
        parse_mode: "HTML"
      }),
      muteHttpExceptions: true,
      timeout: HTTP_TIMEOUT_MS
    });
  } catch (e) {
    logError("Telegram notification failed:", e.message || e);
  }
}


/* ── Entry Point ───────────────────────────────────── */

function main() {
  _executionStart = Date.now(); // #2: start the clock

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(LOCK_TIMEOUT_MS)) {
    logInfo("Another instance is running. Exiting.");
    return;
  }

  try {
    // #1: Pre-cache Script Properties for the entire run
    _scriptProps = PropertiesService.getScriptProperties();

    if (!Array.isArray(profiles) || profiles.length === 0) {
      logInfo("No profiles configured.");
      return;
    }

    // #7: Validate that at least one notification channel is fully configured
    var discordReady = discord_notify && resolveSecret(discordWebhook);
    var telegramReady = telegram_notify && resolveSecret(telegramBotToken) && myTelegramID;
    if (!discordReady && !telegramReady) {
      logInfo("No notification channels configured. Enable discord_notify or telegram_notify and provide credentials.");
      return;
    }

    var results = profiles.map(autoSign);

    if (discordReady) postDiscord(results);
    if (telegramReady) postTelegram(results);

    var elapsed = ((Date.now() - _executionStart) / 1000).toFixed(1);
    logInfo("Completed in " + elapsed + "s — " + String(results.length) + " profile(s) processed.");
  } finally {
    lock.releaseLock();
  }
}

/* ── Trigger Setup (run once manually) ─────────────── */

function setupDailyTrigger() {
  var fn = "main";
  ScriptApp.getProjectTriggers()
    .filter(function (t) { return t.getHandlerFunction() === fn; })
    .forEach(function (t) { ScriptApp.deleteTrigger(t); });

  ScriptApp.newTrigger(fn).timeBased().everyDays(1).atHour(9).create();
  logInfo("Daily trigger created for", fn);
}