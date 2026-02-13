const profiles = [
  {
    SK_OAUTH_CRED_KEY: "", // your skport SK_OAUTH_CRED_KEY in cookie
    SK_TOKEN_CACHE_KEY: "", // your SK_TOKEN_CACHE_KEY in localStorage
    id: "", // your Endfield game id
    server: "2", // Asia=2 Americas/Europe=3
    language: "en", // english=en 日本語=ja 繁體中文=zh_Hant 简体中文=zh_Hans 한국어=ko Русский=ru_RU
    accountName: "YOUR NICKNAME"
  }
];

const telegram_notify = false
const myTelegramID = ""
const telegramBotToken = ""

/** The above is the config. Please refer to the instructions on https://github.com/canaria3406/skport-auto-sign for configuration. **/
/** The following is the script code. Please DO NOT modify. **/

const urlDict = {
  Endfield: 'https://zonai.skport.com/web/v1/game/endfield/attendance',
};

const headerDict = {
  default: {
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0',
    'Referer': 'https://game.skport.com/',
    'platform': '3',
    'vName': '1.0.0',
    'Origin': 'https://game.skport.com',
    'Connection': 'keep-alive',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site',
    'Priority': 'u=0',
    'TE': 'trailers',
  },
}

function bytesToHex(bytes) {
  return bytes.map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0')).join('');
}

function generateSign(path, timestamp, token) {
  const headerObj = { platform: "3", timestamp, dId: "", vName: "1.0.0" };
  const stringToSign = path + timestamp + JSON.stringify(headerObj);
  const hmacHex = bytesToHex(Utilities.computeHmacSha256Signature(stringToSign, token));
  return bytesToHex(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, hmacHex));
}

async function main() {
  const messages = profiles.map(autoSignFunction);
  const skportResp = `${messages.join('\n\n')}`;
  if (telegram_notify && telegramBotToken && myTelegramID) {
    postWebhook(skportResp);
  }
}

function autoSignFunction({ SK_OAUTH_CRED_KEY, SK_TOKEN_CACHE_KEY, id, server, language = "en", accountName }) {
  const path = "/web/v1/game/endfield/attendance";
  const timestamp = String(Math.floor(Date.now() / 1000));
  const sign = generateSign(path, timestamp, SK_TOKEN_CACHE_KEY);

  const headers = {
    ...headerDict.default,
    cred: SK_OAUTH_CRED_KEY,
    "sk-game-role": `3_${id}_${server}`,
    "sk-language": language,
    timestamp,
    sign
  };

  const httpResponse = UrlFetchApp.fetch(urlDict.Endfield, { method: 'POST', headers, muteHttpExceptions: true });
  const responseJson = JSON.parse(httpResponse.getContentText());

  let response = `Check-in completed for ${accountName}`;
  if (responseJson.code === 10000) {
    response += `\nEndfield: ⚠️ Token expired! \nPlease update SK_TOKEN_CACHE_KEY in your config.`;
  } else {
    response += `\nEndfield: ${responseJson.message}`;
  }

  return response;
}

function postWebhook(data) {
  let payload = JSON.stringify({
    'chat_id': myTelegramID,
    'text': data,
    'parse_mode': 'HTML'
  });

  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: payload,
    muteHttpExceptions: true
  };

  UrlFetchApp.fetch('https://api.telegram.org/bot' + telegramBotToken + '/sendMessage', options);
}
